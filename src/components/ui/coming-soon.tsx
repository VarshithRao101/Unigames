"use client";

import { useState } from "react";
import { ChevronUp, Clock, Wrench, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- PART 9.1: GAME COMING SOON CARD ---
export function GameComingSoonCard({
  name = "Checkers Deluxe",
  category = "Board",
  initialVotes = 32,
  releaseWindow = "Q4 2026",
}: {
  name?: string;
  category?: string;
  initialVotes?: number;
  releaseWindow?: string;
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);

  const toggleVote = () => {
    if (hasVoted) {
      setVotes((prev) => prev - 1);
      setHasVoted(false);
    } else {
      setVotes((prev) => prev + 1);
      setHasVoted(true);
    }
  };

  return (
    <div className="border-2 border-dashed border-grey-border rounded-3xl p-6 flex flex-col justify-between h-[280px] bg-white hover:bg-grey-light/30 transition-all duration-300">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-widest bg-grey-surface px-2.5 py-1 rounded-full text-slate-muted border border-grey-border/30">
          {category}
        </span>
        <button
          onClick={toggleVote}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
            hasVoted
              ? "bg-brand-amber border-brand-dark/15 text-slate-dark shadow-sm"
              : "bg-white border-grey-border text-slate-muted hover:border-slate-400"
          }`}
        >
          <ChevronUp className="w-3.5 h-3.5" />
          <span>{votes}</span>
        </button>
      </div>

      <div className="text-center my-4">
        <h4 className="font-outfit font-extrabold text-xl text-slate-dark">{name}</h4>
        <span className="text-[10px] font-bold text-slate-muted uppercase tracking-wider block mt-1">
          Target: {releaseWindow}
        </span>
      </div>

      <Button variant="secondary" size="sm" onClick={toggleVote} className="w-full text-xs">
        {hasVoted ? "Voted to Accelerate" : "Vote to Prioritize"}
      </Button>
    </div>
  );
}

// --- PART 9.2: DEVELOPMENT PROGRESS CARD ---
export function DevProgressCard({
  name = "Ludo Party",
  category = "Board",
  developer = "DevWizard",
  progress = 85,
}: {
  name?: string;
  category?: string;
  developer?: string;
  progress?: number;
}) {
  return (
    <div className="border border-grey-border rounded-3xl p-6 bg-white shadow-sm flex flex-col justify-between h-[280px]">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
          {category}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-grey-surface px-2.5 py-1 rounded-full text-slate-muted border border-grey-border/35 flex items-center gap-1">
          <Wrench className="w-3 h-3" /> In Coding
        </span>
      </div>

      <div>
        <h4 className="font-outfit font-extrabold text-xl text-slate-dark">{name}</h4>
        <p className="text-[10px] text-slate-muted font-bold font-outfit uppercase tracking-widest mt-1 flex items-center gap-1">
          <User className="w-3.5 h-3.5" /> {developer}
        </p>
      </div>

      <div>
        <div className="flex justify-between text-[10px] font-bold font-outfit text-slate-muted mb-1.5 pl-0.5">
          <span>PROGRESS</span>
          <span className="text-purple-700">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-grey-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// --- PART 9.3: UPCOMING RELEASE CARD ---
export function UpcomingReleaseCard({
  name = "Reversi Online",
  releaseDate = "Q3 2026",
  features = ["Private Rooms", "ELO Leaderboards", "Custom skins"],
}: {
  name?: string;
  releaseDate?: string;
  features?: string[];
}) {
  return (
    <div className="border border-grey-border rounded-3xl p-6 bg-white shadow-sm flex flex-col justify-between h-[280px]">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-brand-dark px-2.5 py-1 rounded-full border border-brand-amber/25">
          Release Tracker
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {releaseDate}
        </span>
      </div>

      <div className="my-2">
        <h4 className="font-outfit font-extrabold text-lg text-slate-dark flex items-center gap-1.5">
          {name}
          <Sparkles className="w-4.5 h-4.5 text-brand-amber fill-current animate-pulse" />
        </h4>
        <div className="flex flex-col gap-1 mt-2.5 pl-1.5">
          {features.slice(0, 3).map((f) => (
            <span key={f} className="text-[10px] font-semibold text-slate-muted flex items-center gap-1">
              • {f}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-grey-border pt-4 flex items-center justify-between">
        <span className="text-[10px] font-bold font-outfit text-slate-muted uppercase">
          Status: Readying Build
        </span>
      </div>
    </div>
  );
}
