// Reusable GSAP animation hook (BOLD / cyberpunk intensity). Driven by
// data-attributes so pages stay declarative. Respects prefers-reduced-motion.
// Cleanup is automatic via useGSAP (reverts everything on unmount / re-run).
//
//   data-reveal             → snappy slide+scale in on mount (staggered group)
//   data-stagger-children   → staggers an element's direct children on scroll
//   data-reveal-scroll      → reveals the element when scrolled into view
//   data-glitch             → periodic RGB-split glitch burst (headings)
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Bold entrance: bigger travel + a scale "snap", fast power ease. No skew on
// content blocks — when a reveal re-fires rapidly (e.g. clicking NEXT through a
// module), a half-finished skew leaves the whole block looking slanted.
const FROM = { opacity: 0, y: 44, scale: 0.92 };
const REVEAL = { duration: 0.6, ease: 'power3.out', stagger: 0.09, overwrite: true };

// Periodic glitch burst on a heading element.
function glitch(el) {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.8, defaults: { ease: 'power1.inOut' } });
  tl.to(el, { duration: 0.07, skewX: 22, x: 3, textShadow: '3px 0 #ff00ff, -3px 0 #00fffc' })
    .to(el, { duration: 0.06, skewX: -16, x: -3, textShadow: '-3px 0 #ff00ff, 3px 0 #00fffc' })
    .to(el, { duration: 0.05, skewX: 8, x: 2, opacity: 0.7 })
    .to(el, { duration: 0.12, skewX: 0, x: 0, opacity: 1, textShadow: '0 0 8px rgba(0,255,65,0.55)' });
  return tl;
}

export function useReveal(scope, deps = []) {
  useGSAP(
    () => {
      if (reduced()) return;
      const ctx = scope.current;
      if (!ctx) return;

      const onMount = gsap.utils.toArray('[data-reveal]', ctx);
      if (onMount.length) gsap.from(onMount, { ...FROM, ...REVEAL });

      gsap.utils.toArray('[data-stagger-children]', ctx).forEach((el) => {
        if (!el.children.length) return;
        gsap.from(el.children, {
          ...FROM, ...REVEAL,
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });

      gsap.utils.toArray('[data-reveal-scroll]', ctx).forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 60, scale: 0.96, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });

      gsap.utils.toArray('[data-glitch]', ctx).forEach((el) => glitch(el));
    },
    { scope, dependencies: deps }
  );
}

export { reduced as prefersReducedMotion };
