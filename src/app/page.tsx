"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Play,
  Trophy,
  Zap,
  Globe,
  Users,
  ChevronRight,
  Gamepad2,
  Star,
  Activity,
  Timer,
  Swords,
  Medal,
  Target,
  ArrowUpRight,
  Crown,
  Bell,
  CheckCircle2,
  Users2,
  Clock,
  Flame,
  Search,
  User,
  DoorOpen
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import {
  LEADERBOARD_DATA,
  PLATFORM_GAMES,
  PLATFORM_METRICS,
  ROOMS_AVAILABLE,
} from "@/data/platform";

/* ── REUSABLE ANIMATED COMPONENTS ── */

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

function SectionHeading({ kicker, title, center = false, description }: { kicker: string; title: string; center?: boolean; description?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className={`mb-16 ${center ? "text-center" : ""}`}>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="kicker mb-4"
      >
        {kicker}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl font-black mb-6 tracking-tighter uppercase"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg max-w-2xl mx-auto font-medium"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-slate-dark text-white min-h-screen">
      <Navbar />

      <main>
        {/* ── 1. WHY UNIGAME (HERO) ── */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* Hero Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero.png" 
              alt="Gaming Background" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-dark/20 via-slate-dark/80 to-slate-dark" />
          </div>

          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex justify-center mb-8">
                  <span className="px-4 py-1.5 rounded-full glass-orange border border-brand-orange/30 text-brand-orange font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                    <Flame className="w-3 h-3" /> The Ultimate Gaming Arena
                  </span>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
                  LEVEL UP YOUR <br />
                  <span className="gradient-text">GAMING LEGACY</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                  Join the premier destination for competitive strategy and pulse-pounding rewards. 
                  Real-time rooms, exclusive tournaments, and an elite community waiting for you.
                </p>

                <div className="flex flex-wrap justify-center gap-6">
                  <Button className="btn-gaming h-16 px-10 rounded-2xl text-lg shadow-neon-orange">
                    Start Playing Now <Zap className="ml-2 w-5 h-5 fill-current" />
                  </Button>
                  <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/10 hover:bg-white/10 transition-all text-lg backdrop-blur-md">
                    Explore Rooms <Globe className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>

              {/* Stats Bar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-1 p-1 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl"
              >
                <div className="bg-slate-dark/50 rounded-[2.3rem] p-10 text-center border border-white/5 hover:border-brand-orange/20 transition-all group">
                   <Users2 className="w-8 h-8 text-brand-orange mx-auto mb-4 group-hover:scale-110 transition-transform" />
                   <p className="text-4xl font-space font-black text-white mb-1 uppercase"><AnimatedCounter target="24.8k" /></p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Players</p>
                </div>
                <div className="bg-slate-dark/50 rounded-[2.3rem] p-10 text-center border border-white/5 hover:border-brand-orange/20 transition-all group">
                   <Gamepad2 className="w-8 h-8 text-brand-orange mx-auto mb-4 group-hover:scale-110 transition-transform" />
                   <p className="text-4xl font-space font-black text-white mb-1 uppercase"><AnimatedCounter target="1.2M" /></p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Matches Played</p>
                </div>
                <div className="bg-slate-dark/50 rounded-[2.3rem] p-10 text-center border border-white/5 hover:border-brand-orange/20 transition-all group">
                   <Trophy className="w-8 h-8 text-brand-orange mx-auto mb-4 group-hover:scale-110 transition-transform" />
                   <p className="text-4xl font-space font-black text-white mb-1 uppercase"><AnimatedCounter target="500+" /></p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tournaments Hosted</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 2. FEATURED GAMES ── */}
        <section className="section-padding bg-slate-dark/50" id="games">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading 
              kicker="Game Selection" 
              title="Featured Experiences" 
              description="Choose your battlefield. Each game is visually enhanced for a premium competitive experience."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Tic-Tac-Toe Card */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="group relative h-[500px] overflow-hidden rounded-[3rem] border border-white/10 glass transition-all"
              >
                <img src="/images/tictactoe.png" alt="Tic-Tac-Toe" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-dark via-slate-dark/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-brand-orange text-slate-950 font-black text-[10px] uppercase tracking-widest">Puzzle</span>
                    <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-full border border-white/10">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">1.4k Online</span>
                    </div>
                  </div>
                  <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">Tic-Tac-Toe X</h3>
                  <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <Button size="xl" className="btn-gaming px-10 rounded-2xl">Play Now <Play className="ml-2 w-4 h-4 fill-current" /></Button>
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest border border-white/10 px-3 py-1 rounded-lg">Easy Complexity</span>
                  </div>
                </div>
              </motion.div>

              {/* Chess Card */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="group relative h-[500px] overflow-hidden rounded-[3rem] border border-white/10 glass transition-all"
              >
                <img src="/images/chess.png" alt="Chess" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-dark via-slate-dark/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest">Strategy</span>
                    <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-full border border-white/10">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">3.8k Online</span>
                    </div>
                  </div>
                  <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">Chess Masters</h3>
                  <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <Button size="xl" className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 font-black uppercase text-sm">Challenge <Swords className="ml-2 w-5 h-5" /></Button>
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest border border-white/10 px-3 py-1 rounded-lg">Hard Complexity</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 3. QUICK RUSH ── */}
        <section className="section-padding relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-1/2 bg-brand-orange/5 blur-[120px] -rotate-12" />
          
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="glass rounded-[4rem] border border-brand-orange/20 p-1 lg:p-2">
              <div className="bg-slate-dark/40 rounded-[3.8rem] p-12 md:p-24 flex flex-col md:flex-row items-center gap-20">
                <div className="flex-1">
                  <span className="kicker mb-6 border-brand-orange bg-brand-orange/10 text-brand-orange">Turbo Matchmaking</span>
                  <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
                    INSTANT <span className="gradient-text">QUICK RUSH</span>
                  </h2>
                  <p className="text-lg text-slate-400 mb-12 font-medium leading-relaxed max-w-md">
                    Zero waiting. Zero lag. Our proprietary rush engine matches you with players 
                    at your exact skill level in under 5 seconds. Ready?
                  </p>
                  <Button className="btn-gaming h-16 px-12 rounded-2xl text-xl shadow-neon-orange">
                    Start Quick Rush <Zap className="ml-2 w-6 h-6 fill-current" />
                  </Button>
                </div>

                <div className="flex-1 relative">
                  <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
                    {/* Animated Timer Graphic */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border border-dashed border-brand-orange/40" 
                    />
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-4 rounded-full border border-dashed border-white/10" 
                    />
                    <div className="absolute inset-8 rounded-full glass border border-brand-orange/20 flex flex-col items-center justify-center text-center">
                      <Timer className="w-12 h-12 text-brand-orange mb-4 animate-pulse" />
                      <span className="text-6xl font-space font-black tracking-tighter">04.2s</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Avg Match Wait</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. ROOMS AVAILABLE ── */}
        <section className="section-padding" id="rooms">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <SectionHeading 
                kicker="Live Lobbies" 
                title="Active Multiplayer Rooms" 
              />
              <Link href="/rooms">
                <Button variant="ghost" className="text-slate-400 hover:text-brand-orange font-black uppercase text-xs tracking-widest">
                  Browse All Rooms <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-6">
              {ROOMS_AVAILABLE.slice(0, 4).map((room, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group glass p-2 rounded-3xl border border-white/5 hover:border-brand-orange/30 transition-all duration-300"
                >
                  <div className="bg-slate-dark/50 rounded-[1.4rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-2xl bg-slate-dark border border-white/10 flex items-center justify-center font-space text-3xl font-black text-brand-orange group-hover:scale-110 transition-transform">
                        {room.code.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                           <h3 className="text-2xl font-black uppercase tracking-tight">{room.name}</h3>
                           <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded text-slate-500 font-black">{room.code}</span>
                        </div>
                        <p className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Gamepad2 className="w-4 h-4" /> {room.gameName} Arena • Global Hub
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-16">
                      <div className="text-center">
                         <p className="text-3xl font-space font-black leading-none mb-1">
                           <span className="text-brand-orange">{room.currentPlayers}</span>
                           <span className="text-slate-700"> / {room.maxPlayers}</span>
                         </p>
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Joined</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-success uppercase tracking-widest border border-success/30 px-4 py-2 rounded-xl bg-success/5">
                           {room.status === 'open' ? 'Instant Entry' : 'In Progress'}
                        </span>
                        <Button className="btn-gaming h-14 px-10 rounded-2xl font-black uppercase text-sm">Join Room</Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. JUMP IN NOW ── */}
        <section className="section-padding">
           <div className="container mx-auto px-6 max-w-7xl">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="relative h-[650px] rounded-[5rem] overflow-hidden border border-brand-orange/30 group"
              >
                 <img src="/images/hero.png" alt="Jump In" className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[4000ms]" />
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 via-slate-dark/95 to-slate-dark" />
                 
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                    <span className="kicker mb-10 inline-flex items-center gap-2">
                       <ArrowUpRight className="w-4 h-4" /> Execute Operational Command
                    </span>
                    <h2 className="text-6xl md:text-9xl font-black mb-12 leading-[0.8] tracking-tighter uppercase">
                       READY TO <br />
                       <span className="gradient-text">DOMINATE?</span>
                    </h2>
                    <p className="text-2xl text-slate-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
                       The arena is live, the stakes have never been higher. 
                       Your global legacy starts with a single decisive move.
                    </p>
                    <Link href="/rooms/create">
                       <Button className="btn-gaming h-24 px-20 rounded-[2.5rem] text-3xl shadow-neon-orange">
                          Start Playing
                       </Button>
                    </Link>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* ── 6. HOW IT WORKS ── */}
        <section className="section-padding bg-slate-dark/30 border-y border-white/5">
           <div className="container mx-auto px-6 max-w-7xl">
              <SectionHeading center kicker="Briefing" title="Tactical Onboarding" description="Enter the UniGame ecosystem in under 60 seconds with our high-performance integration process." />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { icon: User, title: "Create Identity", desc: "Build your unique gamer profile and link your competitive history instantly." },
                   { icon: DoorOpen, title: "Join Lobbies", desc: "Enter a live public arena or deploy a private room for your elite squad." },
                   { icon: Gamepad2, title: "Execute Gameplay", desc: "Experience strategy games redesigned with a premium Triple-A aesthetic." },
                   { icon: Crown, title: "Claim Victory", desc: "Climb the global divisions and unlock exclusive season rewards and XP." }
                 ].map((step, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="glass p-12 rounded-[3rem] border border-white/5 hover:border-brand-orange/20 transition-all text-center group"
                   >
                     <div className="w-20 h-20 rounded-3xl bg-brand-orange/10 flex items-center justify-center mx-auto mb-10 border border-brand-orange/20 group-hover:scale-110 group-hover:bg-brand-orange transition-all duration-300 shadow-orange/10">
                        <step.icon className="w-10 h-10 text-brand-orange group-hover:text-slate-950 transition-colors" />
                     </div>
                     <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">{step.title}</h3>
                     <p className="text-sm text-slate-500 font-bold leading-relaxed">{step.desc}</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 7. GLOBAL LEADERBOARD ── */}
        <section className="section-padding bg-mesh" id="leaderboard">
           <div className="container mx-auto px-6 max-w-7xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <SectionHeading kicker="Rankings" title="Global Leaderboard" description="The definitive record of strategic dominance. Earn XP in match rooms to ascend the divisions." />
                <Link href="/leaderboards">
                  <Button variant="outline" className="h-12 px-8 rounded-xl border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest">
                    View Full Standings <ArrowUpRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 {/* Podium / Top Rank */}
                 <motion.div 
                   whileHover={{ scale: 1.01 }}
                   className="lg:col-span-2 relative h-[550px] rounded-[4rem] overflow-hidden border border-brand-orange/40 glass shadow-neon-orange"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 via-slate-dark/90 to-slate-dark" />
                    <div className="absolute inset-0 p-14 flex flex-col justify-end">
                       <span className="px-5 py-2 rounded-full bg-brand-orange text-slate-950 font-black text-[10px] uppercase tracking-[0.3em] w-fit mb-8 shadow-orange/40">CURRENT CHAMPION</span>
                       <div className="flex items-center gap-8 mb-8">
                          <div className="h-24 w-24 rounded-full bg-slate-950 border-4 border-brand-orange flex items-center justify-center text-4xl font-black text-brand-orange shadow-neon-orange">
                             {LEADERBOARD_DATA.weekly[0].name.charAt(0)}
                          </div>
                          <div>
                             <h3 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">{LEADERBOARD_DATA.weekly[0].name}</h3>
                             <p className="text-xl font-space font-black text-brand-orange mt-2 uppercase tracking-widest">LVL 99 • {LEADERBOARD_DATA.weekly[0].favorite} Specialist</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-14 text-white font-black text-xs uppercase tracking-[0.2em]">
                          <div className="flex flex-col gap-2">
                             <span className="text-slate-500">Season XP</span>
                             <span className="text-3xl font-space text-brand-orange">{LEADERBOARD_DATA.weekly[0].xp}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                             <span className="text-slate-500">Win Rate</span>
                             <span className="text-3xl font-space uppercase">94.2%</span>
                          </div>
                       </div>
                    </div>
                 </motion.div>

                 {/* Top Challengers */}
                 <div className="flex flex-col gap-6">
                    {LEADERBOARD_DATA.weekly.slice(1, 4).map((player, i) => (
                      <div key={i} className="glass p-8 rounded-[2.5rem] border border-white/10 hover:border-brand-orange/20 transition-all flex flex-col justify-between group">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-slate-500">
                                  {player.name.charAt(0)}
                               </div>
                               <div>
                                  <h4 className="text-xl font-black uppercase tracking-tighter group-hover:text-brand-orange transition-colors">{player.name}</h4>
                                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Rank #{i + 2}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-lg font-space font-black text-brand-orange leading-none">{player.xp}</p>
                               <p className="text-[8px] font-black text-slate-700 uppercase">XP</p>
                            </div>
                         </div>
                         <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-white/20 group-hover:bg-brand-orange transition-colors" style={{ width: `${85 - i * 15}%` }} />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>


        {/* ── 8. COMMUNITY FEED ── */}
        <section className="section-padding bg-slate-dark/80 relative" id="community">
           <div className="container mx-auto px-6 max-w-7xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <SectionHeading kicker="Social Hub" title="Global Operational Feed" description="Real-time match analytics and community activity broadcasting." />
                <div className="flex items-center gap-4 bg-success/10 border border-success/30 px-4 py-2 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse shadow-success/40" />
                    <span className="text-[10px] font-black text-success uppercase tracking-widest tracking-tighter">Live Network Pulse</span>
                </div>
              </div>

              <div className="glass rounded-[4rem] border border-white/5 p-12 relative overflow-hidden backdrop-blur-3xl">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Activity className="w-80 h-80 text-brand-orange" />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                    {[
                      { p1: 'NovaCore', p2: 'Varshith', g: 'Chess Masters', t: 'Just Now', w: 'NovaCore' },
                      { p1: 'PixelRage', p2: 'StormUser', g: 'Tic-Tac-Toe X', t: '4m Ago', w: 'StormUser' },
                      { p1: 'EliteSlayer', p2: 'Shadow_BX', g: 'Chess Masters', t: '12m Ago', w: 'EliteSlayer' },
                      { p1: 'BoardKing', p2: 'QueenChess', g: 'Tic-Tac-Toe X', t: '24m Ago', w: 'BoardKing' }
                    ].map((match, i) => (
                      <div key={i} className="p-8 rounded-3xl bg-white/2 border border-white/5 hover:border-brand-orange/20 transition-all group">
                         <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{match.t}</span>
                            <div className="h-2 w-2 rounded-full bg-brand-orange shadow-orange/40" />
                         </div>
                         <div className="flex flex-col gap-4 mb-6">
                            <div className="flex items-center justify-between">
                               <span className={`text-sm font-black uppercase ${match.w === match.p1 ? "text-brand-orange" : "text-slate-400"}`}>{match.p1}</span>
                               {match.w === match.p1 && <Crown className="w-3 h-3 text-brand-orange" />}
                            </div>
                            <div className="text-[10px] font-black text-slate-800 italic uppercase">VS</div>
                            <div className="flex items-center justify-between">
                               <span className={`text-sm font-black uppercase ${match.w === match.p2 ? "text-brand-orange" : "text-slate-400"}`}>{match.p2}</span>
                               {match.w === match.p2 && <Crown className="w-3 h-3 text-brand-orange" />}
                            </div>
                         </div>
                         <div className="pt-6 border-t border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{match.g}</p>
                            <Link href="#" className="text-[10px] font-black text-blue-400 uppercase hover:text-white transition-colors">Replay Data</Link>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
