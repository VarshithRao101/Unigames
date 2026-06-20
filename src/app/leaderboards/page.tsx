"use client";

import { useMemo, useState } from "react";
import { Crown, Flame, Star, ArrowUpRight, Globe, Activity } from "lucide-react";
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
    <div className="bg-transparent text-slate-50 min-h-screen">
      <Navbar />

      <main suppressHydrationWarning>
        <section className="pt-32 pb-20 px-4 sm:px-6 container mx-auto max-w-7xl">
          {/* Standing Switcher */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="flex bg-slate-900/40 p-1 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000] backdrop-blur-xl">
              <button 
                onClick={() => setMode("weekly")}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer border-none ${mode === "weekly" ? 'bg-brand-orange text-slate-950 shadow-none' : 'text-slate-500 hover:text-slate-50'}`}
              >
                Weekly Standings
              </button>
              <button 
                onClick={() => setMode("allTime")}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer border-none ${mode === "allTime" ? 'bg-brand-orange text-slate-950 shadow-none' : 'text-slate-500 hover:text-slate-50'}`}
              >
                All-Time Legends
              </button>
            </div>
          </div>

          {/* Mobile Podium (Flex Row) */}
          <div className="flex items-end justify-center gap-2.5 mb-8 sm:hidden px-2">
            {/* Rank 2 (Left) */}
            {topThree[1] && (
              <div className="w-[31%] bg-slate-900 border-2 border-black rounded-2xl p-3 pb-4 text-center shadow-[2px_2px_0px_#000000] flex flex-col justify-between h-[155px]">
                <div>
                  <div className="bg-slate-300 border border-black text-slate-900 font-extrabold text-[9px] w-5 h-5 rounded-lg flex items-center justify-center mx-auto mb-1.5 shadow-[1px_1px_0px_#000000]">
                    #2
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-slate-450 font-black text-sm mx-auto shadow-[1.5px_1.5px_0px_#000000] relative">
                    {topThree[1].name.charAt(0)}
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-tight text-slate-50 mt-2 truncate px-1">
                    {topThree[1].name}
                  </h3>
                </div>
                <p className="text-[9px] font-space font-black text-brand-orange mt-1">
                  {topThree[1].xp}
                </p>
              </div>
            )}

            {/* Rank 1 (Center) */}
            {topThree[0] && (
              <div className="w-[38%] bg-slate-900 border-3 border-black rounded-3xl p-3 pb-5 text-center shadow-[3px_3px_0px_#000000] flex flex-col justify-between h-[175px] relative -translate-y-1">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                  <Crown className="h-5 w-5 text-brand-orange animate-bounce" />
                </div>
                <div>
                  <div className="bg-brand-orange border border-black text-slate-950 font-black text-[10px] w-5.5 h-5.5 rounded-lg flex items-center justify-center mx-auto mb-1.5 shadow-[1.5px_1.5px_0px_#000000]">
                    #1
                  </div>
                  <div className="h-12 w-12 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-brand-orange font-black text-base mx-auto shadow-[1.5px_1.5px_0px_#000000] relative">
                    {topThree[0].name.charAt(0)}
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-tight text-slate-50 mt-2 truncate px-0.5">
                    {topThree[0].name}
                  </h3>
                </div>
                <p className="text-[10px] font-space font-black text-brand-orange mt-1">
                  {topThree[0].xp}
                </p>
              </div>
            )}

            {/* Rank 3 (Right) */}
            {topThree[2] && (
              <div className="w-[31%] bg-slate-900 border-2 border-black rounded-2xl p-3 pb-4 text-center shadow-[2px_2px_0px_#000000] flex flex-col justify-between h-[150px]">
                <div>
                  <div className="bg-[#CD7F32] border border-black text-slate-950 font-extrabold text-[9px] w-5 h-5 rounded-lg flex items-center justify-center mx-auto mb-1.5 shadow-[1px_1px_0px_#000000]">
                    #3
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-slate-450 font-black text-sm mx-auto shadow-[1.5px_1.5px_0px_#000000] relative">
                    {topThree[2].name.charAt(0)}
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-tight text-slate-50 mt-2 truncate px-1">
                    {topThree[2].name}
                  </h3>
                </div>
                <p className="text-[9px] font-space font-black text-brand-orange mt-1">
                  {topThree[2].xp}
                </p>
              </div>
            )}
          </div>

          {/* Desktop/Tablet Podium (Full Cards Grid) */}
          <section className="hidden sm:grid gap-8 sm:grid-cols-3 mb-20">
             {topThree.map((player, index) => (
               <motion.article 
                 key={player.rank}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
                 viewport={{ once: true }}
                 className={`relative glass p-8 border-2 border-black shadow-card transition-all duration-300 ${index === 0 ? "bg-brand-orange/5" : ""}`}
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
                    <div className="h-20 w-20 rounded-full bg-slate-900 border-2 border-black flex items-center justify-center text-slate-500 font-black text-3xl shadow-[3px_3px_0px_#000] relative">
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
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Division Progress</span>
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
                    <div className="text-center p-2.5 bg-slate-900/40 border border-black rounded-xl shadow-[2px_2px_0px_#000]">
                       <p className="text-[8px] font-black text-slate-550 uppercase tracking-widest mb-0.5">XP</p>
                       <p className="text-lg font-space font-black text-brand-orange">{player.xp}</p>
                    </div>
                    <div className="text-center p-2.5 bg-slate-900/40 border border-black rounded-xl shadow-[2px_2px_0px_#000]">
                       <p className="text-[8px] font-black text-slate-550 uppercase tracking-widest mb-0.5">Wins</p>
                       <p className="text-lg font-space font-black text-slate-50">{player.wins}</p>
                    </div>
                    <div className="text-center p-2.5 bg-slate-900/40 border border-black rounded-xl shadow-[2px_2px_0px_#000]">
                       <p className="text-[8px] font-black text-slate-550 uppercase tracking-widest mb-0.5">Streak</p>
                       <p className="text-lg font-space font-black text-slate-50">{player.streak}</p>
                    </div>
                 </div>
               </motion.article>
             ))}
          </section>

          {/* Global Operational Standings */}
          <section className="glass rounded-[1.8rem] sm:rounded-[2.5rem] border-2 border-black shadow-card overflow-hidden">
             <div className="bg-slate-900/50 p-4 sm:p-6 border-b-2 border-black flex items-center justify-between">
                <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-50 flex items-center gap-3">
                   <Activity className="w-4 h-4 text-brand-orange" /> Operational Standings
                </h4>
                <div className="flex items-center gap-2">
                   <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sector</span>
                   <Globe className="w-3 h-3 text-slate-500" />
                </div>
             </div>

             {/* Phone view optimized list */}
             <div className="block sm:hidden divide-y-2 divide-black bg-slate-900/20">
                {rest.map((player) => (
                  <div key={player.rank} className="flex items-center justify-between p-3.5 hover:bg-slate-900/40 transition-colors">
                     <div className="flex items-center gap-3 min-w-0">
                        <span className="font-space text-xs font-black text-brand-orange/60 w-6 shrink-0">#{player.rank}</span>
                        <div className="h-8 w-8 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-slate-450 font-black text-xs shrink-0 shadow-[1px_1px_0px_#000000]">
                           {player.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                           <p className="text-xs font-black uppercase tracking-tight text-slate-50 leading-tight truncate">{player.name}</p>
                           <p className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest truncate mt-0.5">{player.favorite}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                           <p className="text-xs font-space font-black text-brand-orange leading-none">{player.xp}</p>
                           <p className="text-[7.5px] font-black text-slate-500 uppercase mt-0.5">XP</p>
                        </div>
                        <span className="flex items-center gap-0.5 text-[8.5px] font-black text-info bg-info/10 border-2 border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000000] shrink-0">
                           <Flame className="w-2.5 h-2.5 text-brand-orange fill-current" /> {player.streak}
                        </span>
                     </div>
                  </div>
                ))}
             </div>

             {/* Desktop/Tablet scrollable table */}
             <div className="hidden sm:block overflow-x-auto">
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
                        <tr key={player.rank} className="group hover:bg-slate-900/10 transition-colors">
                           <td className="px-10 py-6">
                              <span className="font-space text-lg font-black text-brand-orange opacity-40 group-hover:opacity-100 transition-opacity">#{player.rank}</span>
                           </td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="h-9 w-9 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-slate-500 font-black text-xs shadow-[2px_2px_0px_#000]">
                                    {player.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black uppercase tracking-tight text-slate-50 mb-0.5 group-hover:text-brand-orange transition-colors">{player.name}</p>
                                    <p className="text-[8px] font-black text-slate-550 uppercase tracking-widest flex items-center gap-1.5"><Star className="w-2 h-2" /> Tier Elite</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-6 text-xs font-black uppercase text-slate-450 tracking-widest">{player.favorite}</td>
                           <td className="px-10 py-6 text-center text-sm font-black text-slate-50">{player.wins}</td>
                           <td className="px-10 py-6 text-center text-sm font-black text-slate-555">
                              <span className="flex items-center justify-center gap-1 text-info"><Flame className="w-3 h-3 text-brand-orange fill-current" /> {player.streak}</span>
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
