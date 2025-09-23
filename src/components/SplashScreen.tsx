"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SplashScreenProps = {
  onFinish?: () => void;
  durationMs?: number;
};

export default function SplashScreen({
  onFinish,
  durationMs = 3000,
}: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  useEffect(() => {
    // Generate particles for ambient effect
    const particleArray = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
    }));
    setParticles(particleArray);
  }, []);

  if (!show) return null;

  const logo = "/icons/iconsplash.svg";

  const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black overflow-hidden"
          role="status"
          aria-label="Loading Budgee"
        >
          {children}
          <span className="sr-only">Loading Budgee...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <Overlay>
      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: `${particle.x}vw`, 
              y: `${particle.y}vh`,
              scale: 0,
              opacity: 0
            }}
            animate={{ 
              x: [`${particle.x}vw`, `${particle.x + 20}vw`],
              y: [`${particle.y}vh`, `${particle.y - 30}vh`],
              scale: [0, 1.5, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              delay: particle.id * 0.1,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-500 dark:to-purple-500 rounded-full blur-sm"
          />
        ))}
      </div>

      {/* Rotating Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
          animate={{ 
            rotate: 360, 
            scale: [0.8, 1.2, 1],
            opacity: [0, 0.15, 0]
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="absolute w-[300px] h-[300px] border border-gray-200 dark:border-gray-800 rounded-full"
        />
        <motion.div
          initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
          animate={{ 
            rotate: -360, 
            scale: [0.8, 1.3, 1],
            opacity: [0, 0.1, 0]
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.5
          }}
          className="absolute w-[350px] h-[350px] border border-gray-200 dark:border-gray-800 rounded-full"
        />
      </div>

      {/* Main Logo Container */}
      <div className="relative">
        {/* Shadow/Glow Base */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            opacity: [0, 0.5, 0.3]
          }}
          transition={{
            duration: 1.5,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/30 dark:to-purple-400/30 rounded-full blur-2xl"
        />

        {/* Logo Wrapper with Complex Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ 
            scale: [0, 1.1, 1],
            rotate: [180, 0],
            opacity: [0, 1]
          }}
          transition={{
            duration: 1.2,
            ease: [0.34, 1.56, 0.64, 1],
            times: [0, 0.8, 1]
          }}
          className="relative w-[180px] h-[180px] flex items-center justify-center"
        >
          {/* Inner Glow Ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.05, 0.95, 1],
              opacity: [0, 0.8, 0.6, 0.4]
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 dark:from-blue-500/40 dark:to-purple-500/40 rounded-full blur-md"
          />

          {/* Logo with Reveal Animation */}
          <motion.div
            initial={{ 
              clipPath: "circle(0% at 50% 50%)",
              filter: "brightness(2) contrast(1.5)"
            }}
            animate={{ 
              clipPath: "circle(100% at 50% 50%)",
              filter: "brightness(1) contrast(1)"
            }}
            transition={{
              duration: 1,
              ease: [0.43, 0.13, 0.23, 0.96],
              delay: 0.3
            }}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            <img 
              src={logo} 
              alt="Budgee" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </motion.div>

          {/* Shimmer Effect */}
          <motion.div
            initial={{ x: "-200%", opacity: 0 }}
            animate={{ 
              x: "200%",
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              delay: 1.2
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/30 skew-x-12 pointer-events-none"
          />

          {/* Pulse Ring */}
          <motion.div
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ 
              scale: [1, 1.5, 2],
              opacity: [0.8, 0.4, 0]
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
              delay: 1.5,
              repeat: 1,
              repeatDelay: 0.5
            }}
            className="absolute inset-0 border-2 border-blue-400/50 dark:border-blue-500/50 rounded-full pointer-events-none"
          />
        </motion.div>

        {/* Brand Text (optional - appears after logo) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 1.5
          }}
          onAnimationComplete={() => {
            setTimeout(() => {
              setShow(false);
              onFinish?.();
            }, durationMs - 2300);
          }}
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 24 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
            />
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 2 }}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wider uppercase"
            >
              Budgee
            </motion.span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 24 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              className="h-0.5 bg-gradient-to-l from-blue-400 to-purple-400"
            />
          </div>
          
          {/* Loading Dots */}
          <div className="flex space-x-1 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                  delay: 2.2 + i * 0.15,
                  repeat: Infinity,
                }}
                className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Progress Bar (subtle) */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: durationMs / 1000,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 origin-left"
      />
    </Overlay>
  );
}