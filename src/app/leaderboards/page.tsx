"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Crown, Flame, Star, ArrowUpRight, Globe, Activity, ChevronDown, Trophy, Gamepad2 } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PLATFORM_GAMES } from "@/data/platform";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/loader";

type TimeMode = "weekly" | "allTime";
type GameFilter = "overall" | string; // slug or "overall"

const GAME_COLORS: Record<string, { badge: string; glow: string; icon: string }> = {
  overall:    { badge: "bg-brand-orange text-slate-950",  glow: "shadow-[0_0_12px_rgba(255,193,7,0.35)]",  icon: "ALL" },
  tictactoe:  { badge: "bg-cyan-400 text-slate-950",      glow: "shadow-[0_0_12px_rgba(34,211,238,0.35)]", icon: "✕〇" },
};

export default function LeaderboardsPage() {
  const [mode, setMode] = useState<TimeMode>("weekly");
  const [gameFilter, setGameFilter] = useState<GameFilter>("overall");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [board, setBoard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadLeaderboard() {
      setIsLoading(true);
      try {
        const gameParam = gameFilter === "overall" ? "global" : gameFilter;
        const periodParam = mode === "weekly" ? "weekly" : "all-time";
        const res = await fetch(`/api/leaderboards?game=${gameParam}&period=${periodParam}`);
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const json = await res.json();
        if (json.success && active) {
          setBoard(json.data || []);
        }
      } catch (err) {
        console.error("Error loading leaderboard data:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadLeaderboard();
    return () => {
      active = false;
    };
  }, [gameFilter, mode]);

  const topThree = useMemo(() => board.slice(0, 3), [board]);
  const rest = useMemo(() => board.slice(3), [board]);

  const currentGame = gameFilter === "overall"
    ? { name: "Overall Rankings", slug: "overall" }
    : PLATFORM_GAMES.find(g => g.slug === gameFilter) ?? { name: gameFilter, slug: gameFilter };

  const colors = GAME_COLORS[gameFilter] ?? GAME_COLORS.overall;

  const gameOptions = [
    { slug: "overall", name: "Overall Rankings", icon: "ALL", desc: "All games combined" },
    ...PLATFORM_GAMES.map(g => ({
      slug: g.slug,
      name: g.name,
      icon: GAME_COLORS[g.slug]?.icon ?? "GAME",
      desc: g.spotlight ?? g.category,
    })),
  ];



  return (
    <div className="bg-transparent text-slate-50 min-h-screen">
      <Navbar />

      <main suppressHydrationWarning>
        <section className="pt-24 pb-12 px-4 sm:px-6 container mx-auto max-w-5xl">

          {/* ── CONTROL BAR: Time mode + Game filter dropdown ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 sm:mb-10">

            {/* Time mode toggle */}
            <div className="flex bg-slate-900/40 p-1 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] backdrop-blur-xl">
              <button
                onClick={() => setMode("weekly")}
                className={`px-4 sm:px-5 py-2 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer border-none ${mode === "weekly" ? 'bg-brand-orange text-slate-950 shadow-none' : 'text-slate-500 hover:text-slate-50'}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setMode("allTime")}
                className={`px-4 sm:px-5 py-2 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer border-none ${mode === "allTime" ? 'bg-brand-orange text-slate-950 shadow-none' : 'text-slate-500 hover:text-slate-50'}`}
              >
                All-Time
              </button>
            </div>

            {/* Game filter dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(p => !p)}
                className={`flex items-center gap-2.5 h-9 pl-3 pr-3 rounded-xl border-2 border-black font-black uppercase text-[9px] tracking-widest transition-all cursor-pointer ${colors.badge} ${colors.glow} shadow-[2px_2px_0px_#000000] min-w-[190px] justify-between`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{colors.icon}</span>
                  <span className="truncate">{currentGame.name}</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 glass border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000000] overflow-hidden z-50"
                  >
                    <div className="p-1.5 space-y-0.5">
                      {gameOptions.map(opt => {
                        const isActive = gameFilter === opt.slug;
                        const optColors = GAME_COLORS[opt.slug] ?? GAME_COLORS.overall;
                        return (
                          <button
                            key={opt.slug}
                            onClick={() => { setGameFilter(opt.slug); setDropdownOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer border-2 ${
                              isActive
                                ? `${optColors.badge} border-black shadow-[1.5px_1.5px_0px_#000]`
                                : "bg-white/3 border-transparent hover:border-black/40 hover:bg-white/8 text-slate-300"
                            }`}
                          >
                            <span className="text-lg leading-none w-7 text-center shrink-0">{opt.icon}</span>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-wider truncate">{opt.name}</p>
                              <p className={`text-[7.5px] font-bold uppercase tracking-widest truncate mt-0.5 ${isActive ? "opacity-70" : "text-slate-500"}`}>{opt.desc}</p>
                            </div>
                            {isActive && <Trophy className="w-3 h-3 ml-auto shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── SECTION LABEL ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`label-${gameFilter}-${mode}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-2 mb-6 sm:mb-8"
            >
              <span className={`px-2 py-0.5 rounded-lg border-2 border-black text-[8px] font-black uppercase tracking-widest shadow-[1.5px_1.5px_0px_#000] ${colors.badge}`}>
                {gameFilter === "overall" ? "All Games" : currentGame.name}
              </span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                {mode === "weekly" ? "· This Week" : "· All Time"}
              </span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`board-${gameFilter}-${mode}-${isLoading}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="glass rounded-3xl p-16 text-center border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center min-h-[300px]">
                  <Loader label="Loading Leaderboard" />
                </div>
              ) : board.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border-2 border-black shadow-card">
                  <Gamepad2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-sm font-black uppercase text-slate-500 tracking-widest">No data for this game yet</p>
                </div>
              ) : (
                <>
                  {/* Mobile Podium */}
                  <div className="flex items-end justify-center gap-2.5 mb-8 sm:hidden px-2">
                    {topThree[1] && (
                      <div className="w-[31%] bg-slate-900 border-2 border-black rounded-2xl p-3 pb-4 text-center shadow-[2px_2px_0px_#000000] flex flex-col justify-between h-[155px]">
                        <div>
                          <div className="bg-slate-300 border border-black text-slate-900 font-extrabold text-[9px] w-5 h-5 rounded-lg flex items-center justify-center mx-auto mb-1.5 shadow-[1px_1px_0px_#000000]">#2</div>
                          <div className="h-10 w-10 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-slate-450 font-black text-sm mx-auto shadow-[1.5px_1.5px_0px_#000000]">{topThree[1].name.charAt(0)}</div>
                          <h3 className="text-[10px] font-black uppercase tracking-tight text-slate-50 mt-2 truncate px-1">{topThree[1].name}</h3>
                        </div>
                        <p className="text-[9px] font-space font-black text-brand-orange mt-1">{topThree[1].xp.toLocaleString()} XP</p>
                      </div>
                    )}
                    {topThree[0] && (
                      <div className="w-[38%] bg-slate-900 border-3 border-black rounded-3xl p-3 pb-5 text-center shadow-[3px_3px_0px_#000000] flex flex-col justify-between h-[175px] relative -translate-y-1">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10"><Crown className="h-5 w-5 text-brand-orange animate-bounce" /></div>
                        <div>
                          <div className="bg-brand-orange border border-black text-slate-950 font-black text-[10px] w-5.5 h-5.5 rounded-lg flex items-center justify-center mx-auto mb-1.5 shadow-[1.5px_1.5px_0px_#000000]">#1</div>
                          <div className="h-12 w-12 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-brand-orange font-black text-base mx-auto shadow-[1.5px_1.5px_0px_#000000]">{topThree[0].name.charAt(0)}</div>
                          <h3 className="text-[11px] font-black uppercase tracking-tight text-slate-50 mt-2 truncate px-0.5">{topThree[0].name}</h3>
                        </div>
                        <p className="text-[10px] font-space font-black text-brand-orange mt-1">{topThree[0].xp.toLocaleString()} XP</p>
                      </div>
                    )}
                    {topThree[2] && (
                      <div className="w-[31%] bg-slate-900 border-2 border-black rounded-2xl p-3 pb-4 text-center shadow-[2px_2px_0px_#000000] flex flex-col justify-between h-[150px]">
                        <div>
                          <div className="bg-[#CD7F32] border border-black text-slate-950 font-extrabold text-[9px] w-5 h-5 rounded-lg flex items-center justify-center mx-auto mb-1.5 shadow-[1px_1px_0px_#000000]">#3</div>
                          <div className="h-10 w-10 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-slate-450 font-black text-sm mx-auto shadow-[1.5px_1.5px_0px_#000000]">{topThree[2].name.charAt(0)}</div>
                          <h3 className="text-[10px] font-black uppercase tracking-tight text-slate-50 mt-2 truncate px-1">{topThree[2].name}</h3>
                        </div>
                        <p className="text-[9px] font-space font-black text-brand-orange mt-1">{topThree[2].xp.toLocaleString()} XP</p>
                      </div>
                    )}
                  </div>

                  {/* Desktop Podium */}
                  <section className="hidden sm:grid gap-6 sm:grid-cols-3 mb-14 items-end">
                    {[topThree[1], topThree[0], topThree[2]].map((player, index) => {
                      if (!player) return null;
                      const isFirst = player.rank === 1;
                      const isSecond = player.rank === 2;
                      return (
                        <motion.article
                          key={player.rank}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.07 }}
                          className={`relative p-4 border-black shadow-[4px_4px_0px_#000000] transition-all duration-300 rounded-2xl flex flex-col justify-between ${
                            isFirst
                              ? "bg-slate-900 border-[3px] shadow-[6px_6px_0px_#000000] h-[240px] z-10"
                              : isSecond
                                ? "bg-slate-900/85 border-[2.5px] h-[205px]"
                                : "bg-slate-900/60 border-[2.5px] h-[188px]"
                          }`}
                        >
                          {isFirst && <div className="absolute -top-7 left-1/2 -translate-x-1/2"><Crown className="h-6 w-6 text-brand-orange animate-bounce" /></div>}
                          <div className={`absolute top-3 right-3 h-7 w-7 rounded-lg border-2 border-black flex items-center justify-center font-space text-xs font-black shadow-[1.5px_1.5px_0px_#000] ${
                            isFirst ? "bg-brand-orange text-slate-950" :
                            isSecond ? "bg-slate-300 text-slate-900" :
                            "bg-[#CD7F32] text-slate-950"
                          }`}>
                            #{player.rank}
                          </div>

                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="h-9 w-9 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-slate-500 font-black text-sm shadow-[1.5px_1.5px_0px_#000] relative">
                              {player.name ? player.name.charAt(0) : "?"}
                              <span className="absolute bottom-0 right-0 h-2 w-2 bg-success rounded-full border border-black animate-pulse" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1 mb-0.5">
                                {isFirst && <Crown className="h-3 w-3 text-brand-orange" />}
                                <h3 className="text-xs font-black uppercase tracking-tight truncate max-w-[90px]" style={{ textShadow: 'none' }}>{player.name}</h3>
                              </div>
                              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{player.favorite}</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest">Division</span>
                              <span className="text-[7px] font-black text-brand-orange tracking-widest">RANK {82 - player.rank * 6}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-950 border-2 border-black rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${100 - player.rank * 15}%` }}
                                transition={{ duration: 0.8 }}
                                className={`h-full ${isFirst ? "bg-brand-orange" : "bg-slate-400"}`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="text-center p-1.5 bg-slate-950 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000]">
                              <p className="text-[6px] font-black text-slate-555 uppercase tracking-widest mb-0.5">XP</p>
                              <p className="text-[10px] font-space font-black text-brand-orange">{player.xp.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-1.5 bg-slate-950 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000]">
                              <p className="text-[6px] font-black text-slate-555 uppercase tracking-widest mb-0.5">Wins</p>
                              <p className="text-[10px] font-space font-black text-slate-55">{player.wins}</p>
                            </div>
                            <div className="text-center p-1.5 bg-slate-950 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000]">
                              <p className="text-[6px] font-black text-slate-555 uppercase tracking-widest mb-0.5">Streak</p>
                              <p className="text-[10px] font-space font-black text-slate-55 flex items-center justify-center gap-0.5">{player.streak} <Flame className="w-2.5 h-2.5 text-brand-orange fill-current" /></p>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </section>

                  {/* Full Standings Table */}
                  {rest.length > 0 && (
                    <section className="glass rounded-[1.8rem] sm:rounded-[2.2rem] border-2 border-black shadow-card overflow-hidden">
                      <div className="bg-slate-900/50 px-4 sm:px-5 py-3 border-b-2 border-black flex items-center justify-between">
                        <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-50 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-brand-orange" /> Standings
                          <span className={`ml-1 px-1.5 py-0.5 rounded text-[7px] font-black border border-black ${colors.badge}`}>
                            {gameFilter === "overall" ? "Overall" : currentGame.name}
                          </span>
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global</span>
                          <Globe className="w-3 h-3 text-slate-500" />
                        </div>
                      </div>

                      {/* Mobile list */}
                      <div className="block sm:hidden divide-y-2 divide-black bg-slate-900/20">
                        {rest.map(player => (
                          <div key={player.rank} className="flex items-center justify-between p-3 hover:bg-slate-900/40 transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-space text-[10px] font-black text-brand-orange/60 w-6 shrink-0">#{player.rank}</span>
                              <div className="h-7 w-7 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-slate-450 font-black text-[10px] shrink-0 shadow-[1px_1px_0px_#000000]">{player.name ? player.name.charAt(0) : "?"}</div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-tight text-slate-50 leading-tight truncate">{player.name}</p>
                                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest truncate mt-0.5">{player.favorite}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div>
                                <p className="text-[10px] font-space font-black text-brand-orange leading-none">{player.xp.toLocaleString()}</p>
                                <p className="text-[7px] font-black text-slate-500 uppercase mt-0.5 text-right">XP</p>
                              </div>
                              <span className="flex items-center gap-0.5 text-[8px] font-black text-info bg-info/10 border-2 border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000000] shrink-0">
                                <Flame className="w-2.5 h-2.5 text-brand-orange fill-current" /> {player.streak}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop table */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                          <thead>
                            <tr className="border-b-2 border-black text-[8px] font-black uppercase tracking-widest text-slate-500">
                              <th className="px-5 py-3">Rank</th>
                              <th className="px-5 py-3">Player</th>
                              <th className="px-5 py-3">Fav. Game</th>
                              <th className="px-5 py-3 text-center">Wins</th>
                              <th className="px-5 py-3 text-center">Streak</th>
                              <th className="px-5 py-3 text-right">XP</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-black">
                            {rest.map((player) => (
                              <tr key={player.rank} className="group hover:bg-slate-900/10 transition-colors">
                                <td className="px-5 py-3">
                                  <span className="font-space text-xs font-black text-brand-orange opacity-40 group-hover:opacity-100 transition-opacity">#{player.rank}</span>
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-slate-500 font-black text-[10px] shadow-[1px_1px_0px_#000]">{player.name ? player.name.charAt(0) : "?"}</div>
                                    <div>
                                      <p className="text-[11px] font-black uppercase tracking-tight text-slate-50 mb-0.5 group-hover:text-brand-orange transition-colors">{player.name}</p>
                                      <p className="text-[7px] font-black text-slate-550 uppercase tracking-widest flex items-center gap-1"><Star className="w-2.5 h-2.5 text-brand-orange fill-current" /> Tier Elite</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-[9px] font-black uppercase text-slate-455 tracking-widest">{player.favorite}</td>
                                <td className="px-5 py-3 text-center text-[11px] font-black text-slate-50">{player.wins}</td>
                                <td className="px-5 py-3 text-center">
                                  <span className="flex items-center justify-center gap-1 text-[11px] font-black text-info">
                                    <Flame className="w-2.5 h-2.5 text-brand-orange fill-current" /> {player.streak}
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <span className="text-[11px] font-space font-black text-brand-orange">{player.xp.toLocaleString()}</span>
                                    <ArrowUpRight className="w-2.5 h-2.5 text-slate-700 group-hover:text-brand-orange transition-colors" />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

        </section>
      </main>

      <Footer />
    </div>
  );
}
