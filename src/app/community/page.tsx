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
  DoorOpen,
  Send,
  Terminal,
  MessageSquare
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
  ONLINE_SQUAD,
  GLOBAL_CHAT_SEED,
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
    <div ref={ref} className={`mb-8 ${center ? "text-center" : ""}`}>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="kicker mb-2"
      >
        {kicker}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        className="text-2xl md:text-3xl font-black mb-3 tracking-tighter uppercase"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto font-medium"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

export default function CommunityPage() {
  const router = useRouter();

  const [activeChannel, setActiveChannel] = useState("global");
  const [chatFeeds, setChatFeeds] = useState<{ [key: string]: Array<{ id: string; sender: string; text: string; time: string }> }>({
    global: GLOBAL_CHAT_SEED,
    VARSHITH: [
      { id: "v1", sender: "VARSHITH", text: "Hey bro! Ready to play Tic-Tac-Toe? I am waiting in lobby TIC881.", time: "19:35" },
      { id: "v2", sender: "You", text: "Just finalizing the operational setup, will join in 2 minutes!", time: "19:37" },
      { id: "v3", sender: "VARSHITH", text: "Awesome! Let me know when you hit ready.", time: "19:38" },
    ],
    NOVA: [
      { id: "n1", sender: "NOVA", text: "Is the new leaderboard updated? I want to see if I made the top 3 weekly.", time: "19:40" },
      { id: "n2", sender: "You", text: "Yes, looks like you are Rank #3 right below Boardking!", time: "19:41" },
    ],
    BOARDKING: [
      { id: "b1", sender: "BOARDKING", text: "Yo, I need one more player for a Chess lobby. You up?", time: "19:42" },
    ],
    LUNA: [
      { id: "l1", sender: "LUNA", text: "GG on the match earlier! Your strategy was amazing.", time: "19:30" },
      { id: "l2", sender: "You", text: "Thanks LUNA! That was a close game. Let's run a rematch soon.", time: "19:32" },
    ]
  });

  const tickerEvents = useMemo(() => [
    "NIGHT BLITZ ROOM IS OPEN — CHESS ARENA · MUMBAI",
    "NOVA CREATED LOBBY TIC442 — TIC-TAC-TOE · SINGAPORE",
    "BOARDKING LAUNCHED PRIVATE ARENA LDO777 — LUDO RUSH · MUMBAI",
    "LUNA ACQUIRED WEEKLY LEADERBOARD DIVISION #4 — TIC-TAC-TOE",
    "GARRY JOINED ACTIVE ROOM CHS901 — CHESS ARENA · MUMBAI",
  ], []);

  const [currentEventIdx, setCurrentEventIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIdx((prev) => (prev + 1) % tickerEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tickerEvents]);

  const [chatText, setChatText] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const currentMessages = useMemo(() => {
    return chatFeeds[activeChannel] || [];
  }, [chatFeeds, activeChannel]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  const handleChatSend = (event: React.FormEvent) => {
    event.preventDefault();
    if (!chatText.trim()) return;

    const newMessage = {
      id: `${Date.now()}`,
      sender: "You",
      text: chatText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatFeeds((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMessage]
    }));
    setChatText("");
  };

  return (
    <div className="bg-slate-dark text-white min-h-screen">
      <Navbar />

      <main suppressHydrationWarning>
        {/* ── 1. READY TO DOMINATE? (HERO) ── */}
        <section className="relative min-h-[48vh] md:min-h-[55vh] py-8 md:py-10 flex items-center justify-center pt-16 overflow-hidden">
          {/* Hero Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero.png" 
              alt="Gaming Background" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-dark/20 via-slate-dark/80 to-slate-dark" />
          </div>

          {/* Floating 2D Cartoon Game Decors (Highly Transparent & Centered Placements) */}
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
                <h1 className="text-4xl md:text-5xl font-black mb-3 leading-[0.9] tracking-tighter uppercase">
                  READY TO <br />
                  <span className="gradient-text">DOMINATE?</span>
                </h1>

                <p className="text-xs md:text-sm text-slate-400 mb-6 max-w-xl mx-auto font-medium leading-relaxed">
                  The arena is live, the stakes have never been higher. 
                  Your global legacy starts with a single decisive move.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/rooms/create">
                    <Button className="btn-gaming h-12 px-8 rounded-xl text-sm shadow-neon-orange">
                      Start Playing <Zap className="ml-2 w-4 h-4 fill-current" />
                    </Button>
                  </Link>
                  <Link href="/rooms">
                    <Button variant="outline" className="h-12 px-8 rounded-xl border-white/10 hover:bg-white/10 transition-all text-sm backdrop-blur-md">
                      Explore Lobbies <Globe className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 1.5. LIVE EVENT TICKER MARQUEE ── */}
        <section className="relative overflow-hidden py-3 bg-slate-dark/20 border-y border-white/5">
          <div className="container mx-auto px-6 max-w-7xl">
            {/* The Outer Bar */}
            <div className="glass py-2 px-4 rounded-xl flex items-center gap-3 bg-slate-dark/80 relative overflow-hidden">
              
              {/* LIVE indicator badge */}
              <div className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-brand-orange/45 bg-[#ffaa00]/10 px-2 py-0.5 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse" />
                <span className="font-space text-[8px] font-black uppercase tracking-wider text-brand-orange">LIVE</span>
              </div>

              {/* Lightning icon */}
              <Zap className="w-3.5 h-3.5 text-brand-orange fill-current animate-pulse flex-shrink-0" />

              {/* Ticker alert text */}
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

        {/* ── 2. TACTICAL ACTIONS ── */}
        <section className="section-padding bg-slate-dark/30 border-y border-white/5">
           <div className="container mx-auto px-6 max-w-7xl">
              <SectionHeading 
                center 
                kicker="Briefing" 
                title="Tactical Onboarding" 
                description="Enter the UniGame ecosystem in under 60 seconds with our high-performance integration process." 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                 {[
                   { 
                     icon: User, 
                     title: "Create Profile", 
                     desc: "Build your unique gamer profile, customize your identity, and track your persistent stats.",
                     href: "/profile" 
                   },
                   { 
                     icon: DoorOpen, 
                     title: "Join Rooms", 
                     desc: "Browse the live lobby directory, scan active battle sectors, or sync via room code.",
                     href: "/rooms" 
                   },
                   { 
                     icon: Gamepad2, 
                     title: "Create Rooms", 
                     desc: "Deploy custom lobbies, configure arena parameters, and authorize friends to join.",
                     href: "/rooms/create" 
                   }
                 ].map((step, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 15 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.08 }}
                     className="glass p-5 rounded-2xl border border-white/5 hover:border-brand-orange/20 transition-all text-center group cursor-pointer"
                   >
                     <Link href={step.href}>
                       <div>
                         <div className="w-11 h-11 rounded-xl bg-brand-orange/10 flex items-center justify-center mx-auto mb-4 border border-brand-orange/20 group-hover:scale-105 group-hover:bg-brand-orange transition-all duration-300 shadow-orange/10">
                            <step.icon className="w-5 h-5 text-brand-orange group-hover:text-slate-950 transition-colors" />
                         </div>
                         <h3 className="text-base font-black mb-2 uppercase tracking-tight">{step.title}</h3>
                         <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{step.desc}</p>
                       </div>
                     </Link>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 3. COMMUNICATION UPLINK (CHAT & SQUAD) ── */}
        <section className="section-padding bg-slate-dark/30 border-y border-white/5 relative overflow-hidden" id="chat">
          {/* Floating 2D Cartoon Game Decors (More Transparent) */}
          <motion.div 
            animate={{ rotate: [0, 3, -3, 0], y: [0, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-4 md:right-24 top-6 w-14 h-14 md:w-20 md:h-20 z-0 pointer-events-none opacity-[0.05] md:opacity-[0.07]"
          >
            <img src="/images/cartoon_trophy.png" alt="Trophy Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
          </motion.div>

           <div className="container mx-auto px-6 max-w-7xl relative z-10">
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
                <div className="max-w-2xl">
                   <span className="kicker mb-2 inline-flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" /> {activeChannel === "global" ? "Global Comms Channel" : "Direct Comms Channel"}
                   </span>
                   <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter uppercase leading-[0.9]">
                      {activeChannel === "global" ? (
                        <>COMMUNICATION <span className="gradient-text">UPLINK</span></>
                      ) : (
                        <>DIRECT CHAT <span className="gradient-text">{activeChannel}</span></>
                      )}
                   </h2>
                   <p className="text-xs md:text-sm text-slate-400 font-medium">
                      {activeChannel === "global" 
                        ? "Coordinate tactical maneuvers, share access keys, and maintain synchronization with the global squad in real-time."
                        : `Secure point-to-point connection established with operator ${activeChannel}. Transmit encrypted messages below.`}
                   </p>
                </div>
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-2.5 items-center gap-4 backdrop-blur-xl">
                   <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-success">Node Online</span>
                   </div>
                   <div className="h-6 w-[1px] bg-white/10" />
                   <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-brand-orange" />
                      <span className="text-sm font-space font-black text-white">482</span>
                   </div>
                </div>
             </div>

             <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
               {/* Active Members Sidebar */}
               <aside className="space-y-6">
                  <div className="glass p-4 rounded-2xl border border-white/5 shadow-2xl">
                     <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Active Squad</h4>
                        <Activity className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
                     </div>
                     
                     <div className="space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-hide pr-1">
                        {/* Global Lobby Link */}
                        <div 
                          onClick={() => setActiveChannel("global")}
                          className={`group p-2 rounded-xl border cursor-pointer transition-all ${
                            activeChannel === "global" 
                              ? "border-brand-orange bg-brand-orange/10 shadow-premium" 
                              : "border-white/5 bg-white/2 hover:border-brand-orange/30 hover:bg-white/5"
                          }`}
                        >
                           <div className="flex items-center gap-2">
                              <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-black text-[10px] shadow-2xl relative transition-all ${
                                activeChannel === "global" ? "bg-brand-orange text-slate-950" : "bg-slate-dark border border-white/10 text-brand-orange"
                              }`}>
                                 G
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className={`text-[11px] font-black uppercase tracking-tighter transition-colors truncate ${
                                   activeChannel === "global" ? "text-brand-orange" : "text-white group-hover:text-brand-orange"
                                 }`}>Global Comms</p>
                                 <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest truncate">Public Lobby Chat</p>
                              </div>
                              <Globe className={`w-3 h-3 ${activeChannel === "global" ? "text-brand-orange animate-pulse" : "text-slate-700"}`} />
                           </div>
                        </div>

                        {ONLINE_SQUAD.map((member) => {
                          const isSelected = activeChannel === member.name;
                          return (
                            <div 
                              key={member.id} 
                              onClick={() => setActiveChannel(member.name)}
                              className={`group p-2 rounded-xl border cursor-pointer transition-all ${
                                isSelected 
                                  ? "border-brand-orange bg-brand-orange/10 shadow-premium" 
                                  : "border-white/5 bg-white/2 hover:border-brand-orange/30 hover:bg-white/5"
                              }`}
                            >
                               <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-slate-dark border border-white/10 flex items-center justify-center font-black text-[10px] text-slate-500 shadow-2xl relative">
                                     {member.name.charAt(0)}
                                     <span className="absolute bottom-0 right-0 h-1.5 w-1.5 bg-success rounded-full border border-slate-950" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <p className={`text-[11px] font-black uppercase tracking-tighter transition-colors truncate ${
                                       isSelected ? "text-brand-orange" : "text-white group-hover:text-brand-orange"
                                     }`}>{member.name}</p>
                                     <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest truncate">{member.activity}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                     <Zap className={`w-3 h-3 ${isSelected ? "text-brand-orange" : "text-slate-800"}`} />
                                  </div>
                               </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>
               </aside>

               {/* Chat Node */}
               <section className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[320px] shadow-2xl relative">
                  {/* Chat Background Decor */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-full bg-mesh rotate-12" />
                  </div>

                  {/* Messages Area */}
                  <div 
                    ref={chatScrollRef}
                    className="flex-1 p-3 md:p-4 overflow-y-auto scrollbar-hide space-y-2.5 relative z-10"
                  >
                     <AnimatePresence initial={false}>
                        {currentMessages.length > 0 ? (
                          currentMessages.map((message, i) => (
                             <motion.div 
                               key={message.id}
                               initial={{ opacity: 0, x: message.sender === 'You' ? 15 : -15 }}
                               animate={{ opacity: 1, x: 0 }}
                               className={`flex flex-col ${message.sender === 'You' ? 'items-end' : 'items-start'}`}
                             >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                   <span className={`text-[9px] font-black uppercase tracking-widest ${message.sender === 'You' ? 'text-brand-orange' : 'text-slate-500'}`}>
                                      {message.sender}
                                   </span>
                                   <span className="text-[7px] font-black text-slate-850 tracking-[0.2em]">{message.time}</span>
                                </div>
                                <div className={`max-w-[80%] p-2.5 py-2 rounded-xl border transition-all duration-300 ${
                                  message.sender === 'You' 
                                    ? 'bg-brand-orange/10 border-brand-orange/30 rounded-tr-none text-white' 
                                    : 'bg-white/5 border-white/5 rounded-tl-none text-slate-300'
                                }`}>
                                   <p className="text-xs font-medium leading-relaxed">{message.text}</p>
                                </div>
                             </motion.div>
                          ))
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-650 text-xs font-bold uppercase tracking-widest select-none">
                             No messages in direct channel
                          </div>
                        )}
                     </AnimatePresence>
                  </div>

                  {/* Input Area */}
                  <div className="p-3 md:p-4 bg-white/2 border-t border-white/5 relative z-20 backdrop-blur-xl">
                     <form onSubmit={handleChatSend} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                           <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                           <input 
                             value={chatText}
                             onChange={(e) => setChatText(e.target.value)}
                             type="text" 
                             placeholder={activeChannel === "global" ? "INPUT TRANSMISSION..." : `SEND MESSAGE TO ${activeChannel}...`}
                             className="w-full h-10 bg-slate-dark/80 border border-white/10 rounded-xl px-12 text-[9px] font-black uppercase tracking-[0.25em] text-white focus:outline-none focus:border-brand-orange/50"
                           />
                        </div>
                        <Button type="submit" className="btn-gaming h-10 px-6 rounded-xl text-xs">
                           Transmit <Send className="ml-1.5 w-4 h-4 fill-current" />
                        </Button>
                     </form>
                  </div>
               </section>
             </div>
           </div>
        </section>

        {/* ── 4. QUICK RUSH ── */}
        <section className="relative overflow-hidden py-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-1/2 bg-brand-orange/5 blur-[120px] -rotate-12" />
          
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="glass rounded-3xl border border-brand-orange/20 p-0.5">
              <div className="bg-slate-dark/40 rounded-[1.4rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1">
                  <span className="kicker mb-4 border-brand-orange bg-brand-orange/10 text-brand-orange">Turbo Matchmaking</span>
                  <h2 className="text-3xl md:text-4xl font-black mb-4 leading-[0.9] tracking-tighter uppercase">
                    INSTANT <span className="gradient-text">QUICK RUSH</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mb-6 font-medium leading-relaxed max-w-sm">
                    Zero waiting. Zero lag. Our proprietary rush engine matches you with players 
                    at your exact skill level in under 5 seconds. Ready?
                  </p>
                  <Button className="btn-gaming h-12 px-8 rounded-xl text-sm shadow-neon-orange">
                    Start Quick Rush <Zap className="ml-2 w-4 h-4 fill-current" />
                  </Button>
                </div>

                <div className="flex-1 relative">
                  <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto">
                    {/* Animated Timer Graphic */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border border-dashed border-brand-orange/40" 
                    />
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-3 rounded-full border border-dashed border-white/10" 
                    />
                    <div className="absolute inset-6 rounded-full glass border border-brand-orange/20 flex flex-col items-center justify-center text-center">
                      <Timer className="w-8 h-8 text-brand-orange mb-2 animate-pulse" />
                      <span className="text-4xl font-space font-black tracking-tighter">04.2s</span>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Avg Match Wait</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. ROOMS AVAILABLE ── */}
        <section className="section-padding" id="rooms">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: LIVE ROOM LIST */}
              <div className="glass p-6 md:p-8 rounded-[2.5rem] flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="kicker mb-2 inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Rooms Available
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Live Room List</h2>
                  </div>
                  <Link href="/rooms">
                    <Button variant="outline" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5 rounded-xl">
                      Browse All
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4 flex-1">
                  {[
                    {
                      id: "room-mock-1",
                      name: "NIGHT BLITZ",
                      code: "CHS901",
                      gameName: "Chess Arena",
                      currentPlayers: 1,
                      maxPlayers: 2,
                      region: "Mumbai",
                      note: "Quick ranked match. Join if you want a fast duel.",
                      status: "open",
                      isPrivate: false,
                    },
                    {
                      id: "room-mock-2",
                      name: "QUICK WARMUP",
                      code: "TIC442",
                      gameName: "Tic-Tac-Toe",
                      currentPlayers: 2,
                      maxPlayers: 2,
                      region: "Singapore",
                      note: "Fast rematches and short rounds.",
                      status: "live",
                      isPrivate: false,
                    },
                    {
                      id: "room-mock-3",
                      name: "FRIENDS TABLE",
                      code: "LDO777",
                      gameName: "Ludo Rush",
                      currentPlayers: 3,
                      maxPlayers: 4,
                      region: "Mumbai",
                      note: "Private room. Use passcode 1234 for the demo preview.",
                      status: "open",
                      isPrivate: true,
                    },
                    {
                      id: "room-mock-4",
                      name: "WEEKEND CASUAL",
                      code: "SNK220",
                      gameName: "Snakes and Ladders",
                      currentPlayers: 6,
                      maxPlayers: 6,
                      region: "Dubai",
                      note: "Full room. Good example of a packed casual lobby.",
                      status: "full",
                      isPrivate: false,
                    }
                  ].map((room, i) => (
                    <div 
                      key={room.id}
                      className="p-4 bg-slate-dark/60 rounded-2xl border border-white/5 hover:border-brand-orange/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-base font-black tracking-tight text-white">{room.name}</h3>
                          <span className="text-[8px] bg-slate-dark border border-white/10 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">{room.code}</span>
                          {room.isPrivate && (
                            <span className="text-[8px] bg-danger/10 border border-danger/20 text-danger px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-danger rounded-full" /> Private
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          {room.gameName} · {room.currentPlayers}/{room.maxPlayers} players · {room.region}
                        </p>
                        <p className="text-[9px] text-slate-650 font-medium line-clamp-1 group-hover:text-slate-500 transition-colors">
                          {room.note}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 justify-end sm:justify-start">
                        {room.status === "open" && (
                          <span className="text-[8px] font-black text-success uppercase tracking-widest border border-success/30 px-2 py-0.5 rounded bg-success/5">
                            Open
                          </span>
                        )}
                        {room.status === "live" && (
                          <span className="text-[8px] font-black text-brand-orange uppercase tracking-widest border border-brand-orange/30 px-2 py-0.5 rounded bg-brand-orange/5">
                            Live
                          </span>
                        )}
                        {room.status === "full" && (
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded bg-white/5">
                            Full
                          </span>
                        )}

                        <Link href={`/rooms/${room.code}`}>
                          <Button className="btn-gaming h-8 px-4 rounded-lg font-black uppercase text-[10px]">
                            {room.status === "full" ? "View" : "Join"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: SLEEK BATTLE LOOP */}
              <div className="glass p-6 md:p-8 rounded-[2.5rem] flex flex-col h-full">
                <div className="mb-6">
                  <span className="kicker mb-2 inline-flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> How it Works
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Sleek Battle Loop</h2>
                </div>

                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  {[
                    {
                      step: "01",
                      title: "CHOOSE YOUR BATTLE",
                      desc: "Select from classic strategy board games fully redesigned with a cybernetic aesthetic.",
                      icon: Swords,
                    },
                    {
                      step: "02",
                      title: "SYNC INTO LOBBIES",
                      desc: "Connect using room codes, join active open rooms, or launch your own passcode-secured lobby.",
                      icon: DoorOpen,
                    },
                    {
                      step: "03",
                      title: "CLAIM YOUR RANK",
                      desc: "Conquer opponents, earn XP, and secure your place on the global leaderboard.",
                      icon: Trophy,
                    }
                  ].map((step, idx) => (
                    <div 
                      key={idx}
                      className="p-4 md:p-5 bg-slate-dark/60 rounded-2xl border border-white/5 hover:border-brand-orange/10 transition-all flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange flex-shrink-0">
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-brand-orange uppercase tracking-widest mb-1">
                          {step.step} {step.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 6. LEVEL UP YOUR GAMING LEGACY ── */}
        <section className="section-padding">
           <div className="container mx-auto px-6 max-w-7xl">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="relative h-[360px] rounded-3xl overflow-hidden border border-brand-orange/30 group"
              >
                 <img src="/images/hero.png" alt="Gaming Legacy" className="absolute inset-0 w-full h-full object-cover grayscale opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-[4000ms]" />
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 via-slate-dark/95 to-slate-dark" />

                 {/* Floating 2D Cartoon Game Decors (Subtle Watermarks) */}
                 <motion.div 
                   animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
                   transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute left-6 top-6 w-16 h-16 pointer-events-none opacity-[0.05] group-hover:opacity-[0.08] transition-opacity"
                 >
                   <img src="/images/cartoon_gamepad.png" alt="Gamepad Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
                 </motion.div>
                 <motion.div 
                   animate={{ y: [0, 6, 0], rotate: [0, -2, 2, 0] }}
                   transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute right-6 bottom-6 w-16 h-16 pointer-events-none opacity-[0.05] group-hover:opacity-[0.08] transition-opacity"
                 >
                   <img src="/images/cartoon_shield.png" alt="Shield Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
                 </motion.div>
                 
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-8">
                    <div className="flex justify-center mb-4">
                       <span className="px-3 py-1 rounded-full glass-orange border border-brand-orange/30 text-brand-orange font-black text-[9px] uppercase tracking-[0.25em] flex items-center gap-1.5">
                          <Flame className="w-3 h-3" /> The Ultimate Gaming Arena
                       </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4 leading-[0.9] tracking-tighter uppercase">
                       LEVEL UP YOUR <br />
                       <span className="gradient-text">GAMING LEGACY</span>
                    </h2>
                    <p className="text-xs md:text-sm text-slate-400 mb-6 max-w-xl mx-auto font-medium leading-relaxed">
                       Join the premier destination for competitive strategy and pulse-pounding rewards. 
                       Real-time rooms, exclusive tournaments, and an elite community waiting for you.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                       <Link href="/rooms/create">
                          <Button className="btn-gaming h-11 px-8 rounded-xl text-sm shadow-neon-orange">
                             Start Playing
                          </Button>
                       </Link>
                    </div>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* ── 7. GLOBAL LEADERBOARD ── */}
        <section className="section-padding bg-mesh" id="leaderboard">
           <div className="container mx-auto px-6 max-w-7xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <SectionHeading kicker="Rankings" title="Global Leaderboard" description="The definitive record of strategic dominance. Earn XP in match rooms to ascend the divisions." />
                <Link href="/leaderboards">
                  <Button variant="outline" className="h-10 px-6 rounded-lg border-white/10 hover:bg-white/5 font-black uppercase text-[9px] tracking-widest">
                    View Full Standings <ArrowUpRight className="ml-1.5 w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Podium / Top Rank */}
                 <motion.div 
                   whileHover={{ scale: 1.01 }}
                   className="lg:col-span-2 relative h-[360px] rounded-[2.5rem] overflow-hidden border border-brand-orange/40 glass shadow-neon-orange"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 via-slate-dark/90 to-slate-dark" />
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                       <span className="px-3 py-1 rounded-full bg-brand-orange text-slate-950 font-black text-[9px] uppercase tracking-[0.25em] w-fit mb-4">CURRENT CHAMPION</span>
                       <div className="flex items-center gap-4 mb-4">
                          <div className="h-16 w-16 rounded-full bg-slate-950 border-2 border-brand-orange flex items-center justify-center text-2xl font-black text-brand-orange shadow-neon-orange">
                             {LEADERBOARD_DATA.weekly[0].name.charAt(0)}
                          </div>
                          <div>
                             <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.85]">{LEADERBOARD_DATA.weekly[0].name}</h3>
                             <p className="text-xs md:text-sm font-space font-black text-brand-orange mt-1 uppercase tracking-widest">LVL 99 • {LEADERBOARD_DATA.weekly[0].favorite} Specialist</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-10 text-white font-black text-[10px] uppercase tracking-[0.2em]">
                          <div className="flex flex-col gap-1">
                             <span className="text-slate-500">Season XP</span>
                             <span className="text-xl md:text-2xl font-space text-brand-orange">{LEADERBOARD_DATA.weekly[0].xp}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                             <span className="text-slate-500">Win Rate</span>
                             <span className="text-xl md:text-2xl font-space uppercase">94.2%</span>
                          </div>
                       </div>
                    </div>
                 </motion.div>

                 {/* Top Challengers */}
                 <div className="flex flex-col gap-4">
                    {LEADERBOARD_DATA.weekly.slice(1, 4).map((player, i) => (
                      <div key={i} className="glass p-4 rounded-2xl border border-white/10 hover:border-brand-orange/20 transition-all flex flex-col justify-between group">
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-[11px] text-slate-500">
                                  {player.name.charAt(0)}
                               </div>
                               <div>
                                  <h4 className="text-base font-black uppercase tracking-tighter group-hover:text-brand-orange transition-colors">{player.name}</h4>
                                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Rank #{i + 2}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-base font-space font-black text-brand-orange leading-none">{player.xp}</p>
                               <p className="text-[7px] font-black text-slate-700 uppercase">XP</p>
                            </div>
                         </div>
                         <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-white/20 group-hover:bg-brand-orange transition-colors" style={{ width: `${85 - i * 15}%` }} />
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
