"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme, Theme } from "@/context/theme-context";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; icon: React.ReactNode; label: string }[] = [
    { id: "light", icon: <Sun className="w-4.5 h-4.5" />, label: "Light" },
    { id: "dark", icon: <Moon className="w-4.5 h-4.5" />, label: "Dark" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800/80 rounded-2xl relative select-none">
      {themes.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`relative px-3 py-2 text-xs font-outfit font-extrabold uppercase tracking-wider rounded-xl transition-colors cursor-pointer z-10 flex items-center gap-1.5 ${
              active ? "text-slate-950" : "text-slate-400 hover:text-white"
            }`}
            title={`Switch to ${t.label} mode`}
            aria-label={`Switch to ${t.label} mode`}
          >
            {active && (
              <motion.span
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-brand-amber rounded-xl -z-10 shadow-[0_0_8px_rgba(255,193,7,0.35)]"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
