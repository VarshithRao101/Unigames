"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Gamepad2, Zap, Play, X, DoorOpen } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { getGameBySlug } from "@/data/platform";

const filters = ["All", "Board Games", "Arcade", "Strategy", "Social"];

export default function GamesPage() {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedGameSlug, setSelectedGameSlug] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();

  // Close modal on escape keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedGameSlug(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset room code when active game changes
  useEffect(() => {
    setRoomCode("");
  }, [selectedGameSlug]);

  const activeGame = useMemo(() => {
    if (!selectedGameSlug) return null;
    return getGameBySlug(selectedGameSlug);
  }, [selectedGameSlug]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    router.push(`/rooms/${roomCode.trim().toUpperCase()}`);
    setSelectedGameSlug(null);
  };

  /* ── Game List ── */
  const gamesList = useMemo(() => [
    {
      slug: "tictactoe",
      name: "Tic-Tac-Toe",
      shortCode: "XO",
      category: "Arcade",
      status: "released",
      progressPercent: 100,
      description: "Command the classic board in high-speed, cybernetic 2-player rounds.",
      image: "/images/tictactoe_logo.png",
      tags: ["Quick", "Simple", "2 Players"]
    },
    {
      slug: "chess",
      name: "Chess Arena",
      shortCode: "CHS",
      category: "Strategy",
      status: "beta",
      progressPercent: 95,
      description: "Tactical warfare on a 64-square battlefield. Synchronize moves in real-time.",
      image: "/images/chess_logo.avif",
      tags: ["Deep Strategy", "Ranked", "Classic"]
    },
    {
      slug: "ludo",
      name: "Ludo Rush",
      shortCode: "LDO",
      category: "Board Games",
      status: "in-dev",
      progressPercent: 40,
      description: "Roll, strike, and race your squad to the home sector in fast-paced board combat.",
      image: "/images/ludo_logo.webp",
      tags: ["4 Players", "Casual", "Lobby Party"]
    },
    {
      slug: "snakes",
      name: "Snakes & Ladders",
      shortCode: "SNK",
      category: "Board Games",
      status: "in-dev",
      progressPercent: 15,
      description: "Ascend grids and avoid sector hazards in this classic casual multiplayer race.",
      image: "/images/snakes_logo.webp",
      tags: ["Multiplayer", "Casual", "Dice Roll"]
    }
  ], []);

  const filteredGames = useMemo(() => {
    return gamesList.filter((game) => {
      const matchesSearch =
        game.name.toLowerCase().includes(search.toLowerCase()) ||
        game.category.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        selectedFilter === "All" ||
        game.category === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, selectedFilter, gamesList]);

  return (
    <div className="bg-transparent text-slate-50 min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        {/* Search & Filter Bar */}
        <section className="glass p-2 rounded-[1.5rem] sm:rounded-[2.5rem] mb-6 sm:mb-12">
          <div className="bg-slate-900/50 rounded-[1.3rem] sm:rounded-[2.3rem] p-2.5 sm:p-4 flex flex-col lg:flex-row items-center gap-3 sm:gap-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text" 
                placeholder="SEARCH SECTORS..."
                className="w-full h-10 sm:h-14 bg-slate-900 border-2 border-black rounded-xl sm:rounded-2xl px-10 sm:px-16 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] text-slate-50 focus:outline-none focus:border-brand-orange"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
              {filters.map(filter => (
                <button 
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 sm:px-5 h-10 sm:h-14 rounded-xl sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 border-black ${
                    selectedFilter === filter 
                      ? 'bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000000] sm:shadow-[4px_4px_0px_#000000]' 
                      : 'bg-slate-900/45 text-slate-400 hover:border-brand-orange/30'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <Link href="/rooms/create" className="w-full lg:w-auto">
              <Button className="btn-gaming h-10 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-2xl w-full lg:w-auto text-[10px] sm:text-xs">
                Create Room
              </Button>
            </Link>
          </div>
        </section>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-4">
          {filteredGames.map((game, i) => {
            const isComingSoon = game.status === "in-dev";
            
            return (
              <motion.article 
                key={game.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  if (!isComingSoon) {
                    setSelectedGameSlug(game.slug);
                  }
                }}
                className={`group relative rounded-2xl overflow-hidden flex flex-col p-2.5 sm:p-4 transition-all duration-300 ${
                  isComingSoon 
                    ? 'border-2 border-dashed border-slate-700 bg-white/2 cursor-not-allowed' 
                    : 'border-2 border-black bg-slate-900/60 glass panel-interactive shadow-[3px_3px_0px_#000000] sm:shadow-card cursor-pointer'
                }`}
              >
                {/* 2D Game Photo (Top part) */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-black/40 bg-slate-900 shadow-[1.5px_1.5px_0px_#000000] sm:shadow-[3px_3px_0px_#000000]">
                  {game.image ? (
                    <img 
                      src={game.image} 
                      alt={game.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 contrast-[1.03] saturate-[1.08] brightness-[1.03]" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <Gamepad2 className="w-8 h-8 text-slate-650" />
                    </div>
                  )}

                  {/* Status Overlay Badge (Top Right of image) */}
                  <div className="absolute top-1.5 right-1.5 z-20">
                    <span className={`h-2.5 w-2.5 rounded-full border border-black block sm:hidden ${
                      game.status === 'released' 
                        ? 'bg-success shadow-[0_0_4px_rgba(0,255,204,0.6)]' 
                        : game.status === 'beta' 
                          ? 'bg-brand-orange shadow-[0_0_4px_rgba(255,170,0,0.6)]' 
                          : 'bg-slate-600 animate-pulse'
                    }`} />
                    <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded-md border font-black text-[7.5px] uppercase tracking-widest ${
                      game.status === 'released' 
                        ? 'bg-success/15 border-success/30 text-success' 
                        : game.status === 'beta' 
                          ? 'bg-brand-orange/15 border-brand-orange/30 text-brand-orange' 
                          : 'bg-slate-850 border-black text-slate-500 animate-pulse'
                    }`}>
                      {game.status === 'released' ? 'Active' : game.status === 'beta' ? 'Beta' : 'Syncing'}
                    </span>
                  </div>

                  {/* CMD Shortcode Tag (Top Left of image) */}
                  <div className="absolute top-1.5 left-1.5 z-20">
                    <span className="px-1.5 py-0.5 rounded bg-black/75 border border-black text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-wider text-slate-400">
                      {game.shortCode}
                    </span>
                  </div>
                </div>

                {/* Game Name & Info (Bottom part) */}
                <div className="mt-2.5 sm:mt-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-[9.5px] sm:text-base font-black uppercase tracking-tight sm:tracking-tighter text-slate-50 group-hover:text-brand-orange transition-colors truncate">
                      {game.name}
                    </h3>
                    
                    <span className="hidden sm:block text-[8px] font-black uppercase tracking-wider text-slate-500 mt-0.5">
                      {game.category}
                    </span>

                    <p className="hidden sm:block text-[10px] text-slate-400 font-bold leading-normal mt-1.5 line-clamp-2">
                      {game.description}
                    </p>
                  </div>

                  {/* Action/Deploy button on PC */}
                  <div className="hidden sm:flex items-center justify-between mt-4 pt-3 border-t border-black/20">
                    <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-505">
                      {game.tags[0]} • {game.tags[1]}
                    </span>
                    {isComingSoon ? (
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Offline</span>
                    ) : (
                      <span className="text-[8.5px] font-black text-brand-orange uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                        Deploy <Play className="w-2.5 h-2.5 fill-current" />
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {selectedGameSlug && activeGame && (
          <div 
            onClick={() => setSelectedGameSlug(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-slate-800 border-[4px] border-black rounded-[2.5rem] shadow-[10px_10px_0px_#000000] overflow-hidden"
            >
              {/* Close Button ("Wrong" cancel button) */}
              <button 
                onClick={() => setSelectedGameSlug(null)}
                className="absolute top-5 right-5 flex items-center justify-center w-9 h-9 rounded-full border-[3px] border-black bg-[#ff4d4d] hover:bg-[#ff6666] text-black shadow-[3px_3px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000000] transition-all duration-100 cursor-pointer z-50"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Left Side: Game Details & Info */}
                <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between border-b-[4px] md:border-b-0 md:border-r-[4px] border-black">
                  <div>
                    <span className="kicker px-3 py-1 text-[8.5px] font-black uppercase tracking-[0.2em]">
                      {activeGame.category}
                    </span>
                    <h2 className="mt-4 text-3xl font-black uppercase tracking-wider text-slate-50">
                      {activeGame.name}
                    </h2>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/60 bg-black/25 px-2 py-0.5 rounded">
                        {activeGame.multiplayerType}
                      </span>
                      {(activeGame.tags || []).map((tag) => (
                        <span key={tag} className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/60 bg-black/25 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="mt-5 text-[11.5px] font-semibold text-slate-400 leading-relaxed">
                      {activeGame.description}
                    </p>
                  </div>

                  <div className="mt-6 p-4 rounded-2xl bg-black/20 border-2 border-black">
                    <p className="font-outfit text-[10px] font-black uppercase tracking-widest text-brand-orange">
                      How it plays
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {(activeGame.rules || []).map((rule) => (
                        <div key={rule} className="flex gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-orange rounded-full mt-1.5 shrink-0" />
                          <p className="text-[10px] font-semibold leading-normal text-slate-300">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Deploy Panel */}
                <div className="md:col-span-5 p-6 md:p-8 bg-slate-900 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-base font-black text-slate-50 tracking-wider uppercase">Deploy Arena</h3>
                      <p className="text-[9px] font-semibold text-slate-500 mt-1">Start match or join lobby</p>
                    </div>

                    <Button 
                      onClick={() => {
                        router.push(`/rooms/create?game=${activeGame.slug}`);
                        setSelectedGameSlug(null);
                      }}
                      className="btn-gaming w-full h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      Create Room
                    </Button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t-2 border-black/50"></div>
                      <span className="flex-shrink mx-3 text-[8.5px] font-black text-slate-600 uppercase tracking-widest">OR</span>
                      <div className="flex-grow border-t-2 border-black/50"></div>
                    </div>

                    <form onSubmit={handleJoinRoom} className="space-y-3.5">
                      <Input 
                        label="Join with code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        placeholder="ENTER CODE"
                        className="text-center tracking-[0.2em] font-black uppercase h-11"
                      />
                      <Button type="submit" variant="secondary" className="w-full h-11 text-[9.5px] font-black tracking-widest">
                        Join Room
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
