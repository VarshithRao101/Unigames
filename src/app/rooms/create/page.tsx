"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Sparkles, Users, Gamepad2, Shield, Globe, Zap, Target } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { PLATFORM_GAMES } from "@/data/platform";
import { createRoomCode, saveCreatedRoom } from "@/utils/mock-room-store";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultGame = searchParams.get("game") || PLATFORM_GAMES[0].slug;

  const [selectedGame, setSelectedGame] = useState(defaultGame);
  const [roomName, setRoomName] = useState("NIGHT OPS");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [passcode, setPasscode] = useState("7777");
  const [allowSpectators, setAllowSpectators] = useState(true);
  const [region, setRegion] = useState("Mumbai Hub");

  const game = useMemo(
    () => PLATFORM_GAMES.find((item) => item.slug === selectedGame) ?? PLATFORM_GAMES[0],
    [selectedGame]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const code = createRoomCode();
    saveCreatedRoom({
      id: `custom-${code}`,
      code,
      name: roomName.trim() || `${game.name} Arena`,
      gameSlug: game.slug,
      gameName: game.name,
      host: "You",
      currentPlayers: 1,
      maxPlayers,
      status: "open",
      isPrivate,
      passcode: isPrivate ? passcode || "7777" : undefined,
      region,
      note: allowSpectators ? "FULL SPECTRUM ACCESS." : "RESTRICTED ACCESS PARAMS.",
    });
    router.push(`/rooms/${code}`);
  };

  return (
    <div className="bg-slate-dark text-white min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        <Link href="/rooms" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-brand-orange transition-colors mb-10">
           <ArrowLeft className="w-4 h-4" /> Return to Lobbies
        </Link>
        
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
           {/* Deployment Form */}
           <div className="glass p-12 rounded-[4rem] border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <Zap className="w-40 h-40 text-brand-orange" />
              </div>
              
              <div className="relative z-10 mb-12">
                 <span className="kicker mb-4">Arena Deployment</span>
                 <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter uppercase">
                    INITIATE <span className="gradient-text">ARENA SPECS</span>
                 </h1>
                 <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
                    Configure operational parameters and establish security protocols for your custom battle environment.
                 </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                 {/* Game Selection */}
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 block">Target Game Module</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {PLATFORM_GAMES.map(item => (
                         <button
                           key={item.slug}
                           type="button"
                           onClick={() => {
                             setSelectedGame(item.slug);
                             setMaxPlayers(item.slug === "ludo" ? 4 : item.slug === "snakes" ? 6 : 2);
                           }}
                           className={`p-6 rounded-[2rem] border text-left transition-all group ${
                             selectedGame === item.slug 
                               ? 'bg-brand-orange border-brand-orange text-slate-950 shadow-orange/40' 
                               : 'bg-white/2 border-white/5 text-white hover:border-white/10 hover:bg-white/5'
                           }`}
                         >
                            <div className="flex items-center justify-between mb-4">
                               <span className={`font-space text-lg font-black ${selectedGame === item.slug ? 'text-slate-950' : 'text-brand-orange'}`}>
                                  CMD-{item.shortCode}
                               </span>
                               <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                                  {item.status}
                               </span>
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-tighter mb-1">{item.name}</h4>
                            <p className={`text-[10px] font-bold ${selectedGame === item.slug ? 'text-slate-800' : 'text-slate-500'}`}>{item.multiplayerType}</p>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Arena Callsign</label>
                       <input 
                         value={roomName}
                         onChange={(e) => setRoomName(e.target.value.toUpperCase())}
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-orange/40"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Deployment Region</label>
                       <select 
                         value={region}
                         onChange={(e) => setRegion(e.target.value)}
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-orange/40 appearance-none"
                       >
                          <option>Mumbai Hub</option>
                          <option>Singapore Node</option>
                          <option>Frankfurt Relay</option>
                          <option>Virginia Core</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Player Capacity</label>
                       <select 
                         value={maxPlayers}
                         onChange={(e) => setMaxPlayers(Number(e.target.value))}
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-orange/40"
                       >
                          {[2,3,4,6].map(p => (
                            <option key={p} value={p}>{p} Gamers</option>
                          ))}
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Access Permission</label>
                       <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                          <button 
                            type="button" 
                            onClick={() => setIsPrivate(false)}
                            className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isPrivate ? 'bg-brand-orange text-slate-950 shadow-orange/20' : 'text-slate-500'}`}
                          >
                             Public
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsPrivate(true)}
                            className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPrivate ? 'bg-brand-orange text-slate-950 shadow-orange/20' : 'text-slate-500'}`}
                          >
                             Restricted
                          </button>
                       </div>
                    </div>
                 </div>

                 <AnimatePresence>
                    {isPrivate && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Security Passcode</label>
                         <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />
                            <input 
                              value={passcode}
                              onChange={(e) => setPasscode(e.target.value)}
                              placeholder="XXXX"
                              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-16 text-center text-lg font-space font-black tracking-[0.5em] text-brand-orange focus:outline-none focus:border-brand-orange/40"
                            />
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>

                 <div className="flex items-center gap-4 p-6 rounded-[2rem] border border-white/5 bg-white/2">
                    <input 
                      type="checkbox"
                      checked={allowSpectators}
                      onChange={(e) => setAllowSpectators(e.target.checked)}
                      className="h-5 w-5 accent-brand-orange cursor-pointer"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permit Open Spectrum Spectating</span>
                 </div>

                 <Button type="submit" size="xl" className="btn-gaming w-full rounded-[2rem] h-20 text-lg shadow-neon-orange">
                    Initialize Deployment <Sparkles className="ml-2 w-5 h-5 fill-current" />
                 </Button>
              </form>
           </div>

           {/* Module Preview */}
           <aside className="space-y-10">
              <div className="glass p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Target className="w-60 h-60 text-brand-orange" />
                 </div>
                 
                 <div className="relative z-10 flex items-center gap-8 mb-12">
                     <div className="w-24 h-24 rounded-[2rem] bg-slate-950 border border-white/10 flex items-center justify-center font-space text-4xl font-black text-brand-orange shadow-2xl">
                        {game.shortCode}
                     </div>
                     <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{game.name}</h3>
                        <p className="text-xs font-black text-brand-orange/60 uppercase tracking-[0.15em]">{game.multiplayerType} • Operational</p>
                     </div>
                 </div>

                 <p className="text-sm text-slate-400 font-medium leading-relaxed mb-12 relative z-10">
                    {game.description}
                 </p>

                 <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div className="p-6 rounded-[2rem] border border-white/5 bg-white/2">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Tactical Use</p>
                       <p className="text-xs font-black text-white uppercase">{game.spotlight}</p>
                    </div>
                    <div className="p-6 rounded-[2rem] border border-white/5 bg-white/2">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Sync Profile</p>
                       <p className="text-xs font-black text-white uppercase">Real-Time Core</p>
                    </div>
                 </div>
              </div>

              <div className="glass p-10 rounded-[3rem] border border-white/10 bg-brand-orange/5">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 mb-6">
                    <Shield className="w-4 h-4 text-brand-orange" /> Registry Information
                 </h4>
                 <div className="space-y-4 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                    <div className="flex justify-between">
                       <span>Arena Signature</span>
                       <span className="text-slate-300">UNIGAME-CORE-V2</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Access Level</span>
                       <span className="text-brand-orange">ENCRYPTED LOBBY</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Module Protocol</span>
                       <span className="text-slate-300">SYNC-READY-X</span>
                    </div>
                 </div>
              </div>
           </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
