if (!customElements.get('video-testimonials-grid')) {
  customElements.define(
    'video-testimonials-grid',
    class VideoTestimonialsGrid extends HTMLElement {
      connectedCallback() {
        this.videos = this.querySelectorAll('video');
        if (!this.videos.length || this.dataset.autoplay !== 'true') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        if (!('IntersectionObserver' in window)) {
          this.videos.forEach((video) => this.play(video));
          return;
        }

        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.play(entry.target);
            } else {
              entry.target.pause();
            }
          });
        });
        this.videos.forEach((video) => this.observer.observe(video));
      }

      disconnectedCallback() {
        if (this.observer) this.observer.disconnect();
      }

      play(video) {
        video.muted = true;
        const promise = video.play();
        if (promise) promise.catch(() => {});
      }
    }
  );
}
