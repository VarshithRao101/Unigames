"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DoorOpen, Lock, Play, Search, Zap, Plus, Globe, Shield, Users } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { LobbyRoom, PLATFORM_GAMES, ROOMS_AVAILABLE } from "@/data/platform";
import { loadCreatedRooms, mergeRooms } from "@/utils/mock-room-store";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState<LobbyRoom[]>(ROOMS_AVAILABLE);

  useEffect(() => {
    setRooms(mergeRooms(loadCreatedRooms(), ROOMS_AVAILABLE));
  }, []);

  const gameOptions = useMemo(
    () => [{ slug: "all", name: "All Sectors" }, ...PLATFORM_GAMES.map((game) => ({ slug: game.slug, name: game.name }))],
    []
  );

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        room.name.toLowerCase().includes(search.toLowerCase()) ||
        room.code.toLowerCase().includes(search.toLowerCase()) ||
        room.host.toLowerCase().includes(search.toLowerCase());
      const matchesGame = selectedGame === "all" || room.gameSlug === selectedGame;
      return matchesSearch && matchesGame;
    });
  }, [rooms, search, selectedGame]);

  const handleQuickJoin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomCode.trim()) return;
    router.push(`/rooms/${roomCode.trim().toUpperCase()}`);
  };

  /* ── 1. LOBBIES ACTIVITY TICKER ── */
  const tickerEvents = useMemo(() => [
    "LOBBY TIC881 RECRUITING OPERATORS — TIC-TAC-TOE · MUMBAI",
    "LOBBY CHS901 ENGAGED — ACTIVE DUEL IN SECTOR CHESS",
    "NOVA DEPLOYED PRIVATE ARENA LDO777 — PASSCODE SECURED",
    "MATCH COMPLETED IN SECTOR XO — VARSHITH SECURED VICTORY",
    "LOBBY TIC442 STATE CHANGED TO 'LIVE MATCHROOM' — SINGAPORE",
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
        <section className="relative min-h-[40vh] py-8 flex items-center justify-center pt-24 overflow-hidden">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero.png" 
              alt="Lobbies Hub Background" 
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
            <img src="/images/cartoon_gamepad.png" alt="Gamepad Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 8, 0], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[12%] md:right-[18%] bottom-1/4 w-14 h-14 md:w-20 md:h-20 z-10 pointer-events-none opacity-[0.05]"
          >
            <img src="/images/cartoon_shield.png" alt="Shield Deco" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
          </motion.div>

          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase leading-[0.9]">
                  ACTIVE <span className="gradient-text">OPERATIONAL LOBBIES</span>
                </h1>
                <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
                  Deploy into active battle sectors, browse global match environments, or initiate a precision strike using a direct room code.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link href="/rooms/create">
                  <Button className="btn-gaming h-14 px-10 rounded-2xl text-base shadow-neon-orange">
                    Deploy Room <Plus className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
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
        <section className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
             {/* Search box */}
             <div className="glass p-5 rounded-2xl border-2 border-black shadow-card">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4 flex items-center gap-2">
                   <Search className="w-3.5 h-3.5 text-brand-orange" /> Filter Signals
                </h4>
                <div className="relative mb-4">
                   <input 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     type="text" 
                     placeholder="Search Room Code/Host..."
                     className="w-full h-11 bg-slate-dark border-2 border-black rounded-xl px-4 text-[9px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-orange"
                   />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
                   {gameOptions.map(option => (
                     <button 
                       key={option.slug}
                       onClick={() => setSelectedGame(option.slug)}
                       className={`w-full h-11 rounded-xl flex items-center px-4 text-[9px] font-black uppercase tracking-widest transition-all border-2 border-black ${selectedGame === option.slug ? 'bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]' : 'bg-white/2 text-slate-400 hover:border-brand-orange/30'}`}
                     >
                        {option.name}
                     </button>
                   ))}
                </div>
             </div>

             {/* Quick Join */}
             <div className="glass p-5 rounded-2xl border-2 border-black shadow-card bg-brand-orange/5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4 flex items-center gap-2">
                   <Shield className="w-3.5 h-3.5 text-brand-orange" /> Direct Uplink
                </h4>
                <form onSubmit={handleQuickJoin} className="space-y-3">
                   <input 
                     value={roomCode}
                     onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                     type="text" 
                     maxLength={6}
                     placeholder="ENTER ROOM CODE"
                     className="w-full h-12 bg-slate-dark border-2 border-black rounded-xl px-4 text-center text-base font-black uppercase tracking-[0.3em] text-brand-orange focus:outline-none focus:border-brand-orange"
                   />
                   <Button type="submit" className="w-full h-11 rounded-xl bg-white text-slate-950 hover:bg-brand-orange hover:text-slate-950 border-2 border-black font-black uppercase text-[10px] tracking-widest transition-all">
                      Execute Link
                   </Button>
                </form>
             </div>
          </aside>

          {/* Room List */}
          <div className="space-y-4">
             {filteredRooms.length > 0 ? (
               filteredRooms.map((room, i) => (
                 <motion.article 
                   key={room.code}
                   initial={{ opacity: 0, x: 20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.04 }}
                   viewport={{ once: true }}
                   className="group glass p-1.5 rounded-3xl border-2 border-black hover:border-brand-orange shadow-card transition-all duration-300"
                 >
                    <div className="bg-slate-dark/50 rounded-[1.4rem] p-5 flex flex-col xl:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-5 w-full md:w-auto">
                          <div className="w-14 h-14 rounded-xl bg-slate-dark border-2 border-black flex items-center justify-center font-space text-2xl font-black text-brand-orange group-hover:scale-105 transition-transform shadow-[2px_2px_0px_#000]">
                             {room.gameName.slice(0, 2)}
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1.5">
                                <h3 className="text-lg font-black uppercase tracking-tight">{room.name}</h3>
                                <span className="px-2 py-0.5 bg-slate-950 border-2 border-black rounded-md text-[8px] font-black text-slate-550 tracking-widest leading-none shadow-[1px_1px_0px_#000]">{room.code}</span>
                                {room.isPrivate && <Lock className="w-3.5 h-3.5 text-danger/60" />}
                             </div>
                             <div className="flex items-center gap-2.5 text-[9.5px] font-black text-slate-550 uppercase tracking-widest">
                                <span className="text-brand-orange/80">{room.gameName} Arena</span>
                                <span className="text-slate-800">•</span>
                                <span>Host: {room.host}</span>
                                <span className="text-slate-800">•</span>
                                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {room.region}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-wrap items-center gap-6 justify-between md:justify-end w-full md:w-auto">
                          <div className="text-center md:text-right">
                             <p className="text-2xl font-space font-black leading-none mb-1 text-white">
                                {room.currentPlayers}<span className="text-slate-750"> / {room.maxPlayers}</span>
                             </p>
                             <p className="text-[8px] font-black text-slate-655 uppercase tracking-widest">Gamers Linked</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <div className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_#000] ${
                               room.status === 'open' ? 'bg-success/15 text-success' : 
                               room.status === 'live' ? 'bg-brand-orange/15 text-brand-orange' : 
                               'bg-slate-800 text-slate-550'
                             }`}>
                                {room.status === 'open' ? 'Instant Access' : room.status === 'live' ? 'Synchronizing' : 'Locked'}
                             </div>
                             
                             <Link href={`/rooms/${room.code}`}>
                                <Button className="btn-gaming h-10 px-6 rounded-xl font-black uppercase text-[10px]">
                                   {room.status === 'full' ? 'Spectate Link' : 'Join Arena'}
                                </Button>
                             </Link>
                          </div>
                       </div>
                    </div>
                 </motion.article>
               ))
             ) : (
                <div className="glass rounded-3xl p-12 text-center border-2 border-black shadow-card">
                   <Users className="w-14 h-14 text-white/5 mx-auto mb-6" />
                   <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No Sector Signals Detected</h3>
                   <p className="text-[11px] text-slate-500 font-bold max-w-sm mx-auto mb-6">Adjust your filter frequencies or initiate a new room deployment to begin synchronization.</p>
                   <Button onClick={() => { setSearch(""); setSelectedGame("all"); }} className="btn-gaming h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">
                      Reset Frequencies
                   </Button>
                </div>
             )}

             {/* Footer Note */}
             <div className="glass p-6 rounded-3xl border-2 border-black shadow-card flex items-center gap-5 bg-white/2">
                <div className="h-12 w-12 rounded-xl bg-brand-orange/10 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000] flex-shrink-0">
                   <Shield className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                   <h4 className="text-sm font-black uppercase tracking-tight mb-1">Protocol Resilience</h4>
                   <p className="text-[9.5px] text-slate-500 font-bold leading-relaxed max-w-xl">
                      Custom created arenas are persisted within regional cache registries. Synchronization is maintained across tactical reboots.
                   </p>
                </div>
             </div>
          </div>
        </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
