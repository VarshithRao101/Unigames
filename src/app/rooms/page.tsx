"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Search, Plus, Globe, Shield, Users } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { LobbyRoom, PLATFORM_GAMES, ROOMS_AVAILABLE } from "@/data/platform";
import { loadCreatedRooms, mergeRooms } from "@/utils/mock-room-store";
import { motion } from "framer-motion";

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
    () => [{ slug: "all", name: "All Games" }, ...PLATFORM_GAMES.map((game) => ({ slug: game.slug, name: game.name }))],
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
    <div className="bg-transparent text-white min-h-screen">
      <Navbar />

      <main suppressHydrationWarning>
        <section className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        <section className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
             <Link href="/rooms/create" className="block">
                <Button className="btn-gaming w-full h-14 rounded-2xl text-base shadow-[4px_4px_0px_#000] font-black uppercase tracking-widest">
                   Create Room
                </Button>
             </Link>
             
             {/* Search box */}
             <div className="glass p-5 rounded-2xl border-2 border-black shadow-card">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4 flex items-center gap-2">
                   <Search className="w-3.5 h-3.5 text-brand-orange" /> Filter Rooms
                </h4>
                <div className="relative mb-4">
                   <input 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     type="text" 
                     placeholder="Search Code/Host..."
                     className="w-full h-11 bg-slate-900 border-2 border-black rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-orange"
                   />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
                   {gameOptions.map(option => (
                     <button 
                       key={option.slug}
                       onClick={() => setSelectedGame(option.slug)}
                       className={`w-full h-11 rounded-xl flex items-center px-4 text-[9px] font-black uppercase tracking-widest transition-all border-2 border-black ${selectedGame === option.slug ? 'bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]' : 'bg-white/5 text-slate-400 hover:border-brand-orange/30'}`}
                     >
                        {option.name}
                     </button>
                   ))}
                </div>
             </div>

             {/* Quick Join */}
             <div className="glass p-5 rounded-2xl border-2 border-black shadow-card bg-brand-orange/5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4 flex items-center gap-2">
                   <Shield className="w-3.5 h-3.5 text-brand-orange" /> Join Room
                </h4>
                <form onSubmit={handleQuickJoin} className="space-y-3">
                   <input 
                     value={roomCode}
                     onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                     type="text" 
                     maxLength={6}
                     placeholder="ENTER ROOM CODE"
                     className="w-full h-12 bg-slate-900 border-2 border-black rounded-xl px-4 text-center text-base font-black uppercase tracking-[0.3em] text-brand-orange focus:outline-none focus:border-brand-orange"
                   />
                   <button type="submit" className="w-full h-11 rounded-xl bg-white text-slate-950 hover:bg-brand-orange hover:text-slate-950 border-2 border-black font-black uppercase text-[10px] tracking-widest transition-all shadow-[2px_2px_0px_#000] cursor-pointer">
                      Join Room
                   </button>
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
                     <div className="bg-slate-900/50 rounded-[1.4rem] p-5 flex flex-col xl:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5 w-full md:w-auto">
                           <div className="w-14 h-14 rounded-xl bg-slate-950 border-2 border-black flex items-center justify-center font-space text-2xl font-black text-brand-orange group-hover:scale-105 transition-transform shadow-[2px_2px_0px_#000]">
                              {room.gameName.slice(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-1.5">
                                 <h3 className="text-lg font-black uppercase tracking-tight text-white">{room.name}</h3>
                                 <span className="px-2 py-0.5 bg-slate-950 border-2 border-black rounded-md text-[8px] font-black text-slate-400 tracking-widest leading-none shadow-[1px_1px_0px_#000]">{room.code}</span>
                                 {room.isPrivate && <Lock className="w-3.5 h-3.5 text-danger/60" />}
                              </div>
                              <div className="flex items-center gap-2.5 text-[9.5px] font-black text-slate-500 uppercase tracking-widest">
                                 <span className="text-brand-orange/80">{room.gameName} Room</span>
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
                                 {room.currentPlayers}<span className="text-slate-600"> / {room.maxPlayers}</span>
                              </p>
                              <p className="text-[8px] font-black text-slate-550 uppercase tracking-widest">Players</p>
                           </div>
                           
                           <div className="flex items-center gap-4">
                              <div className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_#000] ${
                                room.status === 'open' ? 'bg-success/15 text-success' : 
                                room.status === 'live' ? 'bg-brand-orange/15 text-brand-orange' : 
                                'bg-slate-800 text-slate-500'
                              }`}>
                                 {room.status === 'open' ? 'Public' : room.status === 'live' ? 'Playing' : 'Locked'}
                              </div>
                              
                              <Link href={`/rooms/${room.code}`}>
                                 <button className="btn-gaming h-10 px-6 rounded-xl font-black uppercase text-[10px] cursor-pointer">
                                    {room.status === 'full' ? 'Spectate' : 'Join Room'}
                                 </button>
                              </Link>
                           </div>
                        </div>
                     </div>
                  </motion.article>
                ))
             ) : (
                <div className="glass rounded-3xl p-12 text-center border-2 border-black shadow-card">
                   <Users className="w-14 h-14 text-white/5 mx-auto mb-6" />
                   <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No Rooms Found</h3>
                   <p className="text-[11px] text-slate-500 font-bold max-w-sm mx-auto mb-6">Adjust your filters or create a new room to start playing.</p>
                   <button onClick={() => { setSearch(""); setSelectedGame("all"); }} className="btn-gaming h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest cursor-pointer">
                      Reset Filters
                   </button>
                </div>
             )}
          </div>
        </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
