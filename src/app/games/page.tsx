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
      image: "/images/tictactoe.png",
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
      image: "/images/chess.png",
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
      image: null,
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
      image: null,
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
    <div className="bg-slate-dark text-white min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        {/* Search & Filter Bar */}
        <section className="glass p-2 rounded-[1.5rem] sm:rounded-[2.5rem] mb-6 sm:mb-12">
          <div className="bg-slate-dark/50 rounded-[1.3rem] sm:rounded-[2.3rem] p-2.5 sm:p-4 flex flex-col lg:flex-row items-center gap-3 sm:gap-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text" 
                placeholder="SEARCH SECTORS..."
                className="w-full h-10 sm:h-14 bg-slate-dark border-2 border-black rounded-xl sm:rounded-2xl px-10 sm:px-16 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] text-white focus:outline-none focus:border-brand-orange"
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
                      : 'bg-white/5 text-slate-400 hover:border-brand-orange/30'
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
        <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-4">
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
                className={`group relative h-[95px] sm:h-[290px] rounded-2xl overflow-hidden flex flex-col justify-between p-2.5 sm:p-4 ${
                  isComingSoon 
                    ? 'border-2 border-dashed border-slate-700 bg-white/2 cursor-not-allowed' 
                    : 'border-2 border-black bg-slate-dark/60 glass panel-interactive shadow-[3px_3px_0px_#000000] sm:shadow-card cursor-pointer'
                }`}
              >
                {/* Mobile view content (hidden on sm and up) */}
                <div className="flex sm:hidden flex-col justify-between h-full w-full relative z-20">
                  {/* Status Dot Top Right */}
                  <div className="absolute top-0 right-0 flex items-center justify-center">
                    <span className={`h-2 w-2 rounded-full border border-black ${
                      game.status === 'released' 
                        ? 'bg-success shadow-[0_0_4px_rgba(0,255,204,0.6)]' 
                        : game.status === 'beta' 
                          ? 'bg-brand-orange shadow-[0_0_4px_rgba(255,170,0,0.6)]' 
                          : 'bg-slate-600 animate-pulse'
                    }`} />
                  </div>

                  {/* CMD Shortcode Badge Top Left */}
                  <div className="absolute top-0 left-0">
                    <span className="text-[6.5px] font-black text-slate-500 uppercase tracking-wider">
                      {game.shortCode}
                    </span>
                  </div>

                  {/* Centered Large ShortCode */}
                  <div className="flex-1 flex flex-col items-center justify-center pt-2">
                    <span className="font-outfit font-black text-2xl tracking-tighter text-white group-hover:text-brand-orange transition-colors">
                      {game.shortCode}
                    </span>
                    <span className="text-[7.5px] font-black uppercase text-slate-400 group-hover:text-white transition-colors tracking-tighter truncate w-full text-center mt-0.5">
                      {game.name.replace(" Arena", "").replace(" Rush", "")}
                    </span>
                  </div>
                </div>

                {/* Desktop view content (hidden on mobile) */}
                <div className="hidden sm:flex flex-col justify-between h-full w-full relative z-20">
                  {/* Card Header Status */}
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-black font-black text-[7.5px] uppercase tracking-widest text-slate-400">
                      CMD-{game.shortCode}
                    </span>
                    
                    {game.status === 'released' && (
                      <span className="px-2 py-0.5 rounded-md bg-success/15 border border-success/30 text-success font-black text-[7.5px] uppercase tracking-widest">
                        Active
                      </span>
                    )}
                    {game.status === 'beta' && (
                      <span className="px-2 py-0.5 rounded-md bg-brand-orange/15 border border-brand-orange/30 text-brand-orange font-black text-[7.5px] uppercase tracking-widest">
                        Beta
                      </span>
                    )}
                    {isComingSoon && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-black text-slate-500 font-black text-[7.5px] uppercase tracking-widest animate-pulse">
                        Syncing
                      </span>
                    )}
                  </div>

                  {/* Card Content & Action Area */}
                  <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {game.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[6.5px] font-black uppercase tracking-widest text-slate-505 border border-slate-700/40 px-1 py-0.2 rounded">
                          {t}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-black mb-1 uppercase tracking-tighter text-white group-hover:text-brand-orange transition-colors">
                      {game.name}
                    </h3>
                    
                    <p className="text-[9.5px] text-slate-400 font-bold leading-normal mb-3 line-clamp-2">
                      {game.description}
                    </p>

                    {/* Synchronization Progress Bar */}
                    <div className="space-y-1 mb-3.5">
                      <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-wider text-slate-505">
                        <span>Sync</span>
                        <span>{game.progressPercent}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-950 border border-black rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isComingSoon ? 'bg-slate-700' : 'bg-brand-orange'
                          }`}
                          style={{ width: `${game.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      {isComingSoon ? (
                        <Button disabled className="w-full h-9 border-2 border-slate-850 bg-transparent text-slate-600 rounded-lg uppercase text-[8px] font-black cursor-not-allowed">
                          Offline
                        </Button>
                      ) : (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGameSlug(game.slug);
                          }}
                          className="btn-gaming w-full h-9 rounded-lg font-black uppercase text-[8px]"
                        >
                          Deploy Arena
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thumbnail background - only loaded for desktop view layout */}
                {!isComingSoon && (
                  <div className="hidden sm:block absolute inset-0 z-10">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-dark via-slate-dark/50 to-transparent" />
                    {game.image ? (
                      <img 
                        src={game.image} 
                        alt={game.name} 
                        className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 group-hover:scale-105 transition-all duration-700" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                        <Gamepad2 className="w-12 h-12 text-white/5" />
                      </div>
                    )}
                  </div>
                )}
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
              className="relative w-full max-w-2xl bg-[#24261f] border-[4px] border-black rounded-[2.5rem] shadow-[10px_10px_0px_#000000] overflow-hidden"
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
                    <h2 className="mt-4 text-3xl font-black uppercase tracking-wider text-white">
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
                <div className="md:col-span-5 p-6 md:p-8 bg-[#1c1d18] flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-base font-black text-white tracking-wider uppercase">Deploy Arena</h3>
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
