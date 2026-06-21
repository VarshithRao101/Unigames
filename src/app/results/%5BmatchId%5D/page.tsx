"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AuthGuard } from "@/components/common/auth-guard";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Home, RefreshCw, Star, Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface MatchResult {
  _id: string;
  roomCode: string;
  gameSlug: string;
  winnerId?: string | null;
  players: Array<{
    userId: string;
    username: string;
    avatar?: string;
    score?: number;
    xpEarned?: number;
  }>;
  scores?: Record<string, number>;
  duration?: number;
}

export default function MatchResultsPage() {
  return (
    <AuthGuard>
      <MatchResults />
    </AuthGuard>
  );
}

function MatchResults() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const matchId = params.matchId as string;

  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (!res.ok) {
          throw new Error("Match details could not be found");
        }
        const json = await res.json();
        if (json.success && json.data) {
          setResult(json.data);
        } else {
          throw new Error(json.error?.message || "Failed to load match results");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load results scorecard");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-brand-orange animate-spin mb-4" />
        <p className="text-xs font-bold font-space uppercase tracking-widest text-slate-500">
          Compiling Scorecard...
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <div className="bg-danger/10 border-2 border-danger/45 p-6 rounded-2xl max-w-sm text-center space-y-4 shadow-card">
          <h2 className="font-outfit font-black text-lg uppercase tracking-tight text-white">Retrieval Failure</h2>
          <p className="text-xs text-slate-450 leading-relaxed font-semibold">
            {error || "Match results cannot be verified."}
          </p>
          <Button onClick={() => router.push("/games")} className="btn-gaming w-full h-10 font-black uppercase text-[10px] tracking-wider">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isWinner = result.winnerId === user?.id;
  const isDraw = result.winnerId === null;
  const localPlayerDetails = result.players.find(p => p.userId === user?.id);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-outfit select-none">
      
      {/* Floating Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full filter blur-[150px] ${isWinner ? "bg-success" : isDraw ? "bg-brand-orange" : "bg-danger"}`} />
      </div>

      <div className="w-full max-w-lg space-y-6 relative z-10">
        
        {/* BANNER RESULT */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-2"
        >
          <span className="px-3 py-1 rounded-full bg-slate-900 border-2 border-black text-[9px] font-black uppercase tracking-widest text-slate-450 shadow-[1.5px_1.5px_0px_#000] inline-block">
            Match Report: #{result.roomCode}
          </span>
          
          <h1 className="text-4xl font-black uppercase tracking-tighter filter drop-shadow-[2px_2px_0px_#000000] mt-3">
            {isDraw ? (
              <span className="text-brand-orange">Match Drawn</span>
            ) : isWinner ? (
              <span className="text-success flex items-center justify-center gap-2">
                <Trophy className="w-9 h-9 text-brand-orange animate-bounce" /> Victory
              </span>
            ) : (
              <span className="text-danger">Defeat</span>
            )}
          </h1>

          {localPlayerDetails && (
            <p className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" /> +{localPlayerDetails.xpEarned || 0} XP Earned
            </p>
          )}
        </motion.div>

        {/* SCORECARD MODULE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass p-5 rounded-2xl border-3 border-black shadow-card space-y-4 bg-white/2"
        >
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-black pb-2.5">
            COMBAT SCORECARD DETAILS
          </h3>

          <div className="space-y-2.5">
            {result.players.map((player) => {
              const playerWin = result.winnerId === player.userId;
              const playerDraw = result.winnerId === null;
              
              return (
                <div 
                  key={player.userId}
                  className={`p-3 border-2 rounded-xl flex items-center justify-between transition-all shadow-[2px_2px_0px_#000] ${
                    player.userId === user?.id 
                      ? "bg-slate-900/80 border-brand-orange" 
                      : "bg-slate-950/40 border-black"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-900 border border-black flex items-center justify-center font-black text-xs text-slate-350">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-tight text-white">
                        {player.username}
                      </p>
                      <p className="text-[7.5px] font-extrabold text-slate-500 uppercase tracking-widest">
                        {player.userId === user?.id ? "Local User" : "Opponent"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-lg border border-black text-[7.5px] font-black uppercase tracking-wider ${
                      playerWin 
                        ? "bg-success/20 text-success border-success/40" 
                        : playerDraw 
                        ? "bg-brand-orange/20 text-brand-orange border-brand-orange/40" 
                        : "bg-danger/20 text-danger border-danger/40"
                    }`}>
                      {playerWin ? "Winner" : playerDraw ? "Draw" : "Loss"}
                    </span>
                    {player.score !== undefined && (
                      <p className="text-[10px] font-space font-black text-slate-400 mt-1">
                        Score: {player.score}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* DECISION REDIRECTS BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-2.5"
        >
          <Button 
            onClick={() => router.push(`/rooms/${result.roomCode}`)}
            className="w-full h-11 bg-brand-orange hover:bg-brand-dark text-slate-950 font-black uppercase text-[10px] tracking-widest border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-px active:shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" /> Re-enter Waiting Lobby
          </Button>

          <Button 
            onClick={() => router.push("/games")}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-slate-300 font-black uppercase text-[10px] tracking-widest border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-px active:shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center gap-1.5 transition-all"
          >
            <Home className="w-4 h-4" /> Go back to deck list
          </Button>
        </motion.div>

      </div>
    </div>
  );
}
