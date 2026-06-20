// Bold app-wide page transition: a steppy "glitch-in" with movement on every
// route change. Respects reduced-motion (the tween is skipped).
import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '../animations/useReveal';

export default function RouteTransition({ children }) {
  const ref = useRef(null);
  const { pathname } = useLocation();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = ref.current;
      const tl = gsap.timeline();
      tl.from(el, { y: 40, scale: 0.985, skewX: 4, duration: 0.5, ease: 'power3.out' }, 0);
      tl.fromTo(el, { opacity: 0.15 }, { opacity: 1, duration: 0.4, ease: 'steps(6)' }, 0);
    },
    { dependencies: [pathname] }
  );

  return <div ref={ref}>{children}</div>;
}
