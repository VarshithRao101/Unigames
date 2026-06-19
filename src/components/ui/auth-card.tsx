"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animate?: boolean;
}

export function AuthCard({ children, className, animate = true, ...props }: AuthCardProps) {
  const CardContent = (
    <div
      className={cn(
        "w-full max-w-md bg-white/70 dark:bg-slate-dark/40 backdrop-blur-xl border border-white/40 dark:border-slate-muted/20 shadow-premium p-8 rounded-3xl relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Decorative gradient glowing spots in background */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-amber/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-brand-dark/10 rounded-full blur-3xl pointer-events-none" />
      
      {children}
    </div>
  );

  if (!animate) return CardContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md flex justify-center"
    >
      {CardContent}
    </motion.div>
  );
}
