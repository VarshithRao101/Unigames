"use client";

import { useMemo, useState, useEffect } from "react";
import { Crown, Flame, Trophy, Medal, Star, ArrowUpRight, Globe, Activity, Zap } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { LEADERBOARD_DATA } from "@/data/platform";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaderboardsPage() {
  const [mode, setMode] = useState<"weekly" | "allTime">("weekly");

  const board = useMemo(() => LEADERBOARD_DATA[mode], [mode]);
  const topThree = board.slice(0, 3);
  const rest = board.slice(3);

  /* ── 1. LEADERBOARD ACTIVITY TICKER ── */
  const tickerEvents = useMemo(() => [
    "VARSHITH RANKED UP TO DIVISION ELITE IN XO SECTOR",
    "BOARDKING SURPASSED LUNA ON THE WEEKLY LEADERBOARD",
    "GARRY MAINTAINS RANK #1 WITH A 14-MATCH WIN STREAK",
    "NEW COMBATANT REGISTERED ON SECTOR STANDINGS",
    "NOVA UNLOCKED ACHIEVEMENT 'LEADERBOARD RULER' (+500 XP)",
  ], []);

  const [currentEventIdx, setCurrentEventIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIdx((prev) => (prev + 1) % tickerEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tickerEvents]);

  return (
    <div className="bg-slate-dark text-white min-h-screen">
      <Navbar />

      <main suppressHydrationWarning>
        {/* Header */}
        <section className="relative min-h-[40vh] py-8 flex items-center justify-center pt-24 overflow-hidden text-center">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero.png" 
              alt="Leaderboard Hub Background" 
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-dark/20 via-slate-dark/80 to-slate-dark" />
          </div>

          {/* Floating 2D Cartoon Decors */}
          <motion.div 
            animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[12%] md:left-[18%] top-1/4 w-14 h-14 md:w-20 md:h-20 z-10 pointer-events-none opacity-[0.05]"
          >
            <img src="/images/cartoon_trophy.png" alt="Trophy Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 8, 0], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[12%] md:right-[18%] bottom-1/4 w-14 h-14 md:w-20 md:h-20 z-10 pointer-events-none opacity-[0.05]"
          >
            <img src="/images/cartoon_shield.png" alt="Shield Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
          </motion.div>

          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase leading-[0.9]">
                GLOBAL <span className="gradient-text">CHAMPION HUB</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed max-w-xl mx-auto">
                The definitive record of strategic dominance. Earn XP in match rooms to ascend the divisions and secure your legacy.
              </p>

              <div className="mt-8 flex justify-center">
                <div className="flex bg-white/5 p-1 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000] backdrop-blur-xl">
                  <button 
                    onClick={() => setMode("weekly")}
                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer border-none ${mode === "weekly" ? 'bg-brand-orange text-slate-950 shadow-none' : 'text-slate-500 hover:text-white'}`}
                  >
                    Weekly Standings
                  </button>
                  <button 
                    onClick={() => setMode("allTime")}
                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer border-none ${mode === "allTime" ? 'bg-brand-orange text-slate-950 shadow-none' : 'text-slate-500 hover:text-white'}`}
                  >
                    All-Time Legends
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LIVE ACTIVITY TICKER MARQUEE ── */}
        <section className="relative overflow-hidden py-3 bg-slate-dark/20 border-y border-black mb-12">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="glass py-2 px-4 rounded-xl flex items-center gap-3 bg-slate-dark/80 relative overflow-hidden">
              {/* LIVE Indicator */}
              <div className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-brand-orange/45 bg-[#ffaa00]/10 px-2 py-0.5 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse" />
                <span className="font-space text-[8px] font-black uppercase tracking-wider text-brand-orange">LIVE</span>
              </div>

              {/* Zap Lightning icon */}
              <Zap className="w-3.5 h-3.5 text-brand-orange fill-current animate-pulse flex-shrink-0" />

              {/* Ticker marquee message */}
              <div className="flex-1 overflow-hidden relative h-4 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentEventIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="font-space text-[9px] font-black uppercase tracking-[0.12em] text-slate-300 truncate"
                  >
                    {tickerEvents[currentEventIdx]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 container mx-auto max-w-7xl">
          {/* Podium */}
          <section className="grid gap-8 lg:grid-cols-3 mb-20">
             {topThree.map((player, index) => (
               <motion.article 
                 key={player.rank}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
                 viewport={{ once: true }}
                 className={`relative glass panel-interactive rounded-[2.5rem] p-8 border-2 border-black shadow-card transition-all duration-300 ${index === 0 ? "bg-brand-orange/5" : ""}`}
               >
                 {/* Rank Badge */}
                 <div className={`absolute top-8 right-8 h-12 w-12 rounded-2xl border-2 border-black flex items-center justify-center font-space text-xl font-black shadow-[3px_3px_0px_#000] ${
                   index === 0 ? "bg-brand-orange text-slate-950" : 
                   index === 1 ? "bg-slate-300 text-slate-900" :
                   "bg-[#CD7F32] text-slate-950"
                 }`}>
                    #{player.rank}
                 </div>

                 <div className="flex items-center gap-6 mb-10">
                    <div className="h-20 w-20 rounded-full bg-slate-dark border-2 border-black flex items-center justify-center text-slate-500 font-black text-3xl shadow-[3px_3px_0px_#000] relative">
                       {player.name.charAt(0)}
                       <span className="absolute bottom-1 right-1 h-4 w-4 bg-success rounded-full border-2 border-black animate-pulse" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                         {index === 0 && <Crown className="h-5 w-5 text-brand-orange" />}
                         <h3 className="text-2xl font-black uppercase tracking-tighter">{player.name}</h3>
                       </div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{player.favorite}</p>
                    </div>
                 </div>

                 <div className="mb-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-black text-slate-650 uppercase tracking-widest">Division Progress</span>
                        <span className="text-[10px] font-black text-brand-orange tracking-widest">RANK {82 - index * 6}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-950 border-2 border-black rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         whileInView={{ width: `${100 - index * 15}%` }}
                         className={`h-full ${index === 0 ? "bg-brand-orange" : "bg-slate-400"}`}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-2.5 bg-slate-dark/40 border border-black rounded-xl shadow-[2px_2px_0px_#000]">
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">XP</p>
                       <p className="text-lg font-space font-black text-brand-orange">{player.xp}</p>
                    </div>
                    <div className="text-center p-2.5 bg-slate-dark/40 border border-black rounded-xl shadow-[2px_2px_0px_#000]">
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Wins</p>
                       <p className="text-lg font-space font-black text-white">{player.wins}</p>
                    </div>
                    <div className="text-center p-2.5 bg-slate-dark/40 border border-black rounded-xl shadow-[2px_2px_0px_#000]">
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Streak</p>
                       <p className="text-lg font-space font-black text-white">{player.streak}</p>
                    </div>
                 </div>
               </motion.article>
             ))}
          </section>

          {/* Global List */}
          <section className="glass rounded-[2.5rem] border-2 border-black shadow-card overflow-hidden">
             <div className="bg-slate-dark/50 p-6 border-b-2 border-black flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                   <Activity className="w-4 h-4 text-brand-orange" /> Operational Standings
                </h4>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sector</span>
                   <Globe className="w-3 h-3 text-slate-500" />
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                   <thead>
                      <tr className="border-b-2 border-black text-[9px] font-black uppercase tracking-widest text-slate-500">
                         <th className="px-10 py-6">Rank Index</th>
                         <th className="px-10 py-6">Operational Identity</th>
                         <th className="px-10 py-6">Primary Arena</th>
                         <th className="px-10 py-6 text-center">Wins</th>
                         <th className="px-10 py-6 text-center">Streak</th>
                         <th className="px-10 py-6 text-right">XP Capital</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y-2 divide-black">
                      {rest.map((player, i) => (
                        <tr key={player.rank} className="group hover:bg-white/2 transition-colors">
                           <td className="px-10 py-6">
                              <span className="font-space text-lg font-black text-brand-orange opacity-40 group-hover:opacity-100 transition-opacity">#{player.rank}</span>
                           </td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="h-9 w-9 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-slate-650 font-black text-xs shadow-[2px_2px_0px_#000]">
                                    {player.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black uppercase tracking-tight text-white mb-0.5 group-hover:text-brand-orange transition-colors">{player.name}</p>
                                    <p className="text-[8px] font-black text-slate-550 uppercase tracking-widest flex items-center gap-1.5"><Star className="w-2 h-2" /> Tier Elite</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">{player.favorite}</td>
                           <td className="px-10 py-6 text-center text-sm font-black text-white">{player.wins}</td>
                           <td className="px-10 py-6 text-center text-sm font-black text-white">
                              <span className="flex items-center justify-center gap-1 text-info"><Flame className="w-3 h-3" /> {player.streak}</span>
                           </td>
                           <td className="px-10 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <span className="text-sm font-space font-black text-brand-orange">{player.xp}</span>
                                 <ArrowUpRight className="w-3 h-3 text-slate-700 group-hover:text-brand-orange transition-colors" />
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
