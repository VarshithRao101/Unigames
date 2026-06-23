"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Globe,
  Users,
  Gamepad2,
  Trophy,
  Activity,
  Timer,
  Swords,
  Clock,
  Flame,
  User,
  DoorOpen,
  Send,
  Terminal,
  MessageSquare,
  Shield,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  LEADERBOARD_DATA,
  PLATFORM_METRICS,
  ONLINE_SQUAD,
  GLOBAL_CHAT_SEED,
  ROOMS_AVAILABLE,
  LobbyRoom,
} from "@/data/platform";
import { loadCreatedRooms, mergeRooms } from "@/utils/mock-room-store";

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
    <div ref={ref} className={`mb-5 ${center ? "text-center" : ""}`}>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="kicker mb-1.5 text-[9px]"
      >
        {kicker}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        className="text-xl md:text-2xl font-black mb-2 tracking-tighter uppercase"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="text-slate-450 text-[11px] md:text-xs max-w-xl mx-auto font-medium"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function CommunityHubPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<any[]>([]);
  const [currentUserDb, setCurrentUserDb] = useState<any>(null);

  // Poll leaderboard data from database in real-time
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboards?game=global&period=weekly");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setWeeklyLeaderboard(json.data);
          }
        }
      } catch (err) {
        console.error("Error loading leaderboard data:", err);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Load actual logged-in user details in real-time
  useEffect(() => {
    const fetchCurrentUserDb = async () => {
      if (!user) {
        setCurrentUserDb(null);
        return;
      }
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCurrentUserDb(json.data);
          }
        }
      } catch (err) {
        console.error("Error loading current user DB stats:", err);
      }
    };

    fetchCurrentUserDb();
    const interval = setInterval(fetchCurrentUserDb, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const loaded = loadCreatedRooms().filter(
      (room) => !["TIC442", "TIC881", "TIC339"].includes(room.code)
    );
    setRooms(mergeRooms(loaded, ROOMS_AVAILABLE));
  }, []);

  useEffect(() => {
    if (user) {
      fetch("/api/friends")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setFriends(json.data.friends || []);
          }
        })
        .catch((err) => console.error("Error fetching friends:", err));
    }
  }, [user]);

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
      { id: "b1", sender: "BOARDKING", text: "Yo, I need one more player for a Tic-Tac-Toe lobby. You up?", time: "19:42" },
    ],
    LUNA: [
      { id: "l1", sender: "LUNA", text: "GG on the match earlier! Your strategy was amazing.", time: "19:30" },
      { id: "l2", sender: "You", text: "Thanks LUNA! That was a close game. Let's run a rematch soon.", time: "19:32" },
    ]
  });

  const tickerEvents = useMemo(() => [
    "NOVA CREATED LOBBY TIC442 — TIC-TAC-TOE · SINGAPORE",
    "LUNA ACQUIRED WEEKLY LEADERBOARD DIVISION #4 — TIC-TAC-TOE",
    "VARSHITH JOINED ACTIVE ROOM TIC881 — TIC-TAC-TOE · MUMBAI",
    "BOARDKING ACHIEVED A 5-GAME WINNING STREAK — TIC-TAC-TOE",
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
      sender: user?.username || "You",
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
    <div className="bg-transparent text-slate-50 min-h-screen">
      <Navbar />

      <main suppressHydrationWarning>
        {/* ── 1. READY TO DOMINATE? (HERO) ── */}
        <section className="relative min-h-[38vh] md:min-h-[44vh] py-6 md:py-8 flex items-center justify-center pt-14 overflow-hidden">
          {/* Hero Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero.png" 
              alt="Platform Background" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
          </div>

          {/* Floating 2D Cartoon Game Decors */}
          <motion.div 
            animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[12%] md:left-[18%] top-1/3 w-10 h-10 md:w-14 md:h-14 z-10 pointer-events-none opacity-[0.05] md:opacity-[0.07]"
          >
            <img src="/images/cartoon_gamepad.png" alt="Gamepad Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 8, 0], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[12%] md:right-[18%] bottom-1/3 w-10 h-10 md:w-14 md:h-14 z-10 pointer-events-none opacity-[0.05] md:opacity-[0.07]"
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
                <h1 className="text-3xl md:text-4xl font-black mb-2.5 leading-[0.9] tracking-tighter uppercase text-white">
                  READY TO <br />
                  <span className="gradient-text">DOMINATE?</span>
                </h1>

                <p className="text-[11px] md:text-xs text-slate-500 mb-4 max-w-xl mx-auto font-medium leading-relaxed">
                  The arena is live, the stakes have never been higher. 
                  Your global legacy starts with a single decisive move.
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/rooms/create">
                    <Button className="btn-neo h-10 px-6 rounded-lg text-xs shadow-neon-orange">
                      Start Playing
                    </Button>
                  </Link>
                  <Link href="/rooms">
                    <Button variant="outline" className="h-10 px-6 rounded-lg border-2 border-black bg-slate-900 hover:bg-slate-800 text-slate-50 transition-all text-xs backdrop-blur-md shadow-[2px_2px_0px_#000]">
                      Explore Lobbies
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 1.5. LIVE EVENT TICKER MARQUEE ── */}
        <section className="relative overflow-hidden py-2 bg-slate-950/20 border-y-2 border-black">
          <div className="container mx-auto px-6 max-w-7xl">
            {/* The Outer Bar */}
            <div className="glass py-1.5 px-3 rounded-lg flex items-center gap-2.5 bg-white relative overflow-hidden">
              
              {/* LIVE indicator badge */}
              <div className="flex-shrink-0 flex items-center gap-1 rounded-md border border-brand-orange/45 bg-brand-orange/10 px-1.5 py-0.5 select-none">
                <span className="h-1 w-1 rounded-full bg-brand-orange animate-pulse" />
                <span className="font-space text-[7px] font-black uppercase tracking-wider text-brand-orange">LIVE</span>
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
                    className="font-space text-[8.5px] font-black uppercase tracking-[0.12em] text-slate-500 truncate"
                  >
                    {tickerEvents[currentEventIdx]}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. QUICK START ── */}
        <section className="py-8 md:py-10 bg-slate-950/30 border-b-2 border-black">
           <div className="container mx-auto px-6 max-w-7xl">
              <SectionHeading 
                center 
                kicker="Briefing" 
                title="Quick Start" 
                description="Get started with UniGame in under 60 seconds. Join or create a room to start playing." 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                     desc: "Browse the live room directory, scan active games, or join via room code.",
                     href: "/rooms" 
                   },
                   { 
                     icon: Gamepad2, 
                     title: "Create Rooms", 
                     desc: "Create custom rooms, configure game settings, and invite friends to join.",
                     href: "/rooms/create" 
                   }
                 ].map((step, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass p-3.5 transition-all text-center group cursor-pointer border-2"
                    >
                      <Link href={step.href}>
                        <div>
                           <div className="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center mx-auto mb-2.5 border border-brand-orange/20 group-hover:scale-105 group-hover:bg-brand-orange transition-all duration-300 shadow-orange/10">
                              <step.icon className="w-4 h-4 text-brand-orange group-hover:text-slate-950 transition-colors" />
                           </div>
                           <h3 className="text-sm font-black mb-1 uppercase tracking-tight text-slate-50">{step.title}</h3>
                           <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{step.desc}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </div>
        </section>

        {/* ── 3. GLOBAL CHAT & FRIENDS ── */}
        <section className="py-8 md:py-10 bg-slate-950/30 border-b-2 border-black relative overflow-hidden" id="chat">
          {/* Floating 2D Cartoon Game Decors */}
          <motion.div 
            animate={{ rotate: [0, 3, -3, 0], y: [0, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-4 md:right-24 top-6 w-10 h-10 md:w-14 md:h-14 z-0 pointer-events-none opacity-[0.05] md:opacity-[0.07]"
          >
            <img src="/images/cartoon_trophy.png" alt="Trophy Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
          </motion.div>

           <div className="container mx-auto px-6 max-w-7xl relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-4.5 gap-4">
                   <div className="max-w-2xl">
                      <span className="kicker mb-1 inline-flex items-center gap-1.5 text-[9px]">
                         <Terminal className="w-3 h-3" /> {activeChannel === "global" ? "Global Chat" : "Direct Chat"}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black mb-1.5 tracking-tighter uppercase leading-[0.9] text-slate-50">
                         {activeChannel === "global" ? (
                            <>GLOBAL <span className="gradient-text">CHAT</span></>
                           ) : (
                            <>DIRECT CHAT <span className="gradient-text">{activeChannel}</span></>
                           )}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium">
                         {activeChannel === "global" 
                           ? "Chat with other players, share room codes, and hang out with the community in real-time."
                           : `Secure direct chat with ${activeChannel}.`}
                      </p>
                   </div>
                   <div className="flex bg-slate-800 border-2 border-black rounded-lg p-1.5 items-center gap-3 shadow-[2px_2px_0px_#000000]">
                      <div className="flex items-center gap-1">
                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[7.5px] font-black uppercase tracking-widest text-emerald-400">Online</span>
                      </div>
                      <div className="h-4 w-[1px] bg-slate-800" />
                      <div className="flex items-center gap-1">
                         <Users className="w-3 h-3 text-brand-orange" />
                         <span className="text-xs font-space font-black text-slate-50">482</span>
                      </div>
                   </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                {/* Active Members Sidebar */}
                <aside className="space-y-4">
                   <div className="glass p-3 border-2 border-black rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                         <h4 className="text-[8.5px] font-black uppercase tracking-[0.2em] text-slate-50">Online Users</h4>
                         <Activity className="w-3 h-3 text-brand-orange animate-pulse" />
                      </div>
                      
                      <div className="space-y-2 max-h-[180px] overflow-y-auto scrollbar-hide pr-1">
                         {/* Global Lobby Chat */}
                         <div 
                           onClick={() => setActiveChannel("global")}
                           className={`group p-1.5 rounded-lg border-2 cursor-pointer transition-all ${
                             activeChannel === "global" 
                               ? "border-brand-orange bg-brand-orange/10 shadow-premium" 
                               : "border-black bg-slate-900 hover:bg-slate-800"
                           }`}
                         >
                            <div className="flex items-center gap-2">
                               <div className={`h-6 w-6 rounded-md flex items-center justify-center font-black text-[9px] shadow-[1px_1px_0px_#000] relative transition-all ${
                                 activeChannel === "global" ? "bg-brand-orange text-slate-950" : "bg-slate-950 border border-black text-brand-orange"
                               }`}>
                                  G
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className={`text-[10px] font-black uppercase tracking-tighter transition-colors truncate ${
                                    activeChannel === "global" ? "text-brand-orange" : "text-slate-50 group-hover:text-brand-orange"
                                  }`}>Global Comms</p>
                                  <p className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest truncate">Public Lobby Chat</p>
                               </div>
                               <Globe className={`w-2.5 h-2.5 ${activeChannel === "global" ? "text-brand-orange animate-pulse" : "text-slate-400"}`} />
                            </div>
                         </div>

                                               {friends.length > 0 ? (
                            friends.map((member) => {
                              const isSelected = activeChannel === member.username;
                              return (
                                <div 
                                  key={member._id} 
                                  onClick={() => setActiveChannel(member.username)}
                                  className={`group p-1.5 rounded-lg border-2 cursor-pointer transition-all ${
                                    isSelected 
                                      ? "border-brand-orange bg-brand-orange/10 shadow-premium" 
                                      : "border-black bg-slate-900 hover:bg-slate-800"
                                  }`}
                                >
                                   <div className="flex items-center gap-2">
                                      <div className="h-6 w-6 rounded-full bg-slate-800 border border-black flex items-center justify-center font-black text-[9px] text-slate-300 shadow-[1px_1px_0px_#000] relative">
                                         {member.username.charAt(0).toUpperCase()}
                                         <span className="absolute bottom-0 right-0 h-1.5 w-1.5 bg-emerald-500 rounded-full border border-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                         <p className={`text-[10px] font-black uppercase tracking-tighter transition-colors truncate ${
                                           isSelected ? "text-brand-orange" : "text-slate-50 group-hover:text-brand-orange"
                                         }`}>{member.username}</p>
                                         <p className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest truncate">Online · Idle</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                         <Zap className={`w-2.5 h-2.5 ${isSelected ? "text-brand-orange" : "text-slate-300"}`} />
                                      </div>
                                   </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-3 border-2 border-dashed border-slate-800 rounded-lg text-center space-y-2">
                              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">No active operators</p>
                              <Link href="/friends" className="block">
                                <Button className="btn-neo h-7.5 w-full text-[8px] rounded font-black tracking-wider uppercase">
                                  Find Friends
                                </Button>
                              </Link>
                            </div>
                          )}
                      </div>
                   </div>
                </aside>

                {/* Chat Node */}
                <section className="glass overflow-hidden flex flex-col h-[260px] relative border-2 border-black rounded-xl bg-slate-950">
                   {/* Blurred Barrier overlay if not logged in */}
                   {!user && (
                     <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-30 p-4 text-center">
                        <div className="w-10 h-10 bg-brand-orange/10 border-2 border-black rounded-xl flex items-center justify-center text-brand-orange shadow-[1.5px_1.5px_0px_#000000] mb-2">
                           <Shield className="w-5 h-5" />
                        </div>
                        <h4 className="font-outfit font-black text-[10px] uppercase tracking-[0.2em] text-slate-50 mb-1">
                           Authentication Required
                        </h4>
                        <p className="text-[9px] text-slate-400 mb-3 max-w-[280px] font-bold leading-normal">
                           Sign in with Google to synchronize your account, view channels, and broadcast to the lobby.
                        </p>
                        <Button
                          onClick={() => login("", "")}
                          leftIcon={<GoogleIcon className="w-4 h-4 shrink-0" />}
                          rightIcon={<ArrowRight className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
                          className="btn-neo h-8.5 w-48 shadow-[2px_2px_0px_#000] flex justify-between items-center px-3.5 text-[9px]"
                        >
                           Log In with Google
                        </Button>
                     </div>
                   )}

                   {/* Messages Area */}
                   <div 
                     ref={chatScrollRef}
                     className="flex-1 p-2.5 md:p-3 overflow-y-auto scrollbar-hide space-y-2 relative z-10"
                   >
                      <AnimatePresence initial={false}>
                         {currentMessages.length > 0 ? (
                            currentMessages.map((message, i) => {
                               const isSelf = message.sender === 'You' || (user && message.sender === user.username);
                               return (
                                  <motion.div 
                                    key={message.id}
                                    initial={{ opacity: 0, x: isSelf ? 15 : -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                                  >
                                     <div className="flex items-center gap-1 mb-0.5">
                                        <span className={`text-[8.5px] font-black uppercase tracking-widest ${isSelf ? 'text-brand-orange' : 'text-slate-500'}`}>
                                           {message.sender}
                                        </span>
                                        <span className="text-[6.5px] font-black text-slate-500 tracking-[0.2em]">{message.time}</span>
                                     </div>
                                     <div className="relative">
                                        <div className={`max-w-[85%] p-2 py-1.5 rounded-lg border-2 border-black transition-all duration-300 relative ${
                                          isSelf 
                                            ? 'bg-brand-orange/20 rounded-tr-none text-slate-50 shadow-[1.5px_1.5px_0px_#000]' 
                                            : 'bg-slate-800 rounded-tl-none text-slate-50 shadow-[1.5px_1.5px_0px_#000]'
                                        }`}>
                                           <p className="text-[11px] font-medium leading-relaxed">{message.text}</p>
                                        </div>
                                        {/* Comic Speech Bubble Tail */}
                                        {isSelf ? (
                                          <div className="absolute top-[2px] right-[-3px] w-2 h-2 border-r-2 border-t-2 border-black rotate-[45deg] z-10 bg-brand-orange/20" />
                                        ) : (
                                          <div className="absolute top-[2px] left-[-3px] w-2 h-2 bg-slate-800 border-l-2 border-t-2 border-black rotate-[-45deg] z-10" />
                                        )}
                                      </div>
                                  </motion.div>
                               );
                            })
                         ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-[10px] font-bold uppercase tracking-widest select-none">
                               No messages in channel
                            </div>
                         )}
                      </AnimatePresence>
                   </div>

                   {/* Input Area */}
                   <div className="p-2 md:p-3 bg-slate-900 border-t-2 border-black relative z-20">
                      <form onSubmit={handleChatSend} className="flex flex-col sm:flex-row gap-2">
                         <div className="relative flex-1">
                            <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                            <input 
                              value={chatText}
                              onChange={(e) => setChatText(e.target.value)}
                              type="text" 
                              placeholder={activeChannel === "global" ? "Type a message..." : `Send message to ${activeChannel}...`}
                              className="w-full h-8.5 bg-slate-800 border-2 border-black rounded-lg px-9 text-[8.5px] font-black uppercase tracking-[0.2em] text-slate-50 focus:outline-none focus:border-brand-orange/50 shadow-[1.5px_1.5px_0px_#000]"
                            />
                         </div>
                         <Button type="submit" className="btn-neo h-8.5 px-4 rounded-lg text-[10px]">
                            Send
                         </Button>
                      </form>
                   </div>
                </section>
             </div>
           </div>
        </section>

        {/* ── 4. QUICK RUSH ── */}
        <section className="relative overflow-hidden py-3">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-1/2 bg-brand-orange/5 blur-[120px] -rotate-12" />
          
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="panel p-0.5 border-2 rounded-xl">
              <div className="bg-slate-950 rounded-[0.8rem] p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <span className="kicker mb-2 border-brand-orange bg-brand-orange/10 text-brand-orange text-[9px]">Turbo Matchmaking</span>
                  <h2 className="text-2xl md:text-3xl font-black mb-3 leading-[0.9] tracking-tighter uppercase text-slate-50">
                    INSTANT <span className="gradient-text">QUICK RUSH</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 mb-4 font-medium leading-relaxed max-w-sm">
                    Zero waiting. Zero lag. Our proprietary rush engine matches you with players 
                    at your exact skill level in under 5 seconds. Ready?
                  </p>
                  <Link href="/rooms">
                    <Button className="btn-neo h-10 px-6 rounded-lg text-xs shadow-neon-orange">
                      Start Quick Rush
                    </Button>
                  </Link>
                </div>
 
                <div className="flex-1 relative">
                  <div className="relative w-36 h-36 md:w-44 md:h-44 mx-auto">
                    {/* Animated Timer Graphic */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border border-dashed border-brand-orange/45" 
                    />
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-2.5 rounded-full border border-dashed border-slate-700" 
                    />
                    <div className="absolute inset-5 rounded-full glass border-2 flex flex-col items-center justify-center text-center">
                      <Timer className="w-6 h-6 text-brand-orange mb-1.5 animate-pulse" />
                      <span className="text-3xl font-space font-black tracking-tighter text-slate-50">04.2s</span>
                      <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Avg Match Wait</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. ROOMS AVAILABLE ── */}
        <section className="py-8 md:py-10" id="rooms">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Left Column: LIVE ROOM LIST */}
              <div className="glass p-5 md:p-6 flex flex-col h-full border-2 border-black rounded-xl">
                <div className="flex items-center justify-between mb-4.5">
                  <div>
                    <span className="kicker mb-1 inline-flex items-center gap-1.5 text-[9px]">
                      <Clock className="w-3 h-3" /> Rooms Available
                    </span>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-50">Live Rooms</h2>
                  </div>
                  <Link href="/rooms">
                    <Button variant="outline" className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-2 border-black bg-slate-900 hover:bg-slate-800 text-slate-50 rounded-lg shadow-[1.5px_1.5px_0px_#000]">
                      Browse All
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3.5 flex-1">
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <div 
                        key={room.id}
                        className="p-3 bg-slate-900 rounded-xl border-2 border-black hover:border-brand-orange/45 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-[1.5px_1.5px_0px_#000000]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <h3 className="text-sm font-black tracking-tight text-slate-50">{room.name}</h3>
                            <span className="text-[7.5px] bg-slate-950 border border-black px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase shadow-[1px_1px_0px_#000]">{room.code}</span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                            {room.gameName} · {room.currentPlayers}/{room.maxPlayers} Players · {room.region}
                          </p>
                          <p className="text-[8px] text-slate-500 font-semibold line-clamp-1 group-hover:text-brand-orange transition-colors">
                            {room.note}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 justify-end sm:justify-start">
                          {room.status === "live" && (
                            <span className="text-[7.5px] font-black text-brand-orange uppercase tracking-widest border-2 border-black px-1.5 py-0.5 rounded bg-brand-orange/5 shadow-[1px_1px_0px_#000]">
                              Live
                            </span>
                          )}

                          <Link href={`/rooms/${room.code}`}>
                            <Button className="btn-neo h-7.5 px-3 rounded-md font-black uppercase text-[9px]">
                              Join
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl text-center bg-slate-950 flex flex-col justify-center items-center h-full min-h-[140px]">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        No Active Lobbies
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1 font-bold">
                        Create a room to initialize battle matchmaking.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: SLEEK BATTLE LOOP */}
              <div className="glass p-5 md:p-6 flex flex-col h-full border-2 border-black rounded-xl">
                <div className="mb-4.5">
                  <span className="kicker mb-1 inline-flex items-center gap-1.5 text-[9px]">
                    <Gamepad2 className="w-3.5 h-3.5 text-brand-orange" /> How it Works
                  </span>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-50">Battle Loop</h2>
                </div>

                <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                  {[
                    {
                      step: "01",
                      title: "CHOOSE YOUR BATTLE",
                      desc: "Select classic Tic-Tac-Toe fully redesigned with a cybernetic neobrutalist aesthetic.",
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
                      className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border-2 border-black hover:border-brand-orange/15 transition-all flex items-start gap-3.5 shadow-[1.5px_1.5px_0px_#000000]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-orange/10 border-2 border-black flex items-center justify-center text-brand-orange flex-shrink-0">
                        <step.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">
                          {step.step} {step.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
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

        {/* ── 6. LEVEL UP YOUR MATCHUP LEGACY ── */}
        <section className="py-8 md:py-10">
           <div className="container mx-auto px-6 max-w-7xl">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="relative h-[280px] rounded-2xl overflow-hidden border-2 border-black shadow-[3.5px_3.5px_0px_#000000] group"
              >
                 <img src="/images/hero.png" alt="Matchup Legacy" className="absolute inset-0 w-full h-full object-cover grayscale opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-[4000ms]" />
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 via-slate-950/95 to-slate-950" />

                 {/* Floating 2D Cartoon Game Decors */}
                 <motion.div 
                   animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
                   transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute left-6 top-6 w-12 h-12 pointer-events-none opacity-[0.05] group-hover:opacity-[0.08] transition-opacity"
                 >
                   <img src="/images/cartoon_gamepad.png" alt="Gamepad Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
                 </motion.div>
                 <motion.div 
                   animate={{ y: [0, 6, 0], rotate: [0, -2, 2, 0] }}
                   transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute right-6 bottom-6 w-12 h-12 pointer-events-none opacity-[0.05] group-hover:opacity-[0.08] transition-opacity"
                 >
                   <img src="/images/cartoon_shield.png" alt="Shield Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
                 </motion.div>
                 
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-6">
                    <div className="flex justify-center mb-3">
                       <span className="px-2.5 py-0.5 rounded-full glass-orange text-brand-orange border-2 border-black font-black text-[8.5px] uppercase tracking-[0.2em] flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" /> The Ultimate Strategic Arena
                       </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black mb-3 leading-[0.9] tracking-tighter uppercase text-white">
                       LEVEL UP YOUR <br />
                       <span className="gradient-text">MATCHUP LEGACY</span>
                    </h2>
                    <p className="text-[11.5px] md:text-xs text-slate-300 mb-4 max-w-xl mx-auto font-medium leading-relaxed">
                       Join the premier destination for competitive strategy and pulse-pounding rewards. 
                       Real-time rooms, exclusive tournaments, and an elite community waiting for you.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                       <Link href="/rooms/create">
                          <Button className="btn-neo h-9.5 px-6 rounded-lg text-xs shadow-neon-orange">
                             Start Playing
                          </Button>
                       </Link>
                    </div>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* ── 7. GLOBAL LEADERBOARD ── */}
        <section className="py-8 md:py-10 bg-mesh" id="leaderboard">
           <div className="container mx-auto px-6 max-w-7xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
                <SectionHeading kicker="Rankings" title="Leaderboard" description="The definitive record of strategic dominance. Earn XP in match rooms to ascend." />
                <Link href="/leaderboards">
                  <Button variant="outline" className="h-8 px-4 rounded-lg border-2 border-black bg-slate-900 hover:bg-slate-800 text-slate-50 font-black uppercase text-[8.5px] tracking-widest shadow-[1.5px_1.5px_0px_#000]">
                    View Full Standings
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                 {weeklyLeaderboard.length === 0 ? (
                    <div className="lg:col-span-3 panel p-8 text-center bg-slate-950 border-2 border-black rounded-xl flex flex-col items-center justify-center min-h-[280px] shadow-[4px_4px_0px_#000]">
                       <div className="w-14 h-14 bg-brand-orange/10 border-2 border-black rounded-2xl flex items-center justify-center text-brand-orange shadow-[2px_2px_0px_#000] mb-4">
                          <Trophy className="w-7 h-7 animate-pulse" />
                       </div>
                       <h3 className="text-base font-black uppercase tracking-tight text-slate-50 mb-1.5">
                          The Arena Awaits Its First Legend
                       </h3>
                       <p className="text-[10px] text-slate-400 max-w-sm mx-auto mb-4 font-bold leading-normal">
                          No battles have been recorded on the global weekly leaderboard yet. Create a lobby, invite players, and win matches to claim the absolute top rank!
                       </p>
                       <Link href="/rooms">
                          <Button className="btn-neo h-8 px-4 rounded-lg text-[10px] shadow-neon-orange">
                             Battle Now
                          </Button>
                       </Link>
                    </div>
                 ) : (
                    <>
                       {/* Pavilion / Top Rank */}
                       <motion.div 
                         whileHover={{ scale: 1.01 }}
                         className="lg:col-span-2 relative h-[280px] overflow-hidden glass border-2 rounded-xl"
                       >
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 via-slate-950/80 to-slate-950" />
                          <div className="absolute inset-0 p-6 flex flex-col justify-end">
                             <span className="px-2.5 py-0.5 rounded-full bg-brand-orange text-slate-950 border border-black font-black text-[8px] uppercase tracking-[0.2em] w-fit mb-3">CURRENT CHAMPION</span>
                             <div className="flex items-center gap-3.5 mb-3">
                                <div className="h-12 w-12 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center text-xl font-black text-brand-orange shadow-[2px_2px_0px_#000]">
                                   {weeklyLeaderboard?.[0]?.name?.charAt(0) || "G"}
                                </div>
                                <div>
                                   <h3 className="text-2xl md:text-3.5xl font-black uppercase tracking-tighter leading-[0.85] text-slate-50">{weeklyLeaderboard?.[0]?.name || "Gamer"}</h3>
                                   <p className="text-[11px] font-space font-black text-brand-orange mt-1 uppercase tracking-widest">LVL 99 • {weeklyLeaderboard?.[0]?.favorite || "Tic-Tac-Toe"} Specialist</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-8 text-slate-50 font-black text-[9px] uppercase tracking-[0.15em]">
                                <div className="flex flex-col gap-0.5">
                                   <span className="text-slate-500">Season XP</span>
                                   <span className="text-lg md:text-xl font-space text-brand-orange">{weeklyLeaderboard?.[0]?.xp || 0}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                   <span className="text-slate-500">Victories</span>
                                   <span className="text-lg md:text-xl font-space">{weeklyLeaderboard?.[0]?.wins || 0} W</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                   <span className="text-slate-500">Streak</span>
                                   <span className="text-lg md:text-xl font-space text-brand-orange flex items-center gap-0.5">{weeklyLeaderboard?.[0]?.streak || 0} <Flame className="w-4.5 h-4.5 text-brand-orange fill-current" /></span>
                                </div>
                             </div>
                          </div>
                       </motion.div>
 
                       {/* Top Challengers */}
                       <div className="flex flex-col gap-3">
                          {(weeklyLeaderboard || []).slice(1, 4).map((player, i) => (
                            <div key={i} className="panel p-3 border-2 rounded-xl hover:bg-slate-50/10 transition-all flex flex-col justify-between group shadow-[2px_2px_0px_#000]">
                               <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2.5">
                                     <div className="h-6.5 w-6.5 rounded-full bg-slate-900 border border-black flex items-center justify-center font-black text-[10px] text-slate-300 shadow-[1px_1px_0px_#000]">
                                        {player.name.charAt(0)}
                                     </div>
                                     <div>
                                        <h4 className="text-sm font-black uppercase tracking-tighter text-slate-50 group-hover:text-brand-orange transition-colors">{player.name}</h4>
                                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Rank #{i + 2}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-sm font-space font-black text-brand-orange leading-none">{player.xp}</p>
                                     <p className="text-[6.5px] font-black text-slate-400 uppercase">XP</p>
                                  </div>
                               </div>
                               <div className="h-1.5 w-full bg-slate-200 border border-black rounded-full overflow-hidden shadow-[0.5px_0.5px_0px_#000]">
                                  <div className="h-full bg-slate-400 group-hover:bg-brand-orange transition-colors" style={{ width: `${85 - i * 15}%` }} />
                                </div>
                            </div>
                          ))}
                       </div>
                    </>
                 )}
              </div>

              {/* Logged in User Standings */}
              {user && (
                <div className="mt-4 panel p-4 border-2 rounded-xl bg-slate-950/20 text-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[3px_3px_0px_#000000]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center font-black text-base text-brand-orange shadow-[1.5px_1.5px_0px_#000] shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-brand-orange text-slate-950 border border-black font-black text-[7px] uppercase tracking-wider">YOUR STANDING</span>
                        <h4 className="text-sm font-black uppercase tracking-tight">{user.username}</h4>
                      </div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        LVL {currentUserDb?.level || 1} · {currentUserDb?.bio || "Casually competitive..."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 text-center font-black text-[9px] uppercase tracking-[0.15em] shrink-0">
                    <div>
                      <span className="text-slate-400 block">XP</span>
                      <span className="text-sm font-space text-brand-orange">{(currentUserDb?.xp || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Wins</span>
                      <span className="text-sm font-space">{currentUserDb?.stats?.wins || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Streak</span>
                      <span className="text-sm font-space flex items-center gap-0.5">{currentUserDb?.stats?.winStreak || 0} <Flame className="w-3.5 h-3.5 text-brand-orange fill-current" /></span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Rank</span>
                      <span className="text-sm font-space text-brand-orange">
                        {(() => {
                          const rank = weeklyLeaderboard.find(p => p.userId?.toString() === user.id || p.name === user.username)?.rank;
                          return rank ? `#${rank}` : "Unranked";
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
