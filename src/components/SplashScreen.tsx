"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  Wallet, 
  ShieldCheck, 
  CreditCard, 
  Coins, 
  Banknote,
  ArrowRightLeft,
  PiggyBank
} from "lucide-react";

type SplashScreenProps = {
  onFinish?: () => void;
  durationMs?: number;
};

// Icon pool for randomization
const ICON_POOL = [
  TrendingUp, PieChart, DollarSign, Wallet, ShieldCheck, 
  CreditCard, Coins, Banknote, ArrowRightLeft, PiggyBank
];

type RandomIcon = {
  id: number;
  Icon: React.ElementType;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
};

export default function SplashScreen({
  onFinish,
  durationMs = 3500,
}: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [backgroundIcons, setBackgroundIcons] = useState<RandomIcon[]>([]);

  // 1. Handle Exit Logic
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), durationMs - 1000);
    const cleanup = setTimeout(() => onFinish?.(), durationMs);
    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, [durationMs, onFinish]);

  // 2. Generate Random Icons on Mount (Client-side only to avoid hydration mismatch)
  useEffect(() => {
    const colors = [
      "text-emerald-400", "text-blue-400", "text-purple-400", 
      "text-teal-400", "text-cyan-400", "text-indigo-400"
    ];

    const generateIcons = () => {
      // Create 15 random icons
      return Array.from({ length: 15 }).map((_, i) => {
        const Icon = ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)];
        
        // Random Position (0-100%)
        let top = Math.random() * 100;
        let left = Math.random() * 100;

        // Simple logic to keep center relatively clear for the logo
        // If the icon falls in the center 30% box, push it out
        if (top > 35 && top < 65 && left > 35 && left < 65) {
          if (Math.random() > 0.5) top = top < 50 ? 20 : 80;
          else left = left < 50 ? 20 : 80;
        }

        return {
          id: i,
          Icon,
          top,
          left,
          size: Math.random() * 20 + 24, // Size between 24px and 44px
          delay: Math.random() * 2,
          duration: Math.random() * 3 + 2, // Duration between 2s and 5s
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });
    };

    setBackgroundIcons(generateIcons());
  }, []);

  const logo = "/icons/iconsplash.svg";

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
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
               style={{ 
                 backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', 
                 backgroundSize: '30px 30px' 
               }} 
          />

          {/* Abstract Graph Line */}
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

          {/* RANDOMIZED FLOATING ICONS */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {backgroundIcons.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.3, 0], // Subtle flicker
                  scale: [0, 1, 0.8],
                  y: [0, -20, 0], // Float up and down
                }}
                transition={{
                  duration: item.duration,
                  delay: item.delay,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className={`absolute ${item.color}`}
                style={{
                  top: `${item.top}%`,
                  left: `${item.left}%`,
                }}
              >
                <item.Icon size={item.size} strokeWidth={1.5} />
              </motion.div>
            ))}
          </div>

          {/* MAIN CENTER CONTENT */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* Spinning Coin Container */}
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              {/* Outer Pulse */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl"
              />

              {/* The 3D Coin Flip */}
              <motion.div
                initial={{ rotateY: -180, scale: 0.5, opacity: 0 }}
                animate={{ 
                  rotateY: 0, 
                  scale: 1, 
                  opacity: 1,
                  rotateZ: [0, -5, 5, 0]
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
                
                {/* Shine Sweep */}
                <motion.div
                  initial={{ x: "-150%", opacity: 0 }}
                  animate={{ x: "150%", opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 rounded-full pointer-events-none"
                />
              </motion.div>
            </div>

            {/* Text Content */}
            <div className="mt-8 flex flex-col items-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400 tracking-tight"
              >
                Budgee
              </motion.h1>

              {/* Loading Bar */}
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
              
              {/* Updated Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-widest"
              >
                Loading...
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}