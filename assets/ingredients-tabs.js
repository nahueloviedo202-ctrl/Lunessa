if (!customElements.get('ingredients-drag-scroll')) {
  customElements.define(
    'ingredients-drag-scroll',
    class IngredientsDragScroll extends HTMLElement {
      constructor() {
        super();
        this.dragThreshold = 5;
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onClick = this.onClick.bind(this);
        this.updateDraggable = this.updateDraggable.bind(this);
      }

      connectedCallback() {
        this.addEventListener('pointerenter', this.updateDraggable);
        this.addEventListener('pointerdown', this.onPointerDown);
        this.addEventListener('click', this.onClick, true);
        this.addEventListener('dragstart', (event) => event.preventDefault());
      }

      isScrollable() {
        return this.scrollWidth > this.clientWidth + 1;
      }

      updateDraggable() {
        this.classList.toggle('is-draggable', this.isScrollable());
      }

      onPointerDown(event) {
        // Touch and pen already scroll natively; only mouse needs dragging.
        if (event.pointerType !== 'mouse' || event.button !== 0 || !this.isScrollable()) return;

        this.startX = event.clientX;
        this.startScrollLeft = this.scrollLeft;
        this.pointerId = event.pointerId;
        this.isDragging = false;
        this.addEventListener('pointermove', this.onPointerMove);
        this.addEventListener('pointerup', this.onPointerUp);
        this.addEventListener('pointercancel', this.onPointerUp);
      }

      onPointerMove(event) {
        const distance = event.clientX - this.startX;

        if (!this.isDragging) {
          if (Math.abs(distance) < this.dragThreshold) return;
          this.isDragging = true;
          this.setPointerCapture(this.pointerId);
          this.classList.add('is-dragging');
        }

        this.scrollLeft = this.startScrollLeft - distance;
      }

      onPointerUp() {
        this.removeEventListener('pointermove', this.onPointerMove);
        this.removeEventListener('pointerup', this.onPointerUp);
        this.removeEventListener('pointercancel', this.onPointerUp);
        if (this.hasPointerCapture(this.pointerId)) this.releasePointerCapture(this.pointerId);
        this.classList.remove('is-dragging');
      }

      onClick(event) {
        // Swallow the click that ends a drag so it does not trigger links inside the cards.
        if (!this.isDragging) return;
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
      }
    }
  );
}
