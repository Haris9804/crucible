import { useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../animations/useReveal";

export default function RouteTransition({ children }) {
  const ref = useRef(null);
  const { pathname } = useLocation();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const el = ref.current;
      if (!el) return;

      // Reset any leftover transform
      gsap.set(el, {
        clearProps: "transform,opacity",
      });

      const tl = gsap.timeline();

      tl.from(el, {
        y: 40,
        scale: 0.985,
        skewX: 4,
        opacity: 0.15,
        duration: 0.5,
        ease: "power3.out",
      });

      tl.to(
        el,
        {
          opacity: 1,
          duration: 0.4,
          ease: "steps(6)",
        },
        0
      );

      // Clean inline styles after animation
      tl.set(el, {
        clearProps: "transform,opacity",
      });

      return () => {
        tl.kill();
      };
    },
    { dependencies: [pathname] }
  );

  return <div ref={ref}>{children}</div>;
}