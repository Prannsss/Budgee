"use client";
import React, { useRef, useEffect, ReactNode } from "react";
import clsx from "clsx";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number; // seconds
  distance?: number; // px translateY
  once?: boolean;
}

// Subtle fade + rise on enter
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className,
  delay = 0,
  distance = 16,
  once = true
}) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.setProperty("--fade-in-delay", `${delay}s`);
            el.classList.add("fade-in-visible");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            el.classList.remove("fade-in-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, once]);

  const style: React.CSSProperties = {
    ["--fade-in-distance" as any]: `${distance}px`
  };
  return (
    <div ref={ref as any} className={clsx("fade-in-element opacity-0", className)} style={style}>
      {children}
    </div>
  );
};

export default FadeIn;
