"use client";

import React from "react";
import { motion } from "framer-motion";

type SplashScreenProps = {
  onFinish?: () => void;
  durationMs?: number; // default ~1600ms
};

export default function SplashScreen({
  onFinish,
  durationMs = 1600,
}: SplashScreenProps) {
  const [show, setShow] = React.useState(true);

  if (!show) return null;

  const logo = "/icons/iconsplash.svg";

  const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black"
      role="status"
      aria-label="Loading Budgee"
    >
      {children}
      <span className="sr-only">Loading Budgee...</span>
    </div>
  );

  return (
    <Overlay>
      <div className="relative w-[180px] h-[180px] overflow-hidden">
        {/* Logo Reveal with Scale-up */}
        <motion.div
          initial={{
            clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", // hidden
            scale: 1,
          }}
          animate={{
            clipPath: [
              "polygon(0 0, 0 0, 0 100%, 0 100%)", // start hidden
              "polygon(0 0, 50% 10%, 50% 90%, 0 100%)", // diagonal wave
              "polygon(0 0, 100% 0, 100% 100%, 0 100%)", // fully revealed
            ],
            scale: [1, 1, 1.05], // scale up after reveal
          }}
          transition={{
            duration: durationMs / 1000 + 0.4, // add a bit extra for scale
            ease: [0.4, 0, 0.2, 1],
            times: [0, 0.7, 1], // reveal first, then scale up
          }}
          onAnimationComplete={() => {
            setShow(false);
            onFinish?.();
          }}
          className="absolute inset-0"
        >
          <img src={logo} alt="Budgee" className="w-full h-full" />
        </motion.div>

        {/* Glowing Sweep Effect (synced with scale-up) */}
        <motion.div
          initial={{ x: "-100%", y: "-100%", rotate: -20, opacity: 0.6 }}
          animate={{ x: "100%", y: "100%", opacity: 0 }}
          transition={{
            duration: durationMs / 1000 + 0.4, // matches reveal+scale
            ease: [0.4, 0, 0.2, 1],
            times: [0.2, 1], // shimmer happens during scale-up phase
          }}
          className="absolute inset-0 bg-gradient-to-br from-transparent via-white/70 to-transparent dark:via-white/40"
        />
      </div>
    </Overlay>
  );
}
