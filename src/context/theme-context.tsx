"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "gaming";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark" | "gaming";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark" | "gaming">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("unigames_theme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      setThemeState("dark");
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "gaming");

    let activeTheme = theme;
    if (theme === "gaming") {
      activeTheme = "gaming";
      root.classList.add("gaming");
    } else if (theme === "light") {
      activeTheme = "light";
      root.classList.add("light");
    } else {
      activeTheme = "dark";
      root.classList.add("dark");
    }

    setResolvedTheme(activeTheme as any);
    localStorage.setItem("unigames_theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
