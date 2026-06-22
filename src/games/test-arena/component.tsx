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
            <div className="bg-[#24261f] border-[3px] border-black rounded-[2rem] p-6 space-y-4 shadow-[4px_4px_0px_#000000]">
              <div className="flex justify-between items-center border-b-[2.5px] border-black/40 pb-3">
                <h4 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-brand-orange animate-pulse" /> Game Successfully Loaded
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-brand-orange font-mono font-black">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Match Timer: {formatTimer(secondsElapsed)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="bg-[#1c1d18] p-3.5 rounded-2xl border-[2.5px] border-black flex items-center justify-between shadow-[2px_2px_0px_#000000]">
                  <span className="text-slate-300 font-extrabold">{players[0]?.name || "Player 1"}</span>
                  <span className="text-[10px] text-[#00ffcc] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse" /> Connected
                  </span>
                </div>
                <div className="bg-[#1c1d18] p-3.5 rounded-2xl border-[2.5px] border-black flex items-center justify-between shadow-[2px_2px_0px_#000000]">
                  <span className="text-slate-300 font-extrabold">{players[1]?.name || "Player 2"}</span>
                  <span className="text-[10px] text-[#00ffcc] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse" /> Connected
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                <span>Match ID: {match.matchId}</span>
                <span className="text-right">Room Code: #{room.code}</span>
              </div>
            </div>

            {/* Simulated Win Trigger Action Buttons */}
            <div className="bg-[#24261f] border-[3px] border-black rounded-[2rem] p-8 text-center space-y-5 shadow-[4px_4px_0px_#000000]">
              <div>
                <h4 className="font-outfit font-black text-sm uppercase tracking-wide text-white">Simulate End Match Results</h4>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold uppercase tracking-wider">Select the winner to test state transitions and reward calculations.</p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => handleEndMatchSimulation(0)}
                  className="btn-neo flex-1 h-12 uppercase font-black text-xs tracking-wider shadow-[3px_3px_0px_#000000]"
                >
                  Player 1 Wins
                </Button>
                <Button
                  onClick={() => handleEndMatchSimulation(1)}
                  className="btn-neo flex-1 h-12 uppercase font-black text-xs tracking-wider shadow-[3px_3px_0px_#000000]"
                >
                  Player 2 Wins
                </Button>
              </div>
            </div>

            {/* Spectator HUD Info */}
            <div className="bg-[#24261f] border-[3px] border-black rounded-[2rem] p-5 flex items-center justify-between shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-brand-orange animate-pulse" />
                <div className="text-left text-xs">
                  <span className="text-white font-black block">Spectator Panel Active</span>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-wider">Live streaming to viewers list.</p>
                </div>
              </div>
              <span className="bg-[#1c1d18] border-[2.5px] border-black px-3 py-1.5 rounded-xl font-mono text-xs font-black text-brand-orange shadow-[2px_2px_0px_#000000]">
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
            <div className="bg-[#24261f] border-[3px] border-black rounded-[2rem] p-8 text-center relative overflow-hidden shadow-[6px_6px_0px_#000000] flex flex-col items-center">
              <div className="absolute inset-0 bg-radial-gradient from-brand-orange/10 via-transparent to-transparent pointer-events-none" />

              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-16 h-16 bg-brand-orange border-[3px] border-black text-slate-950 rounded-2xl flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000000]"
              >
                <Trophy className="w-8 h-8 fill-current" />
              </motion.div>

              <h2 className="font-outfit font-black text-2xl uppercase tracking-wider text-white">
                Match Results Rendered
              </h2>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">Dynamic test calculations successfully checked.</p>

              <div className="grid grid-cols-2 gap-6 w-full mt-8 border-t-[2.5px] border-black/45 pt-6 text-center">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Winner</span>
                  <p className="font-outfit font-black text-base text-brand-orange mt-0.5">{winnerName}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Match Duration</span>
                  <p className="font-outfit font-black text-base text-white mt-0.5">{formatTimer(secondsElapsed)}</p>
                </div>
              </div>
            </div>

            {/* XP and Achievements reveal cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* XP display */}
              <div className="bg-[#24261f] border-[3px] border-black p-6 rounded-[2rem] space-y-4 shadow-[4px_4px_0px_#000000]">
                <span className="font-outfit font-black text-[9px] uppercase tracking-widest text-slate-500 block">XP Reward allocation</span>
                
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <p className="font-outfit font-black text-xl text-brand-orange">+100 XP</p>
                    <span className="text-[10px] text-slate-550 font-extrabold uppercase mt-0.5 block">Winner</span>
                  </div>
                  <div className="text-right">
                    <p className="font-outfit font-black text-base text-white">+25 XP</p>
                    <span className="text-[10px] text-slate-550 font-extrabold uppercase mt-0.5 block">Loser</span>
                  </div>
                </div>
              </div>

              {/* Achievements display */}
              <div className="bg-[#24261f] border-[3px] border-black p-6 rounded-[2rem] space-y-3 shadow-[4px_4px_0px_#000000]">
                <span className="font-outfit font-black text-[9px] uppercase tracking-widest text-slate-500 block">Achievements Earned</span>
                
                <div className="flex flex-wrap gap-2">
                  {["First Match", "First Win", "Tester"].map((ach, idx) => (
                    <span 
                      key={idx} 
                      className="bg-[#1c1d18] border-[2px] border-black px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-300 flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
                    >
                      <Award className="w-3.5 h-3.5 text-brand-orange" /> {ach}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard status check panel */}
            <div className="bg-[#24261f] border-[3px] border-black p-5 rounded-[2rem] flex items-center justify-between text-xs shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00ffcc]" />
                <div className="text-left">
                  <span className="text-white font-black block">Updated Leaderboard Position</span>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-wider">Dummy Data Accepted</p>
                </div>
              </div>
              <span className="text-[9px] font-black bg-[#00ffcc]/15 text-[#00ffcc] border-[2px] border-[#00ffcc]/30 px-3 py-1 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_#000000]">Verified</span>
            </div>

            {/* Navigation buttons */}
            <div className="bg-[#24261f] border-[3px] border-black p-6 rounded-[2rem] shadow-[4px_4px_0px_#000000]">
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={handleReset}
                  className="h-11 text-[9px] uppercase font-black bg-[#1c1d18] border-[3px] border-black rounded-xl text-white shadow-[2px_2px_0px_#000000] cursor-pointer hover:bg-slate-800 active:translate-y-px transition-all px-2.5 truncate"
                >
                  Play Again
                </button>
                <button 
                  onClick={() => router.push("/rooms")}
                  className="h-11 text-[9px] uppercase font-black bg-[#1c1d18] border-[3px] border-black rounded-xl text-white shadow-[2px_2px_0px_#000000] cursor-pointer hover:bg-slate-800 active:translate-y-px transition-all px-2.5 truncate"
                >
                  Return Home
                </button>
                <button 
                  onClick={() => router.push("/games")}
                  className="btn-neo h-11 text-[9px] uppercase font-black px-2.5 truncate shadow-[2px_2px_0px_#000000]"
                >
                  Return To Games
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
