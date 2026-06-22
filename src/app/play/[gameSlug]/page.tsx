"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getGameRegistryEntry } from "@/games/registry";
import { MatchProvider } from "@/games/context";
import { AuthGuard } from "@/components/common/auth-guard";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogOut, MessageSquareCode, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/loader";

interface MatchDetails {
  _id: string;
  roomCode: string;
  gameSlug: string;
  status: string;
  players: Array<{
    userId: string;
    username: string;
    avatar?: string;
  }>;
  winnerId?: string;
}

export default function PlayGameContainerPage() {
  return (
    <AuthGuard>
      <PlayGameContainer />
    </AuthGuard>
  );
}

function PlayGameContainer() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const gameSlug = params.gameSlug as string;
  const matchId = searchParams.get("match");

  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmoteTray, setShowEmoteTray] = useState(false);

  // Quick Emotes list
  const quickEmotes = ["😂", "🔥", "👑", "👍", "🤔", "GG", "Well Played", "Oops!", "Noooo"];

  useEffect(() => {
    if (!matchId) {
      setError("No Match ID provided in request parameters");
      setLoading(false);
      return;
    }

    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (!res.ok) {
          throw new Error("Match details could not be found");
        }
        const json = await res.json();
        if (json.success && json.data) {
          setMatchDetails(json.data);
        } else {
          throw new Error(json.error?.message || "Failed to load match");
        }
      } catch (err: any) {
        setError(err.message || "Failed to establish match link");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-50">
        <Loader label="Loading game..." />
      </div>
    );
  }

  if (error || !matchDetails) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <div className="bg-danger/10 border-2 border-danger/45 p-6 rounded-2xl max-w-md text-center space-y-4 shadow-card">
          <AlertTriangle className="w-12 h-12 text-danger mx-auto animate-bounce" />
          <h2 className="font-outfit font-black text-lg uppercase tracking-tight text-white">Match Connection Error</h2>
          <p className="text-xs text-slate-450 leading-relaxed font-semibold">
            {error || "An unexpected error occurred while linking to the game server."}
          </p>
          <Button onClick={() => router.push("/games")} className="btn-neo w-full h-10 font-black uppercase text-[10px] tracking-wider">
            Return to Deck
          </Button>
        </div>
      </div>
    );
  }

  // Load registry settings
  const registryEntry = getGameRegistryEntry(gameSlug);
  if (!registryEntry) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <div className="bg-danger/10 border-2 border-danger/45 p-6 rounded-2xl max-w-md text-center space-y-4 shadow-card">
          <AlertTriangle className="w-12 h-12 text-danger mx-auto" />
          <h2 className="font-outfit font-black text-lg uppercase tracking-tight text-white">Unknown Game Mode</h2>
          <p className="text-xs text-slate-450 leading-relaxed font-semibold">
            The game mode "{gameSlug}" is not registered on this platform.
          </p>
          <Button onClick={() => router.push("/games")} className="btn-neo w-full h-10 font-black uppercase text-[10px] tracking-wider">
            Return to Deck
          </Button>
        </div>
      </div>
    );
  }

  const GameComponent = registryEntry.component;

  // Map MatchDetails to MatchProvider structure
  const mappedRoomData = {
    code: matchDetails.roomCode,
    name: `Room ${matchDetails.roomCode}`,
    isPrivate: true,
    region: "ap2",
    friendsOnly: false,
    allowSpectators: true,
    autoStart: true,
  };

  const mappedPlayers = matchDetails.players.map((p, idx) => ({
    id: p.userId,
    name: p.username,
    avatar: p.avatar || "/avatars/avatar-placeholder.png",
    isHost: idx === 0, // Assume first player in array is the host
    isReady: true,
    isAI: false,
  }));

  const handleQuit = async () => {
    if (confirm("Are you sure you want to abandon the current match? This will count as a loss.")) {
      try {
        // Submit exit PATCH to end match early
        await fetch(`/api/matches/${matchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            winnerId: matchDetails.players.find(p => p.userId !== user?.id)?.userId || null,
          }),
        });
      } catch (err) {
        console.error("Failed to leave match cleanly:", err);
      } finally {
        router.push("/games");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between select-none relative overflow-hidden font-outfit">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange rounded-full filter blur-[150px]" />
      </div>

      {/* TOP DECK HEADER BAR */}
      <header className="h-14 border-b-3 border-black bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-brand-orange text-slate-950 text-[8px] font-black uppercase tracking-widest border border-black shadow-[1px_1px_0px_#000]">
            Match: {matchDetails.roomCode}
          </span>
          <h1 className="font-outfit font-black text-sm uppercase tracking-tighter text-slate-50">
            {registryEntry.metadata.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleQuit} className="h-8.5 px-3.5 bg-danger/20 hover:bg-danger text-danger hover:text-slate-950 rounded-xl border-2 border-black font-black uppercase text-[8px] tracking-wider transition-all duration-150">
            <LogOut className="w-3.5 h-3.5 mr-1" /> Quit Game
          </Button>
        </div>
      </header>

      {/* ACTIVE MULTIPLAYER PLAYGROUND CONTAINER */}
      <main className="flex-1 w-full flex items-center justify-center p-6 relative z-10 overflow-y-auto">
        <MatchProvider
          matchId={matchId || ""}
          initialRoom={mappedRoomData}
          initialPlayers={mappedPlayers}
        >
          <GameComponent />
        </MatchProvider>
      </main>

      {/* EMOTE DRAWER QUICK CHAT TRAY */}
      <footer className="h-16 border-t-3 border-black bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-center z-50 relative">
        <div className="relative">
          <Button 
            onClick={() => setShowEmoteTray(!showEmoteTray)}
            className="h-9 px-4 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border-2 border-black font-black uppercase text-[8px] tracking-widest flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000]"
          >
            <Smile className="w-3.5 h-3.5 text-brand-orange" />
            <span>Send Emote/Signal</span>
          </Button>

          <AnimatePresence>
            {showEmoteTray && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-950 border-3 border-black p-3.5 rounded-2xl flex gap-2 items-center shadow-card z-50 w-72 flex-wrap justify-center"
              >
                {quickEmotes.map(emote => (
                  <button
                    key={emote}
                    onClick={() => {
                      // We'll log emotes via custom game moves
                      const movesEndpoint = `/api/matches/${matchId}/moves`;
                      fetch(movesEndpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "send_emote", data: { emote } }),
                      });
                      setShowEmoteTray(false);
                    }}
                    className="p-2 bg-slate-900 border-2 border-black hover:border-brand-orange hover:bg-brand-orange/10 rounded-lg text-xs font-black uppercase tracking-wider text-slate-200 cursor-pointer active:translate-y-px transition-all"
                  >
                    {emote}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </footer>

    </div>
  );
}
