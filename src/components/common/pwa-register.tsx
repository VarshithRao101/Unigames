"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            if (process.env.NODE_ENV === "development") {
              console.log("ServiceWorker registered successfully with scope:", registration.scope);
            }
          },
          (err) => {
            console.error("ServiceWorker registration failed:", err);
          }
        );
      });
    }

    // Capture install prompts
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="fixed bottom-6 left-6 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-brand-amber/30 p-4.5 rounded-2xl shadow-2xl flex items-center justify-between text-white"
        >
          <div className="flex items-center gap-3 pr-3">
            <div className="p-2 bg-brand-amber/15 border border-brand-amber/35 rounded-xl text-brand-amber animate-pulse">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-outfit font-extrabold text-xs uppercase tracking-wide text-white">Install UniGames</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Access matches instantly from your device homescreen</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-brand-amber text-slate-950 font-outfit font-extrabold text-[10px] uppercase tracking-wider shadow-sm hover:bg-brand-light transition-colors cursor-pointer"
            >
              Install
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
