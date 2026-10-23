/**
 * Smoothly scrolls to in-page anchors (`#id`, or a full URL of the current page with a hash)
 * instead of jumping, leaving room for Dawn's sticky header.
 */
(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const normalizePath = (path) => path.replace(/\/+$/, '') || '/';

  function getTarget(link) {
    if (link.target && link.target !== '_self') return null;
    if (link.hasAttribute('download')) return null;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return null;
    }

    if (url.hash.length < 2) return null;
    if (url.origin !== window.location.origin) return null;
    if (normalizePath(url.pathname) !== normalizePath(window.location.pathname)) return null;
    if (url.search !== window.location.search) return null;

    const id = decodeURIComponent(url.hash.slice(1));
    return document.getElementById(id) || document.getElementsByName(id)[0] || null;
  }

  function getHeaderOffset(targetTop) {
    const header = document.querySelector('sticky-header');
    if (!header) return 0;

    const type = header.getAttribute('data-sticky-type');
    if (!type || type === 'none') return 0;
    // With "on scroll up" the header hides while scrolling down.
    if (type === 'on-scroll-up' && targetTop > window.scrollY) return 0;

    return header.getBoundingClientRect().height;
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href*="#"]');
    if (!link) return;

    const target = getTarget(link);
    if (!target) return;

    event.preventDefault();

    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: Math.max(targetTop - getHeaderOffset(targetTop), 0),
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });

    const hash = link.hash;
    if (window.location.hash !== hash) history.pushState(null, '', hash);
    if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
  });
})();
