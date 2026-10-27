// Centered "coverflow" variant of Dawn's SlideshowComponent (global.js): keeps Dawn's looping,
// scroll handling and aria-hidden management, never disables "next" (the neighbours are visible,
// so Dawn would think the last slide is already shown) and tags each slide with its position
// so CSS can scale/dim the neighbours.
if (!customElements.get('coverflow-slider')) {
  customElements.define(
    'coverflow-slider',
    class CoverflowSlider extends SlideshowComponent {
      constructor() {
        super();
        if (!this.slider || !this.nextButton) return;

        this.updateSlideStates();

        if (Shopify.designMode) {
          document.addEventListener('shopify:block:select', (event) => {
            const slide = event.target.closest('.slider__slide');
            if (!slide || !this.slider.contains(slide)) return;
            this.slider.scrollTo({ left: slide.offsetLeft - this.sliderItemsToShow[0].offsetLeft });
          });
        }
      }

      update() {
        super.update();
        if (!this.nextButton) return;
        this.nextButton.removeAttribute('disabled');
        this.updateSlideStates();
      }

      updateSlideStates() {
        if (!this.sliderItemsToShow?.length) return;
        const current = this.currentPage - 1;

        this.sliderItemsToShow.forEach((slide, index) => {
          let state = 'off';
          if (index === current) state = 'centre';
          else if (index === current - 1) state = 'prev';
          else if (index === current + 1) state = 'next';
          slide.dataset.state = state;
        });
      }
    }
  );
}
