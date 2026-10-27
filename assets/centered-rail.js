// Rail built on Dawn's SliderComponent (global.js): keeps Dawn's scroll + arrow handling, marks the
// card closest to the centre of the viewport with data-state="centre" (so CSS can enlarge it) and
// plays muted videos only while they are on screen.
if (!customElements.get('centered-rail')) {
  customElements.define(
    'centered-rail',
    class CenteredRail extends SliderComponent {
      constructor() {
        super();
        if (!this.slider) return;

        this.updateCentre = this.updateCentre.bind(this);
        this.slider.addEventListener('scroll', this.updateCentre, { passive: true });
        window.addEventListener('resize', this.updateCentre, { passive: true });
        this.updateCentre();
        this.setupVideos();
      }

      updateCentre() {
        const slides = Array.from(this.slider.querySelectorAll('[id^="Slide-"]'));
        if (!slides.length) return;

        const centre = this.slider.scrollLeft + this.slider.clientWidth / 2;
        let closest = slides[0];
        let distance = Infinity;

        slides.forEach((slide) => {
          const slideCentre = slide.offsetLeft + slide.offsetWidth / 2;
          const current = Math.abs(slideCentre - centre);
          if (current < distance) {
            distance = current;
            closest = slide;
          }
        });

        slides.forEach((slide) => (slide.dataset.state = slide === closest ? 'centre' : 'off'));
      }

      setupVideos() {
        const videos = this.querySelectorAll('video');
        if (!videos.length || !('IntersectionObserver' in window)) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(({ target, isIntersecting }) => {
              if (isIntersecting && !reducedMotion.matches) {
                target.play().catch(() => {});
              } else {
                target.pause();
              }
            });
          },
          { threshold: 0.5 }
        );

        videos.forEach((video) => observer.observe(video));
      }
    }
  );
}
