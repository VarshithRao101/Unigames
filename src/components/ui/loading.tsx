"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// --- PART 7.1: SKELETON LOADER ---
export function Skeleton({ className, count = 1 }: { className?: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-r from-slate-600/35 via-slate-600/60 to-slate-600/35 bg-[length:200%_100%] animate-[pulse_1.5s_infinite] rounded-2xl ${className}`}
          style={{ animationDuration: "1.5s" }}
        />
      ))}
    </>
  );
}

// --- PART 7.2: ROUTE/PAGE LOADER ---
export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-grey-light/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16 flex items-center justify-between">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-none stroke-[12] stroke-slate-dark animate-[spin_2s_linear_infinite]"
        >
          <circle cx="35" cy="40" r="22" stroke="#212529" />
          <circle cx="65" cy="40" r="22" stroke="#FFC107" />
          <path d="M35,62 C35,75 65,75 65,62" stroke="#212529" strokeLinecap="round" />
        </svg>
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="font-outfit font-extrabold text-xs uppercase tracking-widest text-slate-muted pl-0.5"
      >
        Syncing Game Frames...
      </motion.p>
    </div>
  );
}

// --- PART 7.3: ROUTE TRANSITION ANIMATOR ---
export function RouteTransition({ children }: { children: ReactNode }) {
  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: "easeIn" as const } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
}
