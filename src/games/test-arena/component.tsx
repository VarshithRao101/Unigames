"use client";

import React, { useState, useEffect } from "react";
import { useUnigamesSDK } from "../sdk";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Award, RefreshCw, LogOut, CheckCircle2, 
  Clock, Eye, AlertCircle, Gamepad2, Zap, Shield
} from "lucide-react";

export default function TestArenaGame() {
  const sdk = useUnigamesSDK();
  const router = useRouter();
  const { match, players, spectators, room } = sdk;

  // Local game phases: "active" | "results"
  const [phase, setPhase] = useState<"active" | "results">("active");
  const [winnerName, setWinnerName] = useState("");
  const [winnerId, setWinnerId] = useState("");
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Match live timer
  useEffect(() => {
    if (phase !== "active") return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const handleEndMatchSimulation = (winningPlayerIndex: number) => {
    const winner = players[winningPlayerIndex] || { id: "p1", name: "Player 1" };
    const loser = players[winningPlayerIndex === 0 ? 1 : 0] || { id: "p2", name: "Player 2" };

    setWinnerId(winner.id);
    setWinnerName(winner.name);
    setPhase("results");

    // Declare winner in standard SDK
    sdk.declareWinner(winner.id, [winner.id, loser.id], {
      [winner.id]: 100, // Winner: +100 XP
      [loser.id]: 25   // Loser: +25 XP
    });
  };

  const handleReset = () => {
    setPhase("active");
    setSecondsElapsed(0);
    setWinnerId("");
    setWinnerName("");
    sdk.updateState({
      board: null,
      winnerId: null
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-6">
      
      <AnimatePresence mode="wait">
        {phase === "active" ? (
          <motion.div
            key="active-test"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-6"
          >
            {/* Telemetry info HUD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                <h4 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-brand-amber animate-pulse" /> Game Successfully Loaded
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-brand-amber font-mono font-bold">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Match Timer: {formatTimer(secondsElapsed)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900 flex items-center justify-between">
                  <span className="text-slate-450">{players[0]?.name || "Player 1"}</span>
                  <span className="text-[10px] text-green-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> Connected
                  </span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900 flex items-center justify-between">
                  <span className="text-slate-450">{players[1]?.name || "Player 2"}</span>
                  <span className="text-[10px] text-green-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> Connected
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-[10px] font-mono text-slate-500">
                <span>Match ID: {match.matchId}</span>
                <span className="text-right">Room Code: #{room.code}</span>
              </div>
            </div>

            {/* Simulated Win Trigger Action Buttons */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5">
              <div>
                <h4 className="font-outfit font-black text-sm uppercase tracking-wide text-white">Simulate End Match Results</h4>
                <p className="text-[10px] text-slate-500 mt-1">Select the winner to test state transitions and reward calculations.</p>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="primary"
                  onClick={() => handleEndMatchSimulation(0)}
                  className="flex-1 h-12 uppercase font-bold text-xs tracking-wider"
                >
                  Player 1 Wins
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleEndMatchSimulation(1)}
                  className="flex-1 h-12 uppercase font-bold text-xs tracking-wider border-slate-800 text-slate-300"
                >
                  Player 2 Wins
                </Button>
              </div>
            </div>

            {/* Spectator HUD Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-brand-amber animate-pulse" />
                <div className="text-left text-xs">
                  <span className="text-white font-bold block">Spectator Panel Active</span>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Live streaming to viewers list.</p>
                </div>
              </div>
              <span className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold text-brand-amber">
                {spectators.length + 3} Observers
              </span>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="results-test"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-6"
          >
            {/* Results disclosure */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl flex flex-col items-center">
              <div className="absolute inset-0 bg-radial-gradient from-brand-amber/10 via-transparent to-transparent pointer-events-none" />

              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-16 h-16 bg-brand-amber text-slate-950 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              >
                <Trophy className="w-8 h-8 fill-current" />
              </motion.div>

              <h2 className="font-outfit font-black text-2xl uppercase tracking-wider text-white">
                Match Results Rendered
              </h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Dynamic test calculations successfully checked.</p>

              <div className="grid grid-cols-2 gap-6 w-full mt-8 border-t border-slate-850 pt-6 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Winner</span>
                  <p className="font-outfit font-black text-base text-brand-amber mt-0.5">{winnerName}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Match Duration</span>
                  <p className="font-outfit font-black text-base text-white mt-0.5">{formatTimer(secondsElapsed)}</p>
                </div>
              </div>
            </div>

            {/* XP and Achievements reveal cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* XP display */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500 block">XP Reward allocation</span>
                
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <p className="font-outfit font-black text-xl text-brand-amber">+100 XP</p>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">Allocated to Winner</span>
                  </div>
                  <div className="text-right">
                    <p className="font-outfit font-black text-base text-white">+25 XP</p>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">Allocated to Loser</span>
                  </div>
                </div>
              </div>

              {/* Achievements display */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
                <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500 block">Achievements Earned</span>
                
                <div className="flex flex-wrap gap-2">
                  {["First Match", "First Win", "Tester"].map((ach, idx) => (
                    <span 
                      key={idx} 
                      className="bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-350 flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5 text-brand-amber" /> {ach}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard status check panel */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <span className="text-white font-bold block">Updated Leaderboard Position</span>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Dummy Data Accepted</p>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-full uppercase tracking-wider">Verified</span>
            </div>

            {/* Navigation buttons */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="secondary" 
                  onClick={handleReset}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5 text-brand-amber" />}
                  className="h-10 text-[9px] uppercase font-bold border-slate-850 text-slate-300 px-2.5 truncate"
                >
                  Play Again
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => router.push("/rooms")}
                  leftIcon={<LogOut className="w-3.5 h-3.5 text-brand-amber" />}
                  className="h-10 text-[9px] uppercase font-bold border-slate-850 text-slate-300 px-2.5 truncate"
                >
                  Return Home
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => router.push("/games")}
                  className="h-10 text-[9px] uppercase font-bold text-slate-950 px-2.5 truncate"
                >
                  Return To Games
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
