if (!customElements.get('faq-scrollspy')) {
  customElements.define(
    'faq-scrollspy',
    class FaqScrollspy extends HTMLElement {
      connectedCallback() {
        this.scroller = this.querySelector('[data-faq-scroller]');
        this.links = Array.from(this.querySelectorAll('a[href^="#"]'));
        const targets = this.links
          .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
          .filter(Boolean);

        this.links.forEach((link) => link.addEventListener('click', () => this.setActive(link.hash)));

        if (!('IntersectionObserver' in window) || targets.length === 0) return;
        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) this.setActive(`#${entry.target.id}`);
            });
          },
          { rootMargin: '-30% 0px -60% 0px' }
        );
        targets.forEach((target) => this.observer.observe(target));
      }

      disconnectedCallback() {
        if (this.observer) this.observer.disconnect();
      }

      setActive(hash) {
        this.links.forEach((link) => {
          const isActive = link.hash === hash;
          link.classList.toggle('is-active', isActive);
          if (isActive) {
            link.setAttribute('aria-current', 'true');
            this.revealLink(link);
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }

      // On mobile the nav scrolls horizontally: keep the active pill in view.
      revealLink(link) {
        if (!this.scroller || this.scroller.scrollWidth <= this.scroller.clientWidth) return;
        this.scroller.scrollTo({ left: link.offsetLeft - 20, behavior: 'smooth' });
      }
    }
  );
}
