"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, DoorOpen, Play, Shield } from "lucide-react";
import { PublicLayout } from "@/components/common/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLATFORM_GAMES, ROOMS_AVAILABLE, getGameBySlug } from "@/data/platform";
import { CyberAdBox, PlatformAdComponent } from "@/monetization/ad-components";

export default function GameDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");

  const game = getGameBySlug(resolvedParams.slug);
  const openRooms = useMemo(
    () => ROOMS_AVAILABLE.filter((room) => room.gameSlug === resolvedParams.slug),
    [resolvedParams.slug]
  );

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

  const isLive = game.status === "released" || game.status === "beta";

  return (
    <PublicLayout>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 hover:text-brand-light"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to games
        </Link>

        <section className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="panel-strong edge-glow rounded-[2rem] px-6 py-7">
            <div className="relative w-full h-[220px] rounded-3xl border border-brand-amber/20 overflow-hidden shadow-tactile bg-slate-950/40 mb-6">
              <img 
                src="/cyber_arena.png" 
                alt="Cyber Arena Illustration" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="kicker">{game.category}</p>
                <h1 className="mt-5 text-4xl font-black uppercase tracking-[0.18em] text-white sm:text-5xl">
                  {game.name}
                </h1>
                <p className="mt-3 text-base font-semibold text-slate-300">{game.multiplayerType}</p>
              </div>
              <div className="rounded-full border border-brand-amber/25 bg-brand-amber/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-light">
                {game.status.replace("_", " ")}
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-base font-semibold leading-7 text-slate-400">
              {game.description}
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-grey-border bg-black/10 px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Match type
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{game.multiplayerType}</p>
              </div>
              <div className="rounded-3xl border border-grey-border bg-black/10 px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Room status
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {isLive ? "Open for rooms" : `${game.progressPercent}% ready`}
                </p>
              </div>
              <div className="rounded-3xl border border-grey-border bg-black/10 px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Best use
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{game.spotlight}</p>
              </div>
            </div>

            <div className="mt-7 rounded-[1.5rem] border border-grey-border bg-black/10 px-5 py-5">
              <p className="font-outfit text-sm font-black uppercase tracking-[0.18em] text-white">
                How it plays
              </p>
              <div className="mt-4 space-y-3">
                {game.rules.map((rule) => (
                  <div key={rule} className="flex gap-3">
                    <span className="status-dot mt-2 shrink-0" />
                    <p className="text-sm font-semibold leading-6 text-slate-300">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel rounded-[2rem] px-6 py-6">
              <p className="font-outfit text-xl font-black uppercase tracking-[0.18em] text-white">
                Play this game
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-400">
                Create your own room or jump into a code.
              </p>

              <div className="mt-5 space-y-3">
                <Link href={`/rooms/create?game=${game.slug}`}>
                  <Button className="w-full" leftIcon={<Play className="h-4 w-4" />}>
                    Create room
                  </Button>
                </Link>
                <Link href="/rooms">
                  <Button variant="secondary" className="w-full" leftIcon={<DoorOpen className="h-4 w-4" />}>
                    Browse all rooms
                  </Button>
                </Link>
              </div>

              <form onSubmit={handleJoinRoom} className="mt-6 space-y-3">
                <Input
                  label="Join with room code"
                  value={roomCode}
                  onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="Enter room code"
                />
                <Button type="submit" variant="glass" className="w-full">
                  Join room
                </Button>
              </form>
            </div>

            <div className="panel rounded-[2rem] px-6 py-6">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-amber" />
                <p className="font-outfit text-sm font-black uppercase tracking-[0.18em] text-white">
                  Rooms for this game
                </p>
              </div>

              {openRooms.length > 0 ? (
                <div className="space-y-3">
                  {openRooms.map((room) => (
                    <div
                      key={room.code}
                      className="rounded-[1.5rem] border border-grey-border bg-black/10 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-outfit text-sm font-black uppercase tracking-[0.14em] text-white">
                            {room.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            {room.currentPlayers}/{room.maxPlayers} players · {room.region}
                          </p>
                        </div>
                        <Link href={`/rooms/${room.code}`}>
                          <Button size="sm">Open</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-400">
                  No saved demo rooms for this game yet. Create the first one.
                </p>
              )}
            </div>

            <div className="rounded-[2rem] border border-brand-amber/15 bg-black/15 px-6 py-6">
              <p className="font-outfit text-sm font-black uppercase tracking-[0.18em] text-brand-light">
                Battle Room Rules
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
                Ready to prove your skills? Jump into an active lobby, customize your match parameters, and play against friends or bots.
              </p>
            </div>

            <div className="mt-4">
              <PlatformAdComponent placement="game_details" />
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
