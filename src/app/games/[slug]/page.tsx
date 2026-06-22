"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DoorOpen, Play, X } from "lucide-react";
import { PublicLayout } from "@/components/common/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGameBySlug } from "@/data/platform";

export default function GameDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");

  const game = getGameBySlug(resolvedParams.slug);

  const handleJoinRoom = (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomCode.trim()) {
      return;
    }
    router.push(`/rooms/${roomCode.trim().toUpperCase()}`);
  };

  if (!game) {
    return (
      <PublicLayout>
        <main className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
          <div className="panel-strong rounded-[2rem] px-6 py-12">
            <p className="kicker justify-center">Game missing</p>
            <h1 className="mt-5 text-4xl font-black uppercase tracking-[0.18em] text-white">
              That game is not in the list
            </h1>
            <p className="mt-4 text-base font-semibold text-slate-400">
              Head back to the main game page and open one of the live titles.
            </p>
            <div className="mt-7 flex justify-center">
              <Link href="/games">
                <Button>Back to games</Button>
              </Link>
            </div>
          </div>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative w-full max-w-2xl bg-slate-800 border-[4px] border-black rounded-[2.5rem] shadow-[10px_10px_0px_#000000] overflow-hidden flex flex-col">
          {/* Retro Arcade Marquee Header */}
          <div className="bg-slate-950 border-b-[4px] border-black p-3.5 flex items-center justify-between px-6 bg-[repeating-linear-gradient(45deg,#ffaa00,#ffaa00_10px,#000_10px,#000_20px)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] relative">
            <span className="bg-black text-brand-orange border-2 border-black px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] shadow-[2.5px_2.5px_0px_#000000] select-none">
              STAGE SELECT
            </span>
            <div className="flex items-center gap-10">
              <span className="font-outfit text-xs font-black text-black uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000000] mr-12 select-none">
                INSERT COIN
              </span>
              <Link href="/games">
                <button 
                  className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-black bg-[#ff4d4d] hover:bg-[#ff6666] text-black shadow-[2px_2px_0px_#000000] active:translate-y-[-40%] active:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer z-50"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 relative flex-1">
            {/* 2D Comic Halftone Background Pattern Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:10px_10px] opacity-[0.04] pointer-events-none z-0" />

            {/* Left Side: Game Details & Info */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between border-b-[4px] md:border-b-0 md:border-r-[4px] border-black z-10 relative">
              <div>
                <span className="kicker px-3 py-1 text-[8.5px] font-black uppercase tracking-[0.2em]">
                  {game.category}
                </span>
                <h2 className="mt-4 text-3xl font-black uppercase tracking-wider text-white">
                  {game.name}
                </h2>
                
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 border-2 border-black bg-slate-900/40 px-2 py-0.5 rounded-lg">
                    {game.multiplayerType}
                  </span>
                  {(game.tags || []).map((tag) => (
                    <span key={tag} className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 border-2 border-black bg-slate-900/40 px-2 py-0.5 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-[11.5px] font-semibold text-slate-400 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-slate-900/50 border-2 border-black shadow-[2px_2px_0px_#000]">
                <p className="font-outfit text-[10px] font-black uppercase tracking-widest text-brand-orange">
                  How it plays
                </p>
                <div className="mt-3 space-y-2.5">
                  {(game.rules || []).map((rule) => (
                    <div key={rule} className="flex gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-orange rounded-full mt-1.5 shrink-0" />
                      <p className="text-[10px] font-semibold leading-normal text-slate-300">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Play Panel */}
            <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-center z-10 relative bg-slate-900">
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h3 className="text-base font-black tracking-wider uppercase">Play Now</h3>
                  <p className="text-[9px] font-semibold text-slate-500 mt-1">Start a match or join a room</p>
                </div>

                <Button 
                  onClick={() => {
                    router.push(`/rooms/create?game=${game.slug}`);
                  }}
                  className="btn-neo w-full h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  Create Room
                </Button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t-2 border-black/50"></div>
                  <span className="flex-shrink mx-3 text-[8.5px] font-black text-slate-650 uppercase tracking-widest">OR</span>
                  <div className="flex-grow border-t-2 border-black/50"></div>
                </div>

                <form onSubmit={handleJoinRoom} className="space-y-3.5">
                  <Input 
                    label="Join with code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="ENTER CODE"
                    className="text-center tracking-[0.2em] font-black uppercase h-11"
                  />
                  <Button type="submit" variant="secondary" className="w-full h-11 text-[9.5px] font-black tracking-widest">
                    Join Room
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Arcade Bezel Buttons Decor */}
          <div className="bg-slate-950 border-t-[4px] border-black p-3.5 flex justify-between items-center px-8 z-10 select-none">
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-full bg-danger border-2 border-black shadow-[1px_1px_0px_#000000]" />
              <div className="w-4 h-4 rounded-full bg-brand-orange border-2 border-black shadow-[1px_1px_0px_#000000]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-space text-[7.5px] font-black text-slate-500 uppercase tracking-widest">ARCADE CABINET SYSTEM</span>
              <div className="w-2.5 h-2.5 bg-success rounded-full border border-black shadow-[1px_1px_0px_#000000] animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
