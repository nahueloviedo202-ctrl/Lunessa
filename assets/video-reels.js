if (!customElements.get('video-reels')) {
  customElements.define(
    'video-reels',
    class VideoReels extends HTMLElement {
      connectedCallback() {
        this.current = null;
        this.tiles = Array.from(this.querySelectorAll('[data-reel]'));
        this.tiles.forEach((tile) => this.setupTile(tile));
      }

      setupTile(tile) {
        const video = tile.querySelector('video');
        const button = tile.querySelector('[data-reel-toggle]');
        if (!video || !button) return;

        button.addEventListener('click', () => {
          if (video.paused) {
            const promise = video.play();
            if (promise) promise.catch(() => {});
          } else {
            video.pause();
          }
        });

        video.addEventListener('play', () => {
          if (this.current && this.current !== video) this.current.pause();
          this.current = video;
          this.setState(tile, video, button, true);
        });

        video.addEventListener('playing', () => {
          if (video.dataset.revealed === 'true') return;
          video.dataset.revealed = 'true';
          video.controls = true;
          video.removeAttribute('aria-hidden');
        });

        const onStop = () => {
          if (this.current === video) this.current = null;
          this.setState(tile, video, button, false);
        };
        video.addEventListener('pause', onStop);
        video.addEventListener('ended', onStop);
      }

      setState(tile, video, button, playing) {
        tile.classList.toggle('is-playing', playing);
        const label = playing ? this.dataset.pauseLabel : this.dataset.playLabel;
        button.setAttribute('aria-label', `${label}: ${video.getAttribute('aria-label') || ''}`.trim());
      }
    }
  );
}
