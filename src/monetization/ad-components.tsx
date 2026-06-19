"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { isAdPlacementAllowed, AD_SLOTS_DIRECTORY } from "./ad-registry";
import { AdPlacement, AdCreative } from "./ad-types";
import { useAnalytics } from "./analytics";
import { Shield, Sparkles, ShoppingBag, CheckCircle, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";


interface AdWrapperProps {
  placement: AdPlacement;
  className?: string;
}

export function PlatformAdComponent({ placement, className }: AdWrapperProps) {
  const pathname = usePathname();
  const analytics = useAnalytics();
  const [isVisible, setIsVisible] = useState(false);

  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const config = AD_SLOTS_DIRECTORY[placement];
  const isAllowed = isAdPlacementAllowed(pathname || "");

  // Lazy loading using Intersection Observer to prevent render-blocking
  useEffect(() => {
    if (!isAllowed || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Simulate ad network call delay
          const timer = setTimeout(() => setLoaded(true), 600);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [pathname, isAllowed]);

  if (!isAllowed || !config) return null;

  const width = config.dimensions.width;
  const height = config.dimensions.height;

  const handleAdClick = () => {
    if (config.creativeFallback) {
      analytics.trackAdClick(config.slotId, config.creativeFallback.sponsorName);
      window.open(config.creativeFallback.targetUrl, "_blank");
    } else {
      analytics.trackAdClick(config.slotId, "AdNetwork-Click");
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`mx-auto bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden relative ${className || ""}`}
      style={{ 
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        minHeight: typeof height === "number" ? `${height}px` : "auto"
      }}
    >
      {!loaded ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-950/20 text-[10px] text-slate-600 font-mono tracking-widest font-bold">
          LOADING SPONSOR CONTENT...
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleAdClick}
          className="w-full h-full flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-900/60 transition-all group relative"
        >
          {/* Ad Label */}
          <span className="absolute top-1.5 right-3 text-[8px] font-black uppercase tracking-widest text-slate-650 bg-slate-950/30 px-1.5 py-0.5 rounded">
            Sponsored
          </span>

          {config.creativeFallback ? (
            <div className="flex justify-between items-center w-full gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.creativeFallback.imageUrl.substring(0, 2)}</span>
                <div className="text-left">
                  <h4 className="font-outfit font-black text-xs text-white uppercase tracking-wide group-hover:text-brand-amber transition-colors leading-none">
                    {config.creativeFallback.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">
                    Provided by {config.creativeFallback.sponsorName}
                  </p>
                </div>
              </div>

              {config.creativeFallback.ctaText && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="h-8 text-[9px] uppercase tracking-wider font-extrabold text-slate-950"
                >
                  {config.creativeFallback.ctaText}
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center text-center">
              <p className="font-outfit font-black text-[11px] text-slate-400 uppercase tracking-wide">
                Boost Your Platform Engagement
              </p>
              <p className="text-[9px] text-slate-600 font-semibold mt-0.5">
                Targeted Gaming Campaigns with UniGames Adsense Integration
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Sponsored Cards component (for community announcements, showcases, or category lists)
export function SponsoredContentCard({ 
  title, 
  sponsorName, 
  description, 
  ctaText, 
  targetUrl 
}: {
  title: string;
  sponsorName: string;
  description: string;
  ctaText: string;
  targetUrl: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between h-56 hover:border-brand-amber/35 transition-all">
      <span className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest bg-brand-amber/10 text-brand-amber px-2 py-0.5 rounded border border-brand-amber/25">
        Sponsored
      </span>
      <div>
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Featured Partner</span>
        <h4 className="font-outfit font-black text-base text-white mt-1 leading-snug">{title}</h4>
        <p className="text-[10px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">{description}</p>
      </div>

      <div className="flex justify-between items-center border-t border-slate-850 pt-3 mt-4">
        <span className="text-[9px] text-slate-500 font-bold">Partner: {sponsorName}</span>
        <a href={targetUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="primary" className="h-8 text-[9px] uppercase tracking-wider font-extrabold text-slate-950 px-4">
            {ctaText}
          </Button>
        </a>
      </div>
    </div>
  );
}

// Premium Membership Upgrade placeholder component
export function PremiumMembershipCTA() {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-brand-amber/5 to-slate-900 border border-brand-amber/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-brand-amber/10 via-transparent to-transparent pointer-events-none" />
      <div className="flex items-center gap-4 text-left">
        <div className="p-3 bg-brand-amber/10 text-brand-amber border border-brand-amber/25 rounded-2xl shrink-0">
          <Shield className="w-8 h-8 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest bg-brand-amber text-slate-950 px-2 py-0.5 rounded-full">
              Lounge VIP
            </span>
            <span className="text-white font-outfit text-sm font-extrabold">Ad-Free Experience</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-md">
            Upgrade to Premium to permanently eliminate all platform ads, unlock custom profile cosmetics, and support independent community developers.
          </p>
        </div>
      </div>

      <Button variant="primary" className="h-10 text-xs font-bold uppercase tracking-wider text-slate-950 px-6 shrink-0 shadow-tactile">
        Upgrade Now ($4.99/mo)
      </Button>
    </div>
  );
}

// Cosmetic Shop / Upgrade Upgrades grid widget
export function CosmeticShopPreview() {
  const skins = [
    { name: "Gold Dice", cost: "500 Coins", rarity: "Legendary", icon: "🎲" },
    { name: "Neon Matrix Board", cost: "1200 Coins", rarity: "Epic", icon: "♟️" },
    { name: "Fire Ladder Trail", cost: "350 Coins", rarity: "Rare", icon: "🔥" }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-brand-amber" /> Cosmetic Upgrade Options
        </h4>
        <span className="text-[9px] font-bold text-brand-amber uppercase hover:underline cursor-pointer">Lounge Store</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {skins.map((skin, idx) => (
          <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-2xl text-center flex flex-col justify-between hover:border-slate-850 transition-all">
            <div>
              <span className="text-2xl block my-1">{skin.icon}</span>
              <span className="text-[9px] font-outfit font-bold text-slate-200 block truncate">{skin.name}</span>
            </div>
            <div className="mt-2.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase block tracking-wider mb-0.5">{skin.rarity}</span>
              <span className="text-[9px] font-mono text-brand-amber font-black block">{skin.cost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom cyberpunk-themed advertising box
export function CyberAdBox({ label = "ADVERTISEMENT SPACE", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`border border-dashed border-brand-amber/30 bg-brand-amber/5 rounded-3xl p-6 text-center select-none font-mono text-[9px] text-slate-500 uppercase tracking-widest relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-radial-gradient from-brand-amber/5 via-transparent to-transparent pointer-events-none" />
      <span className="absolute top-2.5 left-4 font-bold text-slate-600 opacity-60">AD ZONE</span>
      <span className="absolute bottom-2.5 right-4 font-bold text-slate-600 opacity-60">SPONSOR LINK</span>
      <div className="my-5 space-y-2">
        <p className="font-outfit font-black text-sm text-brand-light tracking-wider">{label}</p>
        <p className="text-[9px] text-slate-400 font-semibold tracking-normal lowercase leading-relaxed">
          Support the platform — ads generate 1,000 INR/mo to fund local server hosting.
        </p>
      </div>
    </div>
  );
}

// Cyberpunk sponsored interstitial popup ad
import { X } from "lucide-react";

export function PopupAd({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [countdown, setCountdown] = useState(isOpen ? 5 : 0);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Initialize states asynchronously to avoid synchronous setState in effect
    setTimeout(() => {
      setCountdown(5);
      setCanClose(false);
    }, 0);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border-2 border-brand-amber rounded-[2rem] p-8 relative overflow-hidden shadow-2xl flex flex-col items-center text-center">
        {/* Background lighting */}
        <div className="absolute inset-0 bg-radial-gradient from-brand-amber/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-amber/5 to-transparent pointer-events-none scan-line" />

        <span className="text-[9px] font-black uppercase tracking-widest bg-brand-amber/10 text-brand-amber border border-brand-amber/25 px-3 py-1 rounded-full">
          SPONSOR BROADCAST
        </span>

        <h3 className="font-outfit font-black text-2xl text-white uppercase tracking-wider mt-6">
          CYBER COLA EXTREME
        </h3>
        
        <div className="w-20 h-20 my-6 bg-brand-amber/10 border border-brand-amber/30 rounded-2xl flex items-center justify-center text-5xl animate-bounce">
          🥤
        </div>

        <p className="text-xs font-semibold text-slate-300 leading-relaxed max-w-sm">
          "MAXIMIZE YOUR FOCUS. ZERO LAG. RECHARGE YOUR CYBERNETIC COGNITION INSTANTLY."
        </p>

        <div className="w-full bg-slate-950 border border-slate-850 p-3 rounded-2xl mt-6 flex justify-between items-center text-left">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Sponsor Match</span>
            <p className="font-outfit font-extrabold text-xs text-white uppercase tracking-wide mt-0.5">Use Code "UNIGAMES"</p>
          </div>
          <Button variant="primary" size="sm" className="h-8 text-[9px] uppercase tracking-wider text-slate-950 font-black">
            Get 20% Off
          </Button>
        </div>

        {canClose ? (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer bg-slate-950"
            aria-label="Close Ad"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="absolute top-4 right-4 text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-slate-400">
            Close in {countdown}s
          </div>
        )}

        <span className="text-[8px] font-mono text-slate-600 uppercase mt-6 tracking-widest">
          ADVERTISEMENT SPACE
        </span>
      </div>
    </div>
  );
}
