"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Gamepad2, Trophy, MessageSquareText, DoorOpen, Bell, User, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Games", href: "/games", icon: Gamepad2 },
  { label: "Leaderboard", href: "/leaderboards", icon: Trophy },
  { label: "Lobbies", href: "/rooms", icon: DoorOpen },
  { label: "Community", href: "/chat", icon: MessageSquareText },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "py-3 bg-slate-dark/40 backdrop-blur-md border-b border-white/5"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 max-w-7xl">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-brand-orange to-brand-neon p-px group-hover:shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-dark">
               <span className="font-outfit text-xl font-black text-brand-orange">U</span>
            </div>
          </div>
          <span className="font-outfit text-2xl font-black uppercase tracking-tighter text-white group-hover:text-brand-orange transition-colors">
            UniGame
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 glass p-1 rounded-full border border-white/5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2 font-outfit text-[11px] font-black uppercase tracking-widest transition-all ${
                  isActive ? "text-slate-dark" : "text-slate-400 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navbar-pill"
                    className="absolute inset-0 rounded-full bg-brand-orange"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <button className="hover:text-brand-orange transition-colors">
               <Search className="h-5 w-5" />
            </button>
            <button className="relative hover:text-brand-orange transition-colors">
               <Bell className="h-5 w-5" />
               <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
            </button>
          </div>

          <div className="h-6 w-px bg-white/10 hidden md:block" />

          {user ? (
            <div className="flex items-center gap-3 bg-white/5 p-1 rounded-full border border-white/5 pr-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-orange to-brand-neon flex items-center justify-center font-black text-slate-950 text-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-outfit text-[10px] font-black uppercase tracking-widest text-white">
                {user.username}
              </span>
            </div>
          ) : (
            <Link href="/auth/login" className="hidden sm:block">
              {/* User Profile */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/40 transition-all cursor-pointer group relative">
                 <User className="h-5 w-5 text-slate-400 group-hover:text-brand-orange transition-colors" />
                 <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-slate-dark shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              </div>
            </Link>
          )}

          {/* 🔴 LIVE indicator */}
          <div className="flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(255,75,75,0.9)]" />
            <span className="font-outfit text-[10px] font-black uppercase tracking-[0.2em] text-danger">LIVE</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 bg-slate-dark/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-brand-orange/10 border border-white/5 hover:border-brand-orange/20 transition-all font-outfit text-sm font-black uppercase tracking-widest group"
                >
                  <item.icon className="h-5 w-5 text-slate-400 group-hover:text-brand-orange" />
                  <span className="text-white">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

