"use client";
import React, { useEffect, useState, useRef } from "react";

interface ScrollFadeCoverProps {
  /** id of the section whose bottom triggers fade out */
  targetId: string;
  /** height of the gradient overlay */
  height?: number; // px
  /** viewport percentage (0-1) where fade starts (hero bottom crosses this line) */
  startViewportRatio?: number;
  /** additional viewport percentage distance over which fade completes */
  fadeViewportDistance?: number;
  className?: string;
}

/*
  Fixed bottom gradient overlay that hides (covers) the next section.
  It fades away as user scrolls near the end of the target section.
*/
export const ScrollFadeCover: React.FC<ScrollFadeCoverProps> = ({
  targetId,
  height = 240,
  startViewportRatio = 0.9,
  fadeViewportDistance = 0.25,
  className = ""
}) => {
  const [opacity, setOpacity] = useState(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const target = () => document.getElementById(targetId);

    const handle = () => {
      const el = target();
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const startLine = vh * startViewportRatio; // when hero bottom reaches this line, begin fade
      const distancePx = vh * fadeViewportDistance; // distance over which fade completes
      const bottom = rect.bottom; // bottom position of target relative to viewport

      if (bottom >= startLine) {
        // not yet reached start fade zone
        setOpacity(1);
      } else if (bottom <= startLine - distancePx) {
        // fully faded
        setOpacity(0);
      } else {
        const progress = (startLine - bottom) / distancePx; // 0..1
        setOpacity(1 - progress);
      }
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(handle);
    };

    handle();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handle);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetId, startViewportRatio, fadeViewportDistance]);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 scroll-fade-cover ${className}`.trim()}
      style={{ ['--sfc-height' as any]: `${height}px`, ['--sfc-opacity' as any]: opacity }}
      aria-hidden="true"
    >
      <div className="scroll-fade-cover-gradient" />
    </div>
  );
};

export default ScrollFadeCover;
