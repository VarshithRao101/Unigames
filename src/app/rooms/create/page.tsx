"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { PLATFORM_GAMES } from "@/data/platform";
import { createRoomCode, saveCreatedRoom } from "@/utils/mock-room-store";
import { AnimatePresence, motion } from "framer-motion";

function CreateRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const [selectedGame, setSelectedGame] = useState(PLATFORM_GAMES[0].slug);
  const [roomName, setRoomName] = useState("BATTLE ROOM");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [passcode, setPasscode] = useState("7777");
  const [allowSpectators, setAllowSpectators] = useState(true);
  const [region, setRegion] = useState("Mumbai Hub");

  // Sync state if query parameter changes
  useEffect(() => {
    setMounted(true);
    const gameParam = searchParams.get("game");
    if (gameParam && PLATFORM_GAMES.some((g) => g.slug === gameParam)) {
      setSelectedGame(gameParam);
      // Automatically adjust player count defaults
      setMaxPlayers(gameParam === "ludo" ? 4 : gameParam === "snakes" ? 6 : 2);
    }
  }, [searchParams]);

  const hasGameParam = useMemo(() => {
    if (!mounted) return true; // Default to hiding the switcher during initial render to prevent flashing
    return !!searchParams.get("game");
  }, [mounted, searchParams]);

  const game = useMemo(
    () => PLATFORM_GAMES.find((item) => item.slug === selectedGame) ?? PLATFORM_GAMES[0],
    [selectedGame]
  );

  const allowedPlayerCounts = useMemo(() => {
    if (selectedGame === "ludo") return [4];
    if (selectedGame === "snakes") return [2, 3, 4, 6];
    return [2]; // chess and tictactoe only support 2 players
  }, [selectedGame]);

  // Adjust max players if current value is not allowed
  useEffect(() => {
    if (!allowedPlayerCounts.includes(maxPlayers)) {
      setMaxPlayers(allowedPlayerCounts[0]);
    }
  }, [selectedGame, allowedPlayerCounts, maxPlayers]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const code = createRoomCode();
    
    // Flag this browser as the creator of this room code
    localStorage.setItem(`room_creator_${code}`, "true");

    saveCreatedRoom({
      id: `custom-${code}`,
      code,
      name: roomName.trim() || `${game.name} Room`,
      gameSlug: game.slug,
      gameName: game.name,
      host: "You",
      currentPlayers: 1,
      maxPlayers,
      status: "open",
      isPrivate,
      passcode: isPrivate ? passcode || "7777" : undefined,
      region,
      note: allowSpectators ? "Spectators allowed." : "Private settings.",
    });
    router.push(`/rooms/${code}`);
  };

  if (!mounted) {
    return (
      <div className="bg-slate-950 text-white min-h-screen flex items-center justify-center">
        <p className="font-outfit text-sm font-black uppercase tracking-[0.2em] animate-pulse">Initializing Arena...</p>
      </div>
    );
  }

  return (
    <div className="bg-transparent text-white min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        <Link href="/rooms" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-brand-orange transition-colors mb-10">
           <ArrowLeft className="w-4 h-4" /> Return to Lobbies
        </Link>
        
        <section className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Room Creation Form */}
            <div className="bg-slate-800 p-8 md:p-12 border-[4px] border-black rounded-[2.5rem] shadow-[8px_8px_0px_#000000] relative overflow-hidden">
               <div className="relative z-10 mb-12">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-3 block">Room Setup</span>
                  <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter uppercase text-white">
                     Create a <span className="gradient-text">Room</span>
                  </h1>
                  <p className="text-sm text-slate-400 font-semibold leading-relaxed max-w-xl">
                     Choose your settings, set visibility, and launch your room to start playing with friends.
                  </p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                  {/* Game Selection */}
                  {!hasGameParam && (
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5 block">Select Game</label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {PLATFORM_GAMES.map(item => (
                            <button
                              key={item.slug}
                              type="button"
                              onClick={() => {
                                setSelectedGame(item.slug);
                              }}
                              className={`p-5 rounded-2xl border-[3.5px] border-black text-left shadow-[4px_4px_0px_#000000] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-[2.5px_2.5px_0px_#000000] transition-all cursor-pointer ${
                                selectedGame === item.slug 
                                  ? 'bg-brand-orange text-slate-950 font-black' 
                                  : 'bg-slate-900 text-slate-400 hover:text-white'
                              }`}
                            >
                               <div className="flex items-center justify-between mb-3">
                                  <span className={`font-space text-base font-black ${selectedGame === item.slug ? 'text-slate-950' : 'text-brand-orange'}`}>
                                     {item.shortCode}
                                  </span>
                                  <span className="text-[8px] font-black uppercase tracking-widest opacity-70">
                                     {item.status}
                                  </span>
                               </div>
                               <h4 className="text-xs font-black uppercase tracking-tight mb-1">{item.name}</h4>
                               <p className={`text-[9px] font-bold ${selectedGame === item.slug ? 'text-slate-800' : 'text-slate-500'}`}>{item.multiplayerType}</p>
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Room Name</label>
                        <input 
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value.toUpperCase())}
                          className="w-full h-14 px-6 bg-slate-900 border-[3.5px] border-black rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0px_#000000] focus:outline-none focus:border-brand-orange focus:shadow-[5px_5px_0px_#000000] transition-all"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Server Region</label>
                        <select 
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full h-14 px-6 bg-slate-900 border-[3.5px] border-black rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0px_#000000] focus:outline-none focus:border-brand-orange focus:shadow-[5px_5px_0px_#000000] transition-all cursor-pointer appearance-none"
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
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Max Players</label>
                        <select 
                          value={maxPlayers}
                          onChange={(e) => setMaxPlayers(Number(e.target.value))}
                          disabled={allowedPlayerCounts.length <= 1}
                          className="w-full h-14 px-6 bg-slate-900 border-[3.5px] border-black rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0px_#000000] focus:outline-none focus:border-brand-orange focus:shadow-[5px_5px_0px_#000000] transition-all cursor-pointer appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                           {allowedPlayerCounts.map(p => (
                             <option key={p} value={p}>{p} Players</option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Room Visibility</label>
                        <div className="flex bg-slate-900 p-1.5 rounded-2xl border-[3.5px] border-black shadow-[3px_3px_0px_#000000]">
                           <button 
                             type="button" 
                             onClick={() => setIsPrivate(false)}
                             className={`flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${!isPrivate ? 'bg-brand-orange text-slate-950 font-black shadow-[2px_2px_0px_#000000] border-2 border-black translate-x-[-1px] translate-y-[-1px]' : 'text-slate-500 border-2 border-transparent'}`}
                           >
                              Public
                           </button>
                           <button 
                             type="button" 
                             onClick={() => setIsPrivate(true)}
                             className={`flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${isPrivate ? 'bg-brand-orange text-slate-950 font-black shadow-[2px_2px_0px_#000000] border-2 border-black translate-x-[-1px] translate-y-[-1px]' : 'text-slate-500 border-2 border-transparent'}`}
                           >
                              Private
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
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Room Passcode</label>
                          <div className="relative">
                             <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />
                             <input 
                               value={passcode}
                               onChange={(e) => setPasscode(e.target.value)}
                               placeholder="XXXX"
                               className="w-full h-14 bg-slate-900 border-[3.5px] border-black rounded-2xl px-16 text-center text-base font-space font-black tracking-[0.5em] text-brand-orange shadow-[3px_3px_0px_#000000] focus:outline-none focus:border-brand-orange focus:shadow-[5px_5px_0px_#000000] transition-all"
                             />
                          </div>
                       </motion.div>
                     )}
                  </AnimatePresence>

                  <div className="flex items-center gap-4 p-5 rounded-2xl border-[3.5px] border-black bg-slate-900 shadow-[3px_3px_0px_#000000]">
                     <input 
                       type="checkbox"
                       id="allowSpectators"
                       checked={allowSpectators}
                       onChange={(e) => setAllowSpectators(e.target.checked)}
                       className="h-5 w-5 accent-brand-orange cursor-pointer border-2 border-black animate-none"
                     />
                     <label htmlFor="allowSpectators" className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 cursor-pointer select-none">
                       Allow Spectators
                     </label>
                  </div>

                  <Button type="submit" size="xl" className="btn-gaming w-full rounded-2xl h-16 text-sm font-black tracking-widest shadow-[4px_4px_0px_#000000]">
                     Create Room
                  </Button>
               </form>
            </div>

            {/* Game Preview Panel */}
            <aside>
               <div className="bg-slate-800 p-8 md:p-12 border-[4px] border-black rounded-[2.5rem] shadow-[8px_8px_0px_#000000] relative overflow-hidden">
                  <div className="relative z-10 flex items-center gap-6 mb-8">
                       <div className="w-20 h-20 rounded-2xl bg-slate-950 border-[3.5px] border-black flex items-center justify-center font-space text-3xl font-black text-brand-orange shadow-[4px_4px_0px_#000000]">
                          {game.shortCode}
                       </div>
                       <div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-brand-orange bg-slate-900 border-2 border-black px-2 py-0.5 rounded-lg shadow-[2px_2px_0px_#000000] mb-1.5 inline-block">
                             {game.category}
                          </span>
                          <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{game.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">{game.multiplayerType}</p>
                       </div>
                  </div>

                  <p className="text-xs text-slate-400 font-semibold leading-relaxed relative z-10 mb-8">
                     {game.description}
                  </p>

                  <div className="relative z-10 border-t-2 border-black/40 pt-6">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-4">Rules of play</h4>
                     <ul className="space-y-3.5">
                        {(game.rules || []).map((rule, idx) => (
                           <li key={idx} className="flex gap-3 items-start">
                              <span className="w-2 h-2 rounded-full bg-brand-orange mt-1.5 shrink-0 border border-black shadow-[1.5px_1.5px_0px_#000000]" />
                              <p className="text-[11.5px] font-semibold text-slate-300 leading-normal">{rule}</p>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function CreateRoomPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-950 text-white min-h-screen flex items-center justify-center">
        <p className="font-outfit text-sm font-black uppercase tracking-[0.2em] animate-pulse">Loading parameters...</p>
      </div>
    }>
      <CreateRoomForm />
    </Suspense>
  );
}
