import { useEffect } from 'react';

/**
 * Site-wide scroll reveal for any element with a `data-reveal` attribute.
 * - Watches the DOM, so elements rendered later (API data, route changes) are picked up.
 * - Adds `ds-reveal-ready` to <html> only once running, so content is never hidden without JS.
 * - Respects prefers-reduced-motion (elements are shown immediately).
 * Optional per-element stagger: style={{ '--delay': '80ms' }}.
 */
export function useScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return undefined;

    root.classList.add('ds-reveal-ready');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    const observe = (node) => {
      if (!(node instanceof Element)) return;
      if (node.matches('[data-reveal]:not(.is-visible)')) io.observe(node);
      node.querySelectorAll?.('[data-reveal]:not(.is-visible)').forEach((el) => io.observe(el));
    };

    observe(document.body);
    const mo = new MutationObserver((mutations) => mutations.forEach((m) => m.addedNodes.forEach(observe)));
    mo.observe(document.body, { childList: true, subtree: true });

    // Fast scrolls can skip an element between frames; anything already scrolled past is shown too.
    let frame = 0;
    const revealPassed = () => {
      frame = 0;
      document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(revealPassed);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove('ds-reveal-ready');
    };
  }, []);
}
