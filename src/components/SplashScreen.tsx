"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, PieChart, DollarSign, Wallet, ShieldCheck } from "lucide-react";

type SplashScreenProps = {
  onFinish?: () => void;
  durationMs?: number;
};

export default function SplashScreen({
  onFinish,
  durationMs = 3500, // Slightly increased to allow for the smooth exit
}: SplashScreenProps) {
  const [show, setShow] = useState(true);
  
  // Logic to handle the exit sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, durationMs - 1000); // Start exit animation before unmounting

    const cleanupTimer = setTimeout(() => {
      onFinish?.();
    }, durationMs);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanupTimer);
    };
  }, [durationMs, onFinish]);

  const logo = "/icons/iconsplash.svg";

  // Floating icons configuration
  const floatingIcons = [
    { Icon: TrendingUp, delay: 0, x: -30, y: -20, color: "text-emerald-400" },
    { Icon: DollarSign, delay: 0.2, x: 35, y: -30, color: "text-yellow-400" },
    { Icon: PieChart, delay: 0.4, x: -25, y: 30, color: "text-blue-400" },
    { Icon: Wallet, delay: 0.6, x: 30, y: 25, color: "text-purple-400" },
    { Icon: ShieldCheck, delay: 0.8, x: 0, y: -40, color: "text-teal-400" },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden"
        >
          {/* BACKGROUND LAYERS */}
          
          {/* 1. Subtle Grid Pattern (Simulates Spreadsheet/Data) */}
          <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
               style={{ 
                 backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', 
                 backgroundSize: '24px 24px' 
               }} 
          />

          {/* 2. Abstract Financial Graph Line (Draws itself) */}
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-20">
            <motion.path
              d="M0,500 C150,500 150,400 300,400 C450,400 450,300 600,300 C750,300 750,150 900,150 L900,600 L0,600 Z"
              fill="url(#gradient)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* 3. Floating Finance Icons */}
          <div className="absolute inset-0 pointer-events-none">
            {floatingIcons.map(({ Icon, delay, x, y, color }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 0.4, 0],
                  scale: [0.5, 1, 0.8],
                  x: [`${x}%`, `${x + (index % 2 === 0 ? 5 : -5)}%`],
                  y: [`${y}%`, `${y - 10}%`],
                }}
                transition={{
                  duration: 3,
                  delay: delay,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${color}`}
              >
                <Icon size={32} strokeWidth={1.5} />
              </motion.div>
            ))}
          </div>

          {/* CENTERPIECE */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* The "Coin" / Logo Container */}
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              
              {/* Outer Glow Ring (Pulse) */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl"
              />

              {/* The Spinning Coin Effect */}
              <motion.div
                initial={{ rotateY: -180, scale: 0.5, opacity: 0 }}
                animate={{ 
                  rotateY: 0, 
                  scale: 1, 
                  opacity: 1,
                  rotateZ: [0, -5, 5, 0] // Subtle wobble at the end
                }}
                transition={{
                  duration: 1.2,
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                  delay: 0.2
                }}
                className="relative w-full h-full bg-white dark:bg-slate-900 rounded-full shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img 
                  src={logo} 
                  alt="Budgee Logo" 
                  className="w-3/5 h-3/5 object-contain drop-shadow-md"
                />
                
                {/* Shine effect passing over the coin */}
                <motion.div
                  initial={{ x: "-150%", opacity: 0 }}
                  animate={{ x: "150%", opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 rounded-full pointer-events-none"
                />
              </motion.div>
            </div>

            {/* Text & Loading Indicators */}
            <div className="mt-8 flex flex-col items-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400 tracking-tight"
              >
                Budgee
              </motion.h1>

              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100px", opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="h-1 mt-4 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ 
                    duration: 1.5, 
                    delay: 1.2, 
                    ease: "circOut" 
                  }}
                  className="h-full w-full bg-gradient-to-r from-blue-500 to-teal-500"
                />
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-widest"
              >
                Securing Data...
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}