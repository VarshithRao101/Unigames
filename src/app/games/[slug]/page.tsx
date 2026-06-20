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
        <div className="relative w-full max-w-2xl bg-slate-800 border-[4px] border-black rounded-[2.5rem] shadow-[10px_10px_0px_#000000] overflow-hidden">
          {/* Close Button ("Wrong" cancel button that redirects to /games) */}
          <Link href="/games">
            <button 
              className="absolute top-5 right-5 flex items-center justify-center w-9 h-9 rounded-full border-[3px] border-black bg-[#ff4d4d] hover:bg-[#ff6666] text-black shadow-[3px_3px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000000] transition-all duration-100 cursor-pointer z-50"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Left Side: Game Details & Info */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between border-b-[4px] md:border-b-0 md:border-r-[4px] border-black">
              <div>
                <span className="kicker px-3 py-1 text-[8.5px] font-black uppercase tracking-[0.2em]">
                  {game.category}
                </span>
                <h2 className="mt-4 text-3xl font-black uppercase tracking-wider text-white">
                  {game.name}
                </h2>
                
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/60 bg-black/25 px-2 py-0.5 rounded">
                    {game.multiplayerType}
                  </span>
                  {(game.tags || []).map((tag) => (
                    <span key={tag} className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/60 bg-black/25 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-[11.5px] font-semibold text-slate-400 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-black/20 border-2 border-black">
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

            {/* Right Side: Deploy Panel */}
            <div className="md:col-span-5 p-6 md:p-8 bg-slate-900 flex flex-col justify-center">
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h3 className="text-base font-black text-white tracking-wider uppercase">Deploy Arena</h3>
                  <p className="text-[9px] font-semibold text-slate-500 mt-1">Start match or join lobby</p>
                </div>

                <Button 
                  onClick={() => {
                    router.push(`/rooms/create?game=${game.slug}`);
                  }}
                  className="btn-gaming w-full h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  Create Room
                </Button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t-2 border-black/50"></div>
                  <span className="flex-shrink mx-3 text-[8.5px] font-black text-slate-600 uppercase tracking-widest">OR</span>
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
        </div>
      </main>
    </PublicLayout>
  );
}
