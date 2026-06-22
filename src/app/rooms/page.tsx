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
import { AuthGuard } from "@/components/common/auth-guard";

export default function RoomsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);

  useEffect(() => {
    const loaded = loadCreatedRooms().filter(
      (room) => !["TIC442", "TIC881", "TIC339"].includes(room.code)
    );
    setRooms(mergeRooms(loaded, ROOMS_AVAILABLE));
  }, []);

  const handleClearRooms = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("unigames-created-rooms");
      setRooms([]);
    }
  };

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
    <AuthGuard>
      <div className="bg-transparent text-white min-h-screen">
        <Navbar />

        <main suppressHydrationWarning>
          <section className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
          <section className="grid gap-8 lg:grid-cols-[300px_1fr]">
            {/* Sidebar */}
            <aside className="space-y-6">
               <div className="space-y-2.5">
                  <Link href="/rooms/create" className="block">
                     <Button className="btn-neo w-full h-11 rounded-xl text-xs shadow-[3px_3px_0px_#000] font-black uppercase tracking-widest">
                        Create Room
                     </Button>
                  </Link>
                  <button 
                    onClick={handleClearRooms}
                    className="w-full h-9 rounded-lg bg-red-650/10 hover:bg-red-650/20 text-red-500 border-2 border-black font-black uppercase text-[9px] tracking-widest transition-all shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                  >
                     Clear My Lobbies
                  </button>
               </div>
               
               {/* Search box */}
               <div className="glass p-4 rounded-xl border-2 border-black shadow-card">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white mb-3 flex items-center gap-2">
                     <Search className="w-3 h-3 text-brand-orange" /> Filter Rooms
                  </h4>
                  <div className="relative mb-3">
                     <input 
                       value={search}
                       onChange={(e) => setSearch(e.target.value)}
                       type="text" 
                       placeholder="Search Code/Host..."
                       className="w-full h-9 bg-slate-900 border-2 border-black rounded-lg px-3.5 text-[9px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-orange"
                     />
                  </div>

                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto scrollbar-hide pr-1">
                     {gameOptions.map((option, idx) => {
                       const isSelected = selectedGame === option.slug;
                       const buttonLabel = idx === 0 ? "SEL" : idx === 1 ? "A" : idx === 2 ? "B" : idx === 3 ? "X" : idx === 4 ? "Y" : "RT";
                       return (
                         <button 
                           key={option.slug}
                           onClick={() => setSelectedGame(option.slug)}
                           className={`w-full h-9 rounded-lg flex items-center justify-between px-3 text-[9px] font-black uppercase tracking-widest transition-all border-2 border-black ${isSelected ? 'bg-brand-orange text-slate-950 shadow-[1.5px_1.5px_0px_#000000]' : 'bg-slate-950 text-slate-400 hover:border-brand-orange/45'}`}
                         >
                            <span>{option.name}</span>
                            <span className={`w-4 h-4 rounded-full border border-black flex items-center justify-center font-space text-[7px] shadow-[0.5px_0.5px_0px_#000000] ${isSelected ? 'bg-slate-950 text-brand-orange' : 'bg-slate-900 text-slate-400'}`}>
                               {buttonLabel}
                            </span>
                         </button>
                       );
                     })}
                  </div>
               </div>

               {/* Quick Join */}
               <div className="glass p-4 rounded-xl border-2 border-black shadow-card bg-brand-orange/5">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white mb-3 flex items-center gap-2">
                     <Shield className="w-3.5 h-3 text-brand-orange" /> Join Room
                  </h4>
                  <form onSubmit={handleQuickJoin} className="space-y-2">
                     <input 
                       value={roomCode}
                       onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                       type="text" 
                       maxLength={6}
                       placeholder="ENTER CODE"
                       className="w-full h-9.5 bg-slate-900 border-2 border-black rounded-lg px-3 text-center text-xs font-black uppercase tracking-[0.3em] text-brand-orange focus:outline-none focus:border-brand-orange"
                     />
                     <button type="submit" className="w-full h-9 rounded-lg bg-slate-950 text-slate-50 hover:bg-brand-orange hover:text-slate-950 border-2 border-black font-black uppercase text-[9px] tracking-widest transition-all shadow-[1.5px_1.5px_0px_#000] cursor-pointer">
                        Join Room
                     </button>
                  </form>
               </div>
            </aside>

            {/* Room List */}
            <div className="space-y-2">
               {filteredRooms.length > 0 ? (
                  filteredRooms.map((room, i) => (
                    <motion.article 
                      key={room.code}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      viewport={{ once: true }}
                      className="group glass border-2 border-black hover:border-brand-orange shadow-[2px_2px_0px_#000000] transition-all duration-200 rounded-lg"
                    >
                       <div className="px-3 py-2 flex flex-row items-center justify-between gap-2">
                          {/* Left: Name & meta */}
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                             <div className="shrink-0">
                               <div className={`w-1.5 h-6 rounded-full ${
                                 room.status === 'open' ? 'bg-success' : 
                                 room.status === 'live' ? 'bg-brand-orange' : 
                                 'bg-slate-700'
                               }`} />
                             </div>
                              <div className="min-w-0">
                                 <div className="flex items-center gap-1.5">
                                    <h3 className="text-[11px] font-black uppercase tracking-tight text-white truncate" style={{ textShadow: 'none' }}>{room.name}</h3>
                                    <span className="shrink-0 px-1 py-0.5 bg-slate-950 border border-black rounded text-[7px] font-black text-slate-400 tracking-widest leading-none shadow-[0.5px_0.5px_0px_#000]">{room.code}</span>
                                    {room.isPrivate && <Lock className="shrink-0 w-2 h-2 text-danger/60" />}
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                    <span className="text-brand-orange">{room.gameName}</span>
                                    <span className="text-slate-400">•</span>
                                    <span>Host: {room.host}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="flex items-center gap-0.5"><Globe className="w-2 h-2" /> {room.region}</span>
                                 </div>
                              </div>
                           </div>

                           {/* Right: Players + Status + Join */}
                           <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                 <p className="text-[11px] font-space font-black leading-none text-white">
                                    {room.currentPlayers}<span className="text-slate-400">/{room.maxPlayers}</span>
                                 </p>
                                 <p className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Players</p>
                              </div>
                              
                              <div className={`px-1.5 py-0.5 rounded text-[6.5px] font-black uppercase tracking-widest border border-black ${
                                room.status === 'open' ? 'bg-success/15 text-success' : 
                                room.status === 'live' ? 'bg-brand-orange/15 text-brand-orange' : 
                                'bg-slate-950 text-slate-400'
                              }`}>
                                 {room.status === 'open' ? 'Public' : room.status === 'live' ? 'Live' : 'Locked'}
                              </div>
                             
                             <Link href={`/rooms/${room.code}`}>
                                <button className="btn-neo h-7 px-3 rounded font-black uppercase text-[7.5px] cursor-pointer">
                                   {room.status === 'full' ? 'Watch' : 'Join'}
                                </button>
                             </Link>
                          </div>
                       </div>
                    </motion.article>
                  ))
               ) : (
                  <div className="glass rounded-xl p-8 text-center border-2 border-black shadow-card">
                     <Users className="w-8 h-8 text-white/10 mx-auto mb-3" />
                     <h3 className="text-sm font-black uppercase tracking-tighter mb-1">No Rooms Found</h3>
                     <p className="text-[10px] text-slate-500 font-bold max-w-sm mx-auto mb-4">Adjust your filters or create a new room.</p>
                     <button onClick={() => { setSearch(""); setSelectedGame("all"); }} className="btn-neo h-8 px-6 rounded-lg font-black uppercase text-[9px] tracking-widest cursor-pointer">
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
    </AuthGuard>
  );
}
