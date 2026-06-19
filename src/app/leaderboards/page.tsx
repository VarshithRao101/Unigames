"use client";

import { useMemo, useState } from "react";
import { Crown, Flame, Trophy, Medal, Star, ArrowUpRight, Globe, Activity } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { LEADERBOARD_DATA } from "@/data/platform";
import { motion } from "framer-motion";

export default function LeaderboardsPage() {
  const [mode, setMode] = useState<"weekly" | "allTime">("weekly");

  const board = useMemo(() => LEADERBOARD_DATA[mode], [mode]);
  const topThree = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div className="bg-slate-dark text-white min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        {/* Header */}
        <section className="relative mb-20 text-center">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="relative z-10 max-w-3xl mx-auto">
              <span className="kicker mb-4">Elite Rankings</span>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
                 GLOBAL <span className="gradient-text">CHAMPION HUB</span>
              </h1>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                 The definitive record of strategic dominance. Earn XP in match rooms to ascend the divisions and secure your legacy.
              </p>
           </div>
           
           <div className="mt-12 flex justify-center">
              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
                 <button 
                   onClick={() => setMode("weekly")}
                   className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === "weekly" ? 'bg-brand-orange text-slate-950 shadow-orange/40' : 'text-slate-500 hover:text-white'}`}
                 >
                    Weekly Standings
                 </button>
                 <button 
                   onClick={() => setMode("allTime")}
                   className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === "allTime" ? 'bg-brand-orange text-slate-950 shadow-orange/40' : 'text-slate-500 hover:text-white'}`}
                 >
                    All-Time Legends
                 </button>
              </div>
           </div>
        </section>

        {/* Podium */}
        <section className="grid gap-8 lg:grid-cols-3 mb-20">
           {topThree.map((player, index) => (
             <motion.article 
               key={player.rank}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               className={`relative glass rounded-[3.5rem] p-10 border transition-all duration-300 ${index === 0 ? "border-brand-orange/40 bg-brand-orange/5 shadow-neon-orange" : "border-white/5 hover:border-white/20"}`}
             >
                {/* Rank Badge */}
                <div className={`absolute top-8 right-8 h-12 w-12 rounded-2xl border flex items-center justify-center font-space text-xl font-black ${
                  index === 0 ? "bg-brand-orange text-slate-950 border-brand-orange shadow-orange/40" : 
                  index === 1 ? "bg-slate-300 text-slate-900 border-white/50 shadow-white/10" :
                  "bg-[#CD7F32] text-slate-950 border-white/20 shadow-orange/10"
                }`}>
                   #{player.rank}
                </div>

                <div className="flex items-center gap-6 mb-10">
                   <div className="h-20 w-20 rounded-full bg-slate-dark border border-white/10 flex items-center justify-center text-slate-500 font-black text-3xl shadow-2xl relative">
                      {player.name.charAt(0)}
                      <span className="absolute bottom-1 right-1 h-4 w-4 bg-success rounded-full border-4 border-slate-950 animate-pulse" />
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
                       <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Division Progress</span>
                       <span className="text-[10px] font-black text-brand-orange tracking-widest">RANK {82 - index * 6}</span>
                   </div>
                   <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${100 - index * 15}%` }}
                        className={`h-full ${index === 0 ? "bg-brand-orange shadow-orange/40" : "bg-white/40 shadow-white/10"}`}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   <div className="text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">XP</p>
                      <p className="text-xl font-space font-black text-brand-orange">{player.xp}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Wins</p>
                      <p className="text-xl font-space font-black text-white">{player.wins}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Streak</p>
                      <p className="text-xl font-space font-black text-white">{player.streak}</p>
                   </div>
                </div>
             </motion.article>
           ))}
        </section>

        {/* Global List */}
        <section className="glass rounded-[3rem] border border-white/5 overflow-hidden">
           <div className="bg-white/5 p-8 border-b border-white/5 flex items-center justify-between">
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
                    <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                       <th className="px-10 py-6">Rank Index</th>
                       <th className="px-10 py-6">Operational Identity</th>
                       <th className="px-10 py-6">Primary Arena</th>
                       <th className="px-10 py-6 text-center">Wins</th>
                       <th className="px-10 py-6 text-center">Streak</th>
                       <th className="px-10 py-6 text-right">XP Capital</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {rest.map((player, i) => (
                      <tr key={player.rank} className="group hover:bg-white/2 transition-colors">
                         <td className="px-10 py-8">
                            <span className="font-space text-lg font-black text-brand-orange opacity-40 group-hover:opacity-100 transition-opacity">#{player.rank}</span>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 rounded-full bg-slate-950 border border-white/5 flex items-center justify-center text-slate-600 font-black text-sm">
                                  {player.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-sm font-black uppercase tracking-tight text-white mb-1 group-hover:text-brand-orange transition-colors">{player.name}</p>
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Star className="w-2 h-2" /> Tier Elite</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-xs font-black uppercase text-slate-400 tracking-widest">{player.favorite}</td>
                         <td className="px-10 py-8 text-center text-sm font-black text-white">{player.wins}</td>
                         <td className="px-10 py-8 text-center text-sm font-black text-white">
                            <span className="flex items-center justify-center gap-1 text-info"><Flame className="w-3 h-3" /> {player.streak}</span>
                         </td>
                         <td className="px-10 py-8 text-right">
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
      </main>

      <Footer />
    </div>
  );
}
