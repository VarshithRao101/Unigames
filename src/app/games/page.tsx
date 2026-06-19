"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Gamepad2, Zap, Trophy, Swords, Target, Play } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { PLATFORM_GAMES } from "@/data/platform";
import { motion, AnimatePresence } from "framer-motion";

const filters = ["All", "Board Games", "Arcade", "Strategy", "Social"];

export default function GamesPage() {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredGames = useMemo(() => {
    return PLATFORM_GAMES.filter((game) => {
      const matchesSearch =
        game.name.toLowerCase().includes(search.toLowerCase()) ||
        game.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter =
        selectedFilter === "All" ||
        game.category === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, selectedFilter]);

  return (
    <div className="bg-slate-dark text-white min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="relative mb-20">
           <div className="absolute -top-20 -left-20 w-80 h-80 bg-brand-orange/10 blur-[100px] rounded-full" />
           <div className="relative z-10">
              <span className="kicker mb-4">Command Center</span>
              <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase leading-[0.9]">
                 OPERATIONAL <span className="gradient-text">GAME HUB</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl font-medium">
                 Deploy into high-performance multiplayer strategic boards. 
                 Global matchmaking enabled across all sectors.
              </p>
           </div>
        </div>

        {/* Search & Filter Bar */}
        <section className="glass p-2 rounded-[2.5rem] border border-white/5 mb-12">
           <div className="bg-slate-dark/50 rounded-[2.3rem] p-4 flex flex-col lg:flex-row items-center gap-6">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                 <input 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   type="text" 
                   placeholder="SEARCH OPERATIONAL TITLES..."
                   className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-16 text-[10px] font-black uppercase tracking-[0.3em] text-white focus:outline-none focus:border-brand-orange/40"
                 />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
                 {filters.map(filter => (
                   <button 
                     key={filter}
                     onClick={() => setSelectedFilter(filter)}
                     className={`px-6 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedFilter === filter ? 'bg-brand-orange text-slate-950 shadow-orange/40' : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/20'}`}
                   >
                      {filter}
                   </button>
                 ))}
              </div>

              <Link href="/rooms/create" className="w-full lg:w-auto">
                 <Button className="btn-gaming h-14 px-10 rounded-2xl w-full lg:w-auto">
                    Create Arena <Zap className="ml-2 w-4 h-4 fill-current" />
                 </Button>
              </Link>
           </div>
        </section>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {filteredGames.map((game, i) => (
             <motion.article 
               key={game.slug}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="group relative h-[500px] rounded-[3.5rem] overflow-hidden border border-white/10 glass hover:border-brand-orange/30 transition-all"
             >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-dark via-slate-dark/40 to-transparent z-10" />
                
                {/* Thumbnails */}
                {game.slug === 'tictactoe' ? (
                   <img src="/images/tictactoe.png" alt={game.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 opacity-40 group-hover:opacity-60" />
                ) : game.slug === 'chess' ? (
                   <img src="/images/chess.png" alt={game.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 opacity-40 group-hover:opacity-60" />
                ) : (
                   <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                      <Gamepad2 className="w-20 h-20 text-white/10" />
                   </div>
                )}

                <div className="absolute top-8 left-8 z-20">
                   <span className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/10 font-black text-[9px] uppercase tracking-widest text-slate-400">
                      CMD-{game.shortCode}
                   </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-10 z-20">
                   <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-brand-orange font-black text-[9px] uppercase tracking-widest">
                         {game.category}
                      </span>
                      {game.status === 'beta' && (
                        <span className="px-3 py-1 rounded-full bg-danger/10 border border-danger/30 text-danger font-black text-[9px] uppercase tracking-widest">
                           Experimental
                        </span>
                      )}
                   </div>
                   
                   <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter">{game.name}</h3>
                   <p className="text-xs text-slate-400 font-bold leading-relaxed mb-8 line-clamp-2">
                      {game.description}
                   </p>

                   <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Synchronization</span>
                         <span className="text-sm font-space font-black text-white">{game.progressPercent}% Active</span>
                      </div>
                      <Link href={`/games/${game.slug}`}>
                         <Button className="btn-gaming h-12 px-8 rounded-xl font-black uppercase text-[10px]">
                            Engage <Play className="ml-2 w-3 h-3 fill-current" />
                         </Button>
                      </Link>
                   </div>
                </div>
             </motion.article>
           ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
