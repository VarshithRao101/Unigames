"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Search, 
  Gamepad2, 
  Zap, 
  Trophy, 
  Swords, 
  Target, 
  Play, 
  Timer, 
  Activity, 
  Sparkles, 
  Clock, 
  Users, 
  ShieldAlert, 
  Crown,
  RotateCcw,
  Sparkle
} from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { PLATFORM_GAMES } from "@/data/platform";
import { motion, AnimatePresence, useInView } from "framer-motion";

const filters = ["All", "Board Games", "Arcade", "Strategy", "Social"];

/* ── REUSABLE ANIMATED COUNTER ── */
function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const isDecimal = target.includes(".");
    const duration = 2000;
    const steps = 60;
    const increment = num / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, num);
      if (isDecimal) {
        setDisplay(current.toFixed(1));
      } else {
        setDisplay(Math.round(current).toString());
      }
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  const unit = target.replace(/[0-9.]/g, "");

  return (
    <span ref={ref} className="font-space">
      {display}
      {unit}
      {suffix}
    </span>
  );
}

export default function GamesPage() {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  /* ── 1. TICKER STATE ── */
  const tickerEvents = useMemo(() => [
    "GARRY IS CURRENTLY DOMINATING THE LEADERBOARD IN SECTOR XO",
    "NEW PRIVATE LOBBY DEPLOYED: LDO908 — LUDO RUSH",
    "ACTIVE COMBATANT COUNT REACHED 2,842 PLAYERS ONLINE",
    "CHESS ARENA SECTOR CHS901 ENGAGED — BATTLE IN PROGRESS",
    "VARSHITH UNLOCKED ACHIEVEMENT 'UNSTOPPABLE DUELIST'",
  ], []);

  const [currentEventIdx, setCurrentEventIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIdx((prev) => (prev + 1) % tickerEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tickerEvents]);

  /* ── 2. RICH LIST OF GAMES ── */
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

  /* ── 3. PLAYABLE MINI TIC-TAC-TOE BOARD STATE ── */
  const [miniBoard, setMiniBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [miniResult, setMiniResult] = useState<string | null>(null); // "Player Wins", "AI Wins", "Draw", null
  const [miniScore, setMiniScore] = useState({ player: 0, ai: 0, draws: 0 });
  const [winningCells, setWinningCells] = useState<number[] | null>(null);

  // Check board win condition
  const checkMiniWin = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: [a, b, c] };
      }
    }
    return null;
  };

  // Player click handler
  const handleMiniCellClick = (index: number) => {
    if (!isPlayerTurn || miniBoard[index] || miniResult) return;

    const newBoard = [...miniBoard];
    newBoard[index] = "X";
    setMiniBoard(newBoard);

    const winCheck = checkMiniWin(newBoard);
    if (winCheck) {
      setMiniResult("Player Wins");
      setWinningCells(winCheck.line);
      setMiniScore(prev => ({ ...prev, player: prev.player + 1 }));
      return;
    }

    if (newBoard.every(cell => cell !== null)) {
      setMiniResult("Draw");
      setMiniScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }

    setIsPlayerTurn(false);

    // AI bot play delay
    setTimeout(() => {
      const aiBoard = [...newBoard];
      const emptyCells = aiBoard.map((c, idx) => c === null ? idx : null).filter(c => c !== null) as number[];
      
      if (emptyCells.length === 0) return;

      // Smart AI logic: 
      // 1. Can AI win?
      let move = -1;
      for (const idx of emptyCells) {
        const testBoard = [...aiBoard];
        testBoard[idx] = "O";
        if (checkMiniWin(testBoard)?.winner === "O") {
          move = idx;
          break;
        }
      }

      // 2. Can player win? Block.
      if (move === -1) {
        for (const idx of emptyCells) {
          const testBoard = [...aiBoard];
          testBoard[idx] = "X";
          if (checkMiniWin(testBoard)?.winner === "X") {
            move = idx;
            break;
          }
        }
      }

      // 3. Random choice
      if (move === -1) {
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }

      aiBoard[move] = "O";
      setMiniBoard(aiBoard);

      const aiWinCheck = checkMiniWin(aiBoard);
      if (aiWinCheck) {
        setMiniResult("AI Wins");
        setWinningCells(aiWinCheck.line);
        setMiniScore(prev => ({ ...prev, ai: prev.ai + 1 }));
        setIsPlayerTurn(true);
        return;
      }

      if (aiBoard.every(cell => cell !== null)) {
        setMiniResult("Draw");
        setMiniScore(prev => ({ ...prev, draws: prev.draws + 1 }));
        setIsPlayerTurn(true);
        return;
      }

      setIsPlayerTurn(true);
    }, 500);
  };

  // Reset mini board
  const resetMiniGame = () => {
    setMiniBoard(Array(9).fill(null));
    setMiniResult(null);
    setWinningCells(null);
    setIsPlayerTurn(true);
  };

  return (
    <div className="bg-slate-dark text-white min-h-screen">
      <Navbar />

      <main suppressHydrationWarning>
        {/* ── 1. HERO LAUNCHER ── */}
        <section className="relative min-h-[48vh] md:min-h-[55vh] py-8 md:py-10 flex items-center justify-center pt-16 overflow-hidden">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero.png" 
              alt="Sector Hub Background" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-dark/20 via-slate-dark/80 to-slate-dark" />
          </div>

          {/* Floating 2D Cartoon Game Decors (Centering and Very Transparent) */}
          <motion.div 
            animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[12%] md:left-[18%] top-1/3 w-14 h-14 md:w-20 md:h-20 z-10 pointer-events-none opacity-[0.05] md:opacity-[0.07]"
          >
            <img src="/images/cartoon_gamepad.png" alt="Gamepad Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 8, 0], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[12%] md:right-[18%] bottom-1/3 w-14 h-14 md:w-20 md:h-20 z-10 pointer-events-none opacity-[0.05] md:opacity-[0.07]"
          >
            <img src="/images/cartoon_shield.png" alt="Shield Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
          </motion.div>

          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="kicker mb-3">Operational Command</span>
                <h1 className="text-4xl md:text-5xl font-black mb-3 leading-[0.9] tracking-tighter uppercase">
                  SELECT YOUR <br />
                  <span className="gradient-text">TACTICAL ARENA</span>
                </h1>

                <p className="text-xs md:text-sm text-slate-400 mb-6 max-w-xl mx-auto font-medium leading-relaxed">
                  Connect to active match sectors, configure customizable rules, 
                  and deploy your squad to dominate the leaderboard standings.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/rooms/create">
                    <Button className="btn-gaming h-12 px-8 rounded-xl text-sm shadow-neon-orange">
                      Deploy Lobby <Zap className="ml-2 w-4 h-4 fill-current" />
                    </Button>
                  </Link>
                  <a href="#sectors">
                    <Button variant="outline" className="h-12 px-8 rounded-xl border-2 border-black hover:bg-white/5 transition-all text-sm backdrop-blur-md">
                      Scan Sectors <Gamepad2 className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 2. LIVE ACTIVITY TICKER MARQUEE ── */}
        <section className="relative overflow-hidden py-3 bg-slate-dark/20 border-y border-black">
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

        {/* ── 3. SEARCH & DIRECTORIES SECTORS ── */}
        <section className="section-padding bg-slate-dark/30" id="sectors">
          <div className="container mx-auto px-6 max-w-7xl">
            {/* Filter Bar Panel */}
            <div className="glass p-2 rounded-[2.5rem] mb-12">
              <div className="bg-slate-dark/50 rounded-[2.3rem] p-4 flex flex-col lg:flex-row items-center gap-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text" 
                    placeholder="SEARCH SECTORS..."
                    className="w-full h-14 bg-slate-dark border-2 border-black rounded-2xl px-16 text-[9px] font-black uppercase tracking-[0.25em] text-white focus:outline-none focus:border-brand-orange"
                  />
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
                  {filters.map(filter => (
                    <button 
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-5 h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 border-black ${
                        selectedFilter === filter 
                          ? 'bg-brand-orange text-slate-950 shadow-[4px_4px_0px_#000000]' 
                          : 'bg-white/5 text-slate-400 hover:border-brand-orange/30'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGames.map((game, i) => {
                const isComingSoon = game.status === "in-dev";
                
                return (
                  <motion.article 
                    key={game.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                    className={`group relative h-[450px] rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-8 ${
                      isComingSoon 
                        ? 'border-2 border-dashed border-slate-700 bg-white/2' 
                        : 'border-2 border-black bg-slate-dark/60 glass panel-interactive shadow-card'
                    }`}
                  >
                    {/* Thumbnail backgrounds */}
                    {!isComingSoon && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-dark via-slate-dark/50 to-transparent z-10" />
                        {game.image ? (
                          <img 
                            src={game.image} 
                            alt={game.name} 
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700" 
                          />
                        ) : (
                          <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                            <Gamepad2 className="w-16 h-16 text-white/5" />
                          </div>
                        )}
                      </>
                    )}

                    {/* Card Header Status */}
                    <div className="relative z-20 flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-black font-black text-[8px] uppercase tracking-widest text-slate-400">
                        CMD-{game.shortCode}
                      </span>
                      
                      {game.status === 'released' && (
                        <span className="px-2.5 py-1 rounded-md bg-success/15 border border-success/30 text-success font-black text-[8px] uppercase tracking-widest">
                          Operational
                        </span>
                      )}
                      {game.status === 'beta' && (
                        <span className="px-2.5 py-1 rounded-md bg-brand-orange/15 border border-brand-orange/30 text-brand-orange font-black text-[8px] uppercase tracking-widest">
                          Beta Testing
                        </span>
                      )}
                      {isComingSoon && (
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-black text-slate-500 font-black text-[8px] uppercase tracking-widest animate-pulse">
                          Syncing Sector
                        </span>
                      )}
                    </div>

                    {/* Card Content & Action Area */}
                    <div className="relative z-20">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {game.tags.map((t, idx) => (
                          <span key={idx} className="text-[7px] font-black uppercase tracking-widest text-slate-500 border border-slate-700/40 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter text-white group-hover:text-brand-orange transition-colors">
                        {game.name}
                      </h3>
                      
                      <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-6 line-clamp-2">
                        {game.description}
                      </p>

                      {/* Synchronization Progress Bar */}
                      <div className="space-y-1 mb-6">
                        <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-wider text-slate-500">
                          <span>Sync Integrity</span>
                          <span>{game.progressPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 border border-black rounded-full overflow-hidden">
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
                          <Button disabled className="w-full h-11 border-2 border-slate-800 bg-transparent text-slate-600 rounded-xl uppercase text-[9px] font-black cursor-not-allowed">
                            Offline Sector
                          </Button>
                        ) : (
                          <Link href={`/games/${game.slug}`} className="w-full">
                            <Button className="btn-gaming w-full h-11 rounded-xl font-black uppercase text-[9px]">
                              Deploy Arena <Play className="ml-2 w-3.5 h-3.5 fill-current" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 4. SECTOR STATISTICS & ACTIVE DUELS ── */}
        <section className="section-padding bg-slate-dark/30 border-y border-black relative overflow-hidden">
          {/* Floating 2D Trophy overlay */}
          <motion.div 
            animate={{ rotate: [0, 3, -3, 0], y: [0, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-4 md:right-24 top-6 w-14 h-14 md:w-20 md:h-20 z-0 pointer-events-none opacity-[0.05]"
          >
            <img src="/images/cartoon_trophy.png" alt="Trophy Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
          </motion.div>

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
              
              {/* Left Column: Sector Live Statistics */}
              <div className="glass p-6 md:p-8 rounded-[2.5rem]">
                <div className="mb-8">
                  <span className="kicker mb-2 inline-flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Sector Diagnostics
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Live Sector Stats</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Matches Synced", val: "48.2k", color: "text-brand-orange" },
                    { label: "Active Matchrooms", val: "142", color: "text-success" },
                    { label: "Avg Execution Time", val: "04.2s", color: "text-info" },
                    { label: "Global Combatants", val: "14.2k", color: "text-purple" }
                  ].map((stat, idx) => (
                    <div key={idx} className="p-5 bg-slate-dark/60 rounded-2xl border-2 border-black flex flex-col justify-center">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</span>
                      <span className={`text-2xl md:text-3xl font-space font-black tracking-tight ${stat.color}`}>
                        <AnimatedCounter target={stat.val} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Live Match Uplinks */}
              <div className="glass p-6 md:p-8 rounded-[2.5rem]">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <span className="kicker mb-2 inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Active Feeds
                    </span>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Uplink Feeds</h2>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                </div>

                <div className="space-y-3">
                  {[
                    { p1: "GARRY", p2: "LUNA", game: "Chess Arena", code: "CHS901", duration: "12m" },
                    { p1: "VARSHITH", p2: "NOVA", game: "Tic-Tac-Toe", code: "TIC881", duration: "2m" },
                    { p1: "BOARDKING", p2: "ROOKSTAR", game: "Tic-Tac-Toe", code: "TIC442", duration: "4m" }
                  ].map((match, i) => (
                    <div key={i} className="p-3.5 bg-slate-dark/60 rounded-xl border-2 border-black flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-black text-brand-orange uppercase">{match.p1}</span>
                          <span className="text-[7px] text-slate-650 font-black">VS</span>
                          <span className="text-[10px] font-black text-white uppercase">{match.p2}</span>
                        </div>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                          {match.game} · {match.code} · {match.duration} elapsed
                        </p>
                      </div>

                      <Link href={`/rooms/${match.code}`}>
                        <Button className="h-8 px-4 rounded-lg font-black uppercase text-[8px] bg-white/5 border border-black hover:bg-brand-orange hover:text-slate-950 transition-colors">
                          Spectate
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 5. INTERACTIVE TRAINING ZONE (PLAYABLE TIC-TAC-TOE) ── */}
        <section className="section-padding">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="glass p-6 md:p-10 rounded-[2.5rem] border-2 border-black bg-slate-dark/40">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-center">
                
                {/* Information Area */}
                <div>
                  <span className="kicker mb-4 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Intelligence Sector
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black mb-4 leading-[0.9] tracking-tighter uppercase">
                    TACTICAL <span className="gradient-text">WARMUP LOBBY</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mb-6 font-medium leading-relaxed max-w-lg">
                    Train your spatial calculations before entering competitive sector matches. 
                    Duel the local AI core in this mini playable Tic-Tac-Toe warmup arena.
                  </p>

                  {/* Scoreboard stats */}
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-dark/80 border-2 border-black max-w-sm">
                    <div className="flex-1 text-center">
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Player Wins</p>
                      <p className="text-xl font-space font-black text-brand-orange">{miniScore.player}</p>
                    </div>
                    <div className="w-[1px] bg-slate-800" />
                    <div className="flex-1 text-center">
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Wins</p>
                      <p className="text-xl font-space font-black text-danger">{miniScore.ai}</p>
                    </div>
                    <div className="w-[1px] bg-slate-800" />
                    <div className="flex-1 text-center">
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Draws</p>
                      <p className="text-xl font-space font-black text-slate-400">{miniScore.draws}</p>
                    </div>
                  </div>
                </div>

                {/* Minigame Board Area */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative p-2 bg-slate-dark/80 border-[3.5px] border-black rounded-3xl shadow-card">
                    {/* Status Alert Overlay */}
                    {miniResult && (
                      <div className="absolute inset-0 bg-slate-dark/90 rounded-2xl z-20 flex flex-col items-center justify-center p-4 border border-black">
                        <Crown className={`w-8 h-8 mb-2 ${miniResult === 'Player Wins' ? 'text-brand-orange animate-bounce' : 'text-danger'}`} />
                        <h4 className="text-lg font-black uppercase tracking-tight mb-3">
                          {miniResult}
                        </h4>
                        <Button 
                          onClick={resetMiniGame}
                          className="btn-gaming h-9 px-6 rounded-lg text-[9px] font-black flex items-center gap-1.5"
                        >
                          Rematch <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}

                    {/* The 3x3 Grid */}
                    <div className="grid grid-cols-3 gap-2.5 w-64 h-64">
                      {miniBoard.map((cell, idx) => {
                        const isWinning = winningCells?.includes(idx);
                        return (
                          <div 
                            key={idx}
                            onClick={() => handleMiniCellClick(idx)}
                            className={`rounded-xl border-2 border-black flex items-center justify-center text-2xl font-space font-black cursor-pointer transition-all duration-150 select-none ${
                              cell === "X" 
                                ? "bg-brand-orange/15 text-brand-orange" 
                                : cell === "O" 
                                  ? "bg-danger/15 text-danger" 
                                  : "bg-slate-dark hover:bg-slate-800"
                            } ${isWinning ? 'animate-pulse scale-105 border-brand-orange' : ''}`}
                          >
                            {cell}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {!miniResult && (
                    <p className="text-[8px] font-black text-slate-550 uppercase tracking-widest mt-3">
                      {isPlayerTurn ? "Your turn (Place X)" : "AI Core calculating..."}
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── 6. LEVEL UP YOUR GAMING LEGACY (CTA BANNER) ── */}
        <section className="section-padding">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative h-[360px] rounded-3xl overflow-hidden border border-brand-orange/30 group"
            >
              <img src="/images/hero.png" alt="Gaming Legacy" className="absolute inset-0 w-full h-full object-cover grayscale opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-[4000ms]" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 via-slate-dark/95 to-slate-dark" />

              {/* Floating 2D Cartoon Game Decors */}
              <motion.div 
                animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-6 top-6 w-16 h-16 pointer-events-none opacity-[0.05] group-hover:opacity-[0.08]"
              >
                <img src="/images/cartoon_gamepad.png" alt="Gamepad Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 6, 0], rotate: [0, -2, 2, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-6 bottom-6 w-16 h-16 pointer-events-none opacity-[0.05] group-hover:opacity-[0.08]"
              >
                <img src="/images/cartoon_shield.png" alt="Shield Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
              </motion.div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-8">
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#ffaa00]/10 border border-brand-orange/30 text-brand-orange font-black text-[9px] uppercase tracking-[0.25em] flex items-center gap-1.5">
                    <Sparkle className="w-3 h-3 animate-spin" /> Custom Host Modules
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black mb-4 leading-[0.9] tracking-tighter uppercase">
                  DEPLOY PRIVATE <br />
                  <span className="gradient-text">GAMING SECTORS</span>
                </h2>
                
                <p className="text-xs md:text-sm text-slate-400 mb-6 max-w-xl mx-auto font-medium leading-relaxed">
                  Ready to deploy coordinates? Configure private passcodes, invite your squads, 
                  and run custom board matches outside the global search parameters.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/rooms/create">
                    <Button className="btn-gaming h-11 px-8 rounded-xl text-sm shadow-neon-orange">
                      Create Custom Room
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
