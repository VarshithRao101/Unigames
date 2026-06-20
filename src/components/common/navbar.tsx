"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Gamepad2, Trophy, MessageSquareText, DoorOpen, Bell, User, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

const navItems = [
  { label: "Games", href: "/games", icon: Gamepad2 },
  { label: "Community", href: "/", icon: MessageSquareText },
  { label: "Leaderboard", href: "/leaderboards", icon: Trophy },
  { label: "Lobbies", href: "/rooms", icon: DoorOpen },
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
          ? "py-2.5 bg-slate-950/80 backdrop-blur-md border-b-3 border-black"
          : "py-3 bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 max-w-7xl">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-gradient-to-br from-brand-orange to-brand-neon p-px group-hover:shadow-[0_0_15px_rgba(255,107,0,0.4)] transition-all">
            <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-slate-950 border border-black">
               <span className="font-outfit text-sm font-black text-brand-orange">U</span>
            </div>
          </div>
          <span className="font-outfit text-base font-black uppercase tracking-tighter text-slate-50 group-hover:text-brand-orange transition-colors">
            UniGame
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-full border-2 border-black shadow-[2.5px_2.5px_0px_#000000]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2 font-outfit text-[11px] font-black uppercase tracking-widest transition-all ${
                  isActive ? "text-slate-950" : "text-slate-450 hover:text-slate-50"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navbar-pill"
                    className="absolute inset-0 rounded-full bg-brand-orange border border-black"
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
          <div className="hidden md:flex items-center gap-4 text-slate-450">
            <button className="hover:text-brand-orange transition-colors cursor-pointer">
               <Search className="h-5 w-5" />
            </button>
            <button className="relative hover:text-brand-orange transition-colors cursor-pointer">
               <Bell className="h-5 w-5" />
               <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-brand-orange animate-pulse" />
            </button>
          </div>

          <div className="h-6 w-[1.5px] bg-slate-800 hidden md:block" />

          {user ? (
            <Link href="/profile">
              <div className="flex items-center gap-3 bg-slate-900/40 p-1 rounded-full border-2 border-black hover:border-brand-orange pr-4 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer">
                <div className="h-8 w-8 rounded-full flex-shrink-0 aspect-square bg-gradient-to-tr from-brand-orange to-brand-neon border border-black flex items-center justify-center font-black text-slate-950 text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-outfit text-[10px] font-black uppercase tracking-widest text-slate-50">
                  {user.username}
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/auth/login" className="hidden sm:block">
              {/* User Profile */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/40 border-2 border-black hover:border-brand-orange transition-all cursor-pointer group relative shadow-[1.5px_1.5px_0px_#000000]">
                 <User className="h-5 w-5 text-slate-450 group-hover:text-brand-orange transition-colors" />
                 <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-black" />
              </div>
            </Link>
          )}

          {/* 🔴 LIVE indicator */}
          <div className="flex items-center gap-1.5 rounded-full border-2 border-danger/45 bg-danger/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(255,75,75,0.9)]" />
            <span className="font-outfit text-[10px] font-black uppercase tracking-[0.2em] text-danger">LIVE</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden h-8.5 w-8.5 flex items-center justify-center rounded-lg bg-slate-900/40 border-2 border-black text-slate-50 cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            className="lg:hidden border-t-3 border-black bg-slate-950/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 hover:bg-brand-orange/15 border-2 border-black hover:border-brand-orange/30 transition-all font-outfit text-sm font-black uppercase tracking-widest group shadow-[2px_2px_0px_#000000]"
                >
                  <item.icon className="h-5 w-5 text-slate-450 group-hover:text-brand-orange" />
                  <span className="text-slate-50">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
