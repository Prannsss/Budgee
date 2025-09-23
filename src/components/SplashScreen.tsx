"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// We attempt to use Framer Motion if present, but don't hard-require it.
// Using dynamic optional import to avoid breaking when it's not installed.

type SplashScreenProps = {
  onFinish?: () => void;
  durationMs?: number; // default ~1600ms
};

export default function SplashScreen({ onFinish, durationMs = 1600 }: SplashScreenProps) {
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      onFinish?.();
    }, durationMs + 200); // small buffer after animation

    return () => {
      clearTimeout(t);
    };
  }, [onFinish, durationMs]);

  if (!show) return null;

  const logo = "/icons/iconsplash.svg"; // Expected at public/icons/iconsplash.svg

  const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-white"
      role="status"
      aria-label="Loading Budgee"
    >
      {children}
    </div>
  );

  return (
    <Overlay>
      <motion.div
        initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
        animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
        transition={{ duration: durationMs / 1000, ease: "easeInOut" }}
        onAnimationComplete={() => {
          setShow(false);
          onFinish?.();
        }}
        className="w-[180px] h-[180px]"
      >
        <Image src={logo} alt="Budgee" width={180} height={180} priority />
      </motion.div>
    </Overlay>
  );
}
