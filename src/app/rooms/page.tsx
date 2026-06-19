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

  return (
    <div className="bg-slate-dark text-white min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        {/* Header */}
        <section className="relative mb-20">
           <div className="absolute -top-20 right-0 w-96 h-96 bg-brand-orange/5 blur-[120px] rounded-full" />
           <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="max-w-2xl">
                 <span className="kicker mb-4">Tactical Lobby Browser</span>
                 <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
                    ACTIVE <span className="gradient-text">OPERATIONAL LOBBIES</span>
                 </h1>
                 <p className="text-lg text-slate-400 font-medium leading-relaxed">
                    Deploy into active battle sectors, browse global match environments, or initiate a precision strike using a direct room code.
                 </p>
              </div>
              <div className="flex gap-4">
                 <Link href="/rooms/create">
                   <Button className="btn-gaming h-16 px-12 rounded-[2rem] text-lg">
                      Deploy Room <Plus className="ml-2 w-5 h-5" />
                   </Button>
                 </Link>
              </div>
           </div>
        </section>

        <section className="grid gap-12 lg:grid-cols-[350px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-10">
             {/* Search box */}
             <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 flex items-center gap-3">
                   <Search className="w-4 h-4 text-brand-orange" /> Filter Signals
                </h4>
                <div className="relative mb-8">
                   <input 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     type="text" 
                     placeholder="Search Room Code/Host..."
                     className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-orange/40"
                   />
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                   {gameOptions.map(option => (
                     <button 
                       key={option.slug}
                       onClick={() => setSelectedGame(option.slug)}
                       className={`w-full h-14 rounded-2xl flex items-center px-6 text-[10px] font-black uppercase tracking-widest transition-all ${selectedGame === option.slug ? 'bg-brand-orange text-slate-950 shadow-orange/40' : 'bg-white/2 text-slate-500 border border-white/5 hover:border-white/10 hover:text-white'}`}
                     >
                        {option.name}
                     </button>
                   ))}
                </div>
             </div>

             {/* Quick Join */}
             <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl bg-brand-orange/5">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 flex items-center gap-3">
                   <Shield className="w-4 h-4 text-brand-orange" /> Direct Uplink
                </h4>
                <form onSubmit={handleQuickJoin} className="space-y-4">
                   <input 
                     value={roomCode}
                     onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                     type="text" 
                     maxLength={6}
                     placeholder="ENTER ROOM CODE"
                     className="w-full h-16 bg-slate-dark/80 border border-white/10 rounded-2xl px-6 text-center text-lg font-black uppercase tracking-[0.3em] text-brand-orange focus:outline-none focus:border-brand-orange/60"
                   />
                   <Button type="submit" className="w-full h-14 rounded-2xl bg-white text-slate-950 hover:bg-brand-orange hover:text-slate-950 font-black uppercase text-xs tracking-widest transition-all">
                      Execute Link
                   </Button>
                </form>
             </div>
          </aside>

          {/* Room List */}
          <div className="space-y-6">
             {filteredRooms.length > 0 ? (
               filteredRooms.map((room, i) => (
                 <motion.article 
                   key={room.code}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   className="group glass p-2 rounded-[2.5rem] border border-white/5 hover:border-brand-orange/40 transition-all duration-300"
                 >
                    <div className="bg-slate-dark/50 rounded-[2.3rem] p-8 flex flex-col xl:flex-row items-center justify-between gap-10">
                       <div className="flex items-center gap-8 w-full md:w-auto">
                          <div className="w-20 h-20 rounded-2xl bg-slate-dark/80 border border-white/5 flex items-center justify-center font-space text-3xl font-black text-brand-orange group-hover:scale-110 transition-transform">
                             {room.gameName.slice(0, 2)}
                          </div>
                          <div>
                             <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight">{room.name}</h3>
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-500 tracking-widest leading-none">{room.code}</span>
                                {room.isPrivate && <Lock className="w-4 h-4 text-danger/60" />}
                             </div>
                             <div className="flex items-center gap-3 text-sm font-black text-slate-500 uppercase tracking-widest">
                                <span className="text-brand-orange/80">{room.gameName} Arena</span>
                                <span className="text-white/10">•</span>
                                <span>Host: {room.host}</span>
                                <span className="text-white/10">•</span>
                                <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {room.region}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-wrap items-center gap-10 justify-between md:justify-end w-full md:w-auto">
                          <div className="text-center">
                             <p className="text-3xl font-space font-black leading-none mb-1 text-white">
                                {room.currentPlayers}<span className="text-slate-700"> / {room.maxPlayers}</span>
                             </p>
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Gamers Linked</p>
                          </div>
                          
                          <div className="flex items-center gap-6">
                             <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                               room.status === 'open' ? 'bg-success/5 text-success border-success/20' : 
                               room.status === 'live' ? 'bg-brand-orange/5 text-brand-orange border-brand-orange/20' : 
                               'bg-white/5 text-slate-500 border-white/10'
                             }`}>
                                {room.status === 'open' ? 'Instant Access' : room.status === 'live' ? 'Synchronizing' : 'Locked'}
                             </div>
                             
                             <Link href={`/rooms/${room.code}`}>
                                <Button className="btn-gaming h-14 px-10 rounded-2xl font-black uppercase text-xs">
                                   {room.status === 'full' ? 'Spectate Link' : 'Join Arena'}
                                </Button>
                             </Link>
                          </div>
                       </div>
                    </div>
                 </motion.article>
               ))
             ) : (
                <div className="glass rounded-[3rem] p-20 text-center border border-white/5">
                   <Users className="w-20 h-20 text-white/5 mx-auto mb-8" />
                   <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">No Sector Signals Detected</h3>
                   <p className="text-slate-500 font-medium max-w-md mx-auto mb-10">Adjust your filter frequencies or initiate a new room deployment to begin synchronization.</p>
                   <Button onClick={() => { setSearch(""); setSelectedGame("all"); }} variant="outline" className="h-14 px-10 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase text-xs tracking-widest">
                      Reset Frequencies
                   </Button>
                </div>
             )}

             {/* Footer Note */}
             <div className="glass p-10 rounded-[3rem] border border-white/5 flex items-center gap-8 bg-white/2">
                <div className="h-16 w-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
                   <Shield className="w-8 h-8 text-brand-orange" />
                </div>
                <div>
                   <h4 className="text-lg font-black uppercase tracking-tight mb-2">Protocol Resilience</h4>
                   <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-xl">
                      Custom created arenas are automatically persisted within the regional cache registries. Synchronization is maintained across tactical reboots.
                   </p>
                </div>
             </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
