if (!customElements.get('ingredient-glossary')) {
  customElements.define(
    'ingredient-glossary',
    class IngredientGlossary extends HTMLElement {
      constructor() {
        super();
        this.update = this.update.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onBlockSelect = this.onBlockSelect.bind(this);
      }

      connectedCallback() {
        this.input = this.querySelector('[data-glossary-search]');
        this.filter = this.querySelector('[data-glossary-filter]');
        this.status = this.querySelector('[data-glossary-status]');
        this.empty = this.querySelector('[data-glossary-empty]');
        this.groups = [...this.querySelectorAll('[data-glossary-group]')];
        this.items = [...this.querySelectorAll('[data-glossary-item]')];
        this.letters = [...this.querySelectorAll('[data-glossary-letter]')];
        this.items.forEach((item) => {
          item.searchName = this.normalize(item.dataset.name);
        });

        this.input?.addEventListener('input', this.update);
        this.filter?.addEventListener('change', this.update);
        this.addEventListener('click', this.onClick);
        window.addEventListener('scroll', this.onScroll, { passive: true });
        if (window.Shopify?.designMode) document.addEventListener('shopify:block:select', this.onBlockSelect);

        this.update();
      }

      disconnectedCallback() {
        window.removeEventListener('scroll', this.onScroll);
        document.removeEventListener('shopify:block:select', this.onBlockSelect);
      }

      normalize(value) {
        return (value || '')
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .toLowerCase()
          .trim();
      }

      update() {
        const query = this.normalize(this.input?.value);
        const type = this.filter?.value || 'all';
        let shown = 0;

        this.items.forEach((item) => {
          const matches = item.searchName.includes(query) && (type === 'all' || item.dataset.type === type);
          item.hidden = !matches;
          if (matches) shown += 1;
        });

        this.groups.forEach((group) => {
          group.hidden = !group.querySelector('[data-glossary-item]:not([hidden])');
        });

        // Letters whose group is filtered out stay in place but become inactive.
        this.letters.forEach((letter) => {
          const group = this.querySelector(`[data-glossary-group="${letter.dataset.glossaryLetter}"]`);
          const disabled = !group || group.hidden;
          letter.toggleAttribute('data-disabled', disabled);
          if (disabled) {
            letter.setAttribute('aria-disabled', 'true');
            letter.setAttribute('tabindex', '-1');
          } else {
            letter.removeAttribute('aria-disabled');
            letter.removeAttribute('tabindex');
          }
        });

        if (this.empty) this.empty.hidden = shown > 0;
        if (this.status) {
          this.status.textContent = (this.dataset.statusTemplate || '')
            .replace('[shown]', shown)
            .replace('[total]', this.status.dataset.total);
        }

        this.updateCurrentLetter();
      }

      onClick(event) {
        if (event.target.closest('[data-glossary-clear]')) {
          this.input.value = '';
          this.update();
          this.input.focus();
          return;
        }

        const letter = event.target.closest('[data-glossary-letter]');
        if (letter) {
          // Handled here (not by the theme's anchor scroll) so the jump respects scroll-margin-top
          // and lands below the sticky header + letter index.
          event.preventDefault();
          const group = this.querySelector(`[data-glossary-group="${letter.dataset.glossaryLetter}"]`);
          if (letter.hasAttribute('data-disabled') || !group) return;
          const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          group.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
          history.replaceState(null, '', letter.hash);
          return;
        }

        const flip = event.target.closest('[data-glossary-flip]');
        if (flip) this.flip(flip.closest('.igl-card'));
      }

      flip(card) {
        const showBack = card.dataset.face !== 'back';
        card.dataset.face = showBack ? 'back' : 'front';
        card.querySelectorAll('[data-glossary-flip]').forEach((button) => {
          button.setAttribute('aria-expanded', String(showBack));
        });
        const target = card.querySelector(
          showBack ? '.igl-card__face--back [data-glossary-flip]' : '.igl-card__face--front [data-glossary-flip]'
        );
        target?.focus({ preventScroll: true });
      }

      onScroll() {
        if (this.scrollFrame) return;
        this.scrollFrame = requestAnimationFrame(() => {
          this.scrollFrame = null;
          this.updateCurrentLetter();
        });
      }

      updateCurrentLetter() {
        if (!this.letters.length) return;
        const visibleGroups = this.groups.filter((group) => !group.hidden);
        let current = visibleGroups[0];
        visibleGroups.forEach((group) => {
          // Same threshold a letter jump lands on, so the clicked letter becomes the current one.
          const offset = parseFloat(getComputedStyle(group).scrollMarginTop) || 0;
          if (group.getBoundingClientRect().top <= offset + 1) current = group;
        });
        if (current === this.currentGroup) return;
        this.currentGroup = current;

        this.letters.forEach((letter) => {
          const isCurrent = current && letter.dataset.glossaryLetter === current.dataset.glossaryGroup;
          if (!isCurrent) {
            letter.removeAttribute('aria-current');
            return;
          }
          letter.setAttribute('aria-current', 'true');
          // Keep the current letter visible when the index scrolls horizontally (mobile).
          const list = letter.closest('ul');
          if (list.scrollWidth > list.clientWidth) {
            list.scrollTo({ left: letter.offsetLeft - list.clientWidth / 2 + letter.clientWidth / 2, behavior: 'smooth' });
          }
        });
      }

      onBlockSelect(event) {
        if (!this.contains(event.target)) return;
        // Show the selected ingredient even if the current search or filter hides it.
        if (this.input) this.input.value = '';
        if (this.filter) this.filter.value = 'all';
        this.update();
      }
    }
  );
}
