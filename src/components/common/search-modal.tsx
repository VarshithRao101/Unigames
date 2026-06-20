"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X, Gamepad2, User, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";

interface SearchItem {
  id: string;
  type: "game" | "contributor" | "post";
  title: string;
  subtitle: string;
  url: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  { id: "1", type: "game", title: "Chess Online", subtitle: "Board VS - Playable", url: "/games/chess" },
  { id: "2", type: "game", title: "Tic-Tac-Toe Arena", subtitle: "Casual VS - Playable", url: "/games/tictactoe" },
  { id: "3", type: "game", title: "Ludo Club", subtitle: "Board FFA - Alpha Testing", url: "/games/ludo" },
  { id: "4", type: "game", title: "Reversi Deluxe", subtitle: "Board VS - Prototyping", url: "/games/reversi" },
  { id: "5", type: "contributor", title: "Varshith", subtitle: "Lead Frontend Architect", url: "/about" },
  { id: "6", type: "contributor", title: "DevWizard", subtitle: "Real-time Backend Dev", url: "/about" },
  { id: "7", type: "contributor", title: "Alice W.", subtitle: "Creative UI/UX Designer", url: "/about" },
  { id: "8", type: "contributor", title: "Bob S.", subtitle: "Game Engine Developer", url: "/about" },
  { id: "9", type: "post", title: "Add support for 3D Chess pieces", subtitle: "Community suggestion (112 votes)", url: "/community" },
  { id: "10", type: "post", title: "Dice roll physics consistent checks", subtitle: "Bug report (45 votes)", url: "/community" },
  { id: "11", type: "post", title: "Organize seasonal tournaments", subtitle: "Feedback forum (189 votes)", url: "/community" },
];

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "game" | "contributor" | "post">("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchItem[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Monitor keys for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      
      // Global navigation hotkeys
      if (e.altKey) {
        if (e.key === "h") { router.push("/"); onClose(); }
        if (e.key === "g") { router.push("/games"); onClose(); }
        if (e.key === "c") { router.push("/community"); onClose(); }
        if (e.key === "p") { router.push("/profile"); onClose(); }
        if (e.key === "s") { router.push("/settings"); onClose(); }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, router]);

  // Simulate typing delay
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handler = setTimeout(() => {
      const filtered = SEARCH_DATABASE.filter((item) => {
        const matchesQuery =
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase());
        const matchesFilter = filter === "all" || item.type === filter;
        return matchesQuery && matchesFilter;
      });
      setResults(filtered);
      setLoading(false);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [query, filter]);

  const handleItemClick = (url: string) => {
    router.push(url);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2 }}
            ref={modalRef}
            className="w-full max-w-xl bg-slate-950 border-[4px] border-black rounded-[2.5rem] shadow-[10px_10px_0px_#000000] relative z-10 overflow-hidden mx-4 text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Universal Search Lobbies and Users"
          >
            {/* Input Header */}
            <div className="flex items-center border-b-3 border-black px-5 py-4 bg-slate-900/30">
              <Search className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search games, crew, suggestions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white outline-none font-medium placeholder-slate-500 uppercase tracking-wider text-[10px]"
              />
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-black bg-[#ff4d4d] hover:bg-[#ff6666] text-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2.5 px-5 py-4.5 border-b-3 border-black bg-slate-900/10 text-[9px] font-black font-outfit uppercase tracking-wider text-slate-500">
              {(["all", "game", "contributor", "post"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-1.5 rounded-xl border-2 border-black transition-all cursor-pointer ${
                    filter === type
                      ? "bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000000]"
                      : "bg-slate-900 text-slate-400 hover:border-brand-orange/40 hover:text-slate-50 shadow-none"
                  }`}
                >
                  {type === "post" ? "Community" : type === "contributor" ? "Contributors" : type}
                </button>
              ))}
            </div>

            {/* Result list pane */}
            <div className="max-h-[350px] overflow-y-auto p-4 flex flex-col gap-2">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
                  <svg className="animate-spin w-5 h-5 text-brand-orange" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="font-space uppercase text-[9px] font-black tracking-widest">Searching databases...</span>
                </div>
              ) : query && results.length > 0 ? (
                results.map((item) => {
                  const Icon =
                    item.type === "game"
                      ? Gamepad2
                      : item.type === "contributor"
                      ? User
                      : MessageSquare;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.url)}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-2.5xl bg-slate-900/40 hover:bg-slate-900/80 transition-all text-left group cursor-pointer border-2 border-black hover:border-brand-orange shadow-[2px_2px_0px_#000000] hover:shadow-[3px_3px_0px_#000000]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border-2 border-black flex items-center justify-center text-slate-500 group-hover:bg-brand-orange group-hover:text-slate-950 transition-all shrink-0 shadow-[1.5px_1.5px_0px_#000000]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-outfit text-sm font-black text-slate-50 uppercase tracking-tight group-hover:text-brand-orange transition-colors truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : query ? (
                <div className="py-6">
                  <EmptyState type="search" onAction={() => setQuery("")} />
                </div>
              ) : (
                <div className="py-6 space-y-6">
                  <div className="text-center text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Search suggestion tags
                    </span>
                    <div className="flex flex-wrap justify-center gap-2.5 mt-3.5 max-w-sm mx-auto">
                      {["Chess", "Tic-Tac-Toe", "Varshith", "Ludo", "Roadmap", "Tournaments"].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="px-3.5 py-1.5 rounded-xl border-2 border-black bg-slate-900 hover:bg-slate-850 hover:border-brand-orange text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-50 shadow-[1.5px_1.5px_0px_#000000] hover:translate-y-[-0.5px] transition-all cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-900/80 pt-4.5 text-slate-400 max-w-sm mx-auto">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center mb-3">Keyboard Shortcuts</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold font-mono px-4">
                      <div className="flex justify-between border-b border-slate-900/50 pb-1.5"><span>ALT + H</span> <span className="text-brand-orange">Home</span></div>
                      <div className="flex justify-between border-b border-slate-900/50 pb-1.5"><span>ALT + G</span> <span className="text-brand-orange">Games</span></div>
                      <div className="flex justify-between border-b border-slate-900/50 pb-1.5"><span>ALT + C</span> <span className="text-brand-orange">Community</span></div>
                      <div className="flex justify-between border-b border-slate-900/50 pb-1.5"><span>ALT + P</span> <span className="text-brand-orange">Profile</span></div>
                      <div className="flex justify-between border-b border-slate-900/50 pb-1.5 md:col-span-2"><span>ALT + S</span> <span className="text-brand-orange">Settings</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="px-5 py-3.5 border-t-3 border-black bg-slate-950 flex items-center justify-between text-[10px] font-bold font-outfit text-slate-500 tracking-wider">
              <span>ESC TO CLOSE</span>
              <span>ENTER TO NAVIGATE</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
