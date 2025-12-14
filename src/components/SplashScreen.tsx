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
      {/* Enhanced Ambient Particles with Depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: `${50 + particle.x}%`, 
              y: `${50 + particle.y}%`,
              scale: 0,
              opacity: 0
            }}
            animate={{ 
              x: [`${50 + particle.x}%`, `${50 + particle.x + 15}%`, `${50 + particle.x - 10}%`],
              y: [`${50 + particle.y}%`, `${50 + particle.y - 20}%`, `${50 + particle.y - 35}%`],
              scale: [0, 2, 1.5, 0],
              opacity: [0, 0.6, 0.4, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 4,
              ease: [0.43, 0.13, 0.23, 0.96],
              delay: particle.id * 0.15,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: particle.id % 2 === 0 
                ? 'radial-gradient(circle, rgba(96, 165, 250, 0.8) 0%, rgba(139, 92, 246, 0.4) 50%, transparent 70%)'
                : 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.4) 50%, transparent 70%)',
              filter: 'blur(2px)',
            }}
          />
        ))}
        
        {/* Additional floating orbs */}
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={`orb-${i}`}
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`,
              scale: 0
            }}
            animate={{ 
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              scale: [0, 1, 0.8, 0]
            }}
            transition={{
              duration: 6,
              ease: "easeInOut",
              delay: i * 0.4,
              repeat: Infinity,
            }}
            className="absolute w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>

      {/* Enhanced Rotating Rings with Gradient Borders */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ 
            rotate: 360, 
            scale: [0.5, 1.3, 1.1],
            opacity: [0, 0.4, 0.2, 0]
          }}
          transition={{
            duration: 2.5,
            ease: [0.43, 0.13, 0.23, 0.96],
            repeat: Infinity,
          }}
          className="absolute w-[280px] h-[280px] rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(96, 165, 250, 0.3), transparent)',
            filter: 'blur(2px)',
          }}
        />
        <motion.div
          initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ 
            rotate: -360, 
            scale: [0.5, 1.4, 1.2],
            opacity: [0, 0.3, 0.15, 0]
          }}
          transition={{
            duration: 3.5,
            ease: [0.43, 0.13, 0.23, 0.96],
            repeat: Infinity,
            delay: 0.3
          }}
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{
            background: 'conic-gradient(from 180deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
            filter: 'blur(2px)',
          }}
        />
        <motion.div
          initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ 
            rotate: 360, 
            scale: [0.5, 1.5, 1.3],
            opacity: [0, 0.25, 0.1, 0]
          }}
          transition={{
            duration: 4,
            ease: [0.43, 0.13, 0.23, 0.96],
            repeat: Infinity,
            delay: 0.6
          }}
          className="absolute w-[420px] h-[420px] rounded-full"
          style={{
            background: 'conic-gradient(from 90deg, transparent, rgba(236, 72, 153, 0.2), transparent)',
            filter: 'blur(3px)',
          }}
        />
      </div>

      {/* Main Logo Container */}
      <div className="relative">
        {/* Enhanced Shadow/Glow Base */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.4, 1.2, 1],
            opacity: [0, 0.8, 0.6, 0.4]
          }}
          transition={{
            duration: 2,
            ease: [0.34, 1.56, 0.64, 1]
          }}
          className="absolute -inset-12 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(236, 72, 153, 0.2) 100%)',
          }}
        />
        
        {/* Pulsing Secondary Glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 0.9],
            opacity: [0, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="absolute -inset-10 rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
          }}
        />

        {/* Enhanced Logo Wrapper with 3D Effect */}
        <motion.div
          initial={{ scale: 0, rotateY: -180, rotateZ: -90, opacity: 0 }}
          animate={{ 
            scale: [0, 1.15, 0.98, 1],
            rotateY: [-180, 0],
            rotateZ: [-90, 0],
            opacity: [0, 1]
          }}
          transition={{
            duration: 1.4,
            ease: [0.34, 1.56, 0.64, 1],
            times: [0, 0.6, 0.85, 1]
          }}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
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