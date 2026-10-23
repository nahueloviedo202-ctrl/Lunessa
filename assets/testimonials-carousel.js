if (!customElements.get('testimonials-slider')) {
  customElements.define(
    'testimonials-slider',
    class TestimonialsSlider extends SliderComponent {
      constructor() {
        super();
        if (!this.slider || !this.nextButton) return;

        this.enableSliderLooping = this.dataset.loop === 'true';
        if (this.enableSliderLooping) {
          this.prevButton.removeAttribute('disabled');
          this.nextButton.removeAttribute('disabled');
        }

        this.slider.addEventListener('dragscroll:end', this.snapToNearestSlide.bind(this));

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.dataset.autoplay === 'true' && !reducedMotion) this.setAutoplay();
      }

      isAtStart() {
        return this.slider.scrollLeft <= 1;
      }

      isAtEnd() {
        return this.slider.scrollLeft + this.slider.clientWidth >= this.slider.scrollWidth - 1;
      }

      onButtonClick(event) {
        const name = event.currentTarget.name;
        if (this.enableSliderLooping && name === 'next' && this.isAtEnd()) {
          event.preventDefault();
          this.setSlidePosition(0);
        } else if (this.enableSliderLooping && name === 'previous' && this.isAtStart()) {
          event.preventDefault();
          this.setSlidePosition(this.slider.scrollWidth);
        } else {
          super.onButtonClick(event);
        }
      }

      snapToNearestSlide() {
        if (!this.sliderItemOffset) return;
        const page = Math.round(this.slider.scrollLeft / this.sliderItemOffset);
        this.setSlidePosition(page * this.sliderItemOffset);
      }

      setAutoplay() {
        this.autoplaySpeed = Number(this.dataset.speed) * 1000;
        this.addEventListener('mouseenter', this.pause.bind(this));
        this.addEventListener('mouseleave', this.play.bind(this));
        this.addEventListener('focusin', this.pause.bind(this));
        this.addEventListener('focusout', this.play.bind(this));
        this.play();
      }

      play() {
        clearInterval(this.autoplay);
        this.autoplay = setInterval(() => {
          const position = this.isAtEnd() ? 0 : this.slider.scrollLeft + this.sliderItemOffset;
          this.setSlidePosition(position);
        }, this.autoplaySpeed);
      }

      pause() {
        clearInterval(this.autoplay);
      }
    }
  );
}
