"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ChevronUp, Users, Wrench, Lock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type GameStatus = "active" | "alpha_testing" | "prototyping" | "coming_soon";

export interface GameCardProps {
  id: string;
  slug: string;
  name: string;
  thumbnailUrl: string;
  category: string;
  multiplayerType: string;
  status: GameStatus;
  progressPercent: number;
  releaseWindow?: string;
  developerName: string;
  tags: string[];
  initialVotes?: number;
}

export function GameCard({
  id,
  slug,
  name,
  thumbnailUrl,
  category,
  multiplayerType,
  status,
  progressPercent,
  releaseWindow,
  developerName,
  tags,
  initialVotes = 42,
}: GameCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVoted) {
      setVotes((prev) => prev - 1);
      setHasVoted(false);
    } else {
      setVotes((prev) => prev + 1);
      setHasVoted(true);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // 1. COMING SOON state (Dashed card layout)
  if (status === "coming_soon") {
    return (
      <div className="relative border-2 border-dashed border-grey-border rounded-3xl p-6 flex flex-col justify-between h-[360px] bg-slate-dark/40 hover:bg-slate-dark/60 transition-all duration-300 group">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-grey-surface/85 px-2.5 py-1 rounded-full text-slate-400 border border-grey-border/30">
              {category}
            </span>
            <button
              onClick={handleVote}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-outfit border transition-all duration-200 cursor-pointer ${
                hasVoted
                  ? "bg-brand-amber border-brand-dark/20 text-slate-dark shadow-sm"
                  : "bg-slate-dark border-grey-border text-slate-400 hover:border-brand-amber"
              }`}
            >
              <ChevronUp className={`w-3.5 h-3.5 ${hasVoted ? "translate-y-[-1px]" : ""}`} />
              <span>{votes}</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <h3 className="font-outfit font-extrabold text-2xl text-white group-hover:text-brand-amber transition-colors">
              {name}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-2">{multiplayerType}</p>
          </div>
        </div>

        <div>
          {/* Progress Meter */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold font-outfit text-slate-500 mb-1.5 pl-0.5">
              <span>PRIORITIZATION VOTE</span>
              <span className="text-brand-light">COMING SOON</span>
            </div>
            <div className="w-full h-2 bg-grey-surface rounded-full overflow-hidden">
              <div className="h-full bg-slate-700 rounded-full w-[15%]" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold font-outfit">
              RELEASE: <span className="text-brand-light">{releaseWindow || "Q4 2026"}</span>
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleVote}
              className="!h-9 text-xs"
            >
              {hasVoted ? "Voted" : "Upvote"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PROTOTYPING state (Dashed card layout)
  if (status === "prototyping") {
    return (
      <div className="border border-grey-border rounded-3xl p-6 flex flex-col justify-between h-[360px] bg-slate-dark/40 shadow-premium group">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-950/40 text-purple-300 border border-purple-800/40 px-2.5 py-1 rounded-full">
              {category}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-grey-surface px-2.5 py-1 rounded-full text-slate-400 border border-grey-border/30">
              <Wrench className="w-3 h-3" /> Prototyping
            </span>
          </div>

          <div className="mt-8">
            <h3 className="font-outfit font-extrabold text-2xl text-white group-hover:text-purple-400 transition-colors">
              {name}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">{multiplayerType}</p>
            <p className="text-xs text-slate-500 font-medium mt-3">Dev: {developerName}</p>
          </div>
        </div>

        <div>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold font-outfit text-slate-500 mb-1.5 pl-0.5">
              <span>DEVELOPMENT PROGRESS</span>
              <span className="text-purple-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-grey-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-grey-border pt-4">
            <span className="text-xs text-slate-400 font-bold font-outfit">
              TARGET: <span className="text-brand-light">{releaseWindow || "Q3 2026"}</span>
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              <span>In Dev</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. ALPHA TESTING & ACTIVE states (Visually rich layout)
  return (
    <div className="border border-grey-border rounded-3xl overflow-hidden bg-grey-surface/90 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-hover border-brand-amber/15 hover:border-brand-amber/40 flex flex-col h-[360px] group">
      {/* Thumbnail Area */}
      <div className="relative h-44 bg-slate-dark/80 overflow-hidden">
        {/* Placeholder image representation with canvas background color overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-950 flex items-center justify-center font-outfit font-extrabold text-3xl text-slate-500 group-hover:scale-105 transition-transform duration-500">
          {name.split(" ")[0]}
        </div>
        
        {/* Hover overlay details */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Favorite Star */}
        <button
          onClick={handleFavorite}
          className="absolute top-4 left-4 p-2 bg-slate-950/80 backdrop-blur-sm rounded-full shadow-sm cursor-pointer transition-transform hover:scale-110 active:scale-95 border border-grey-border/30"
          aria-label="Add to Favorites"
        >
          <Star
            className={`w-4 h-4 ${
              isFavorite ? "fill-brand-amber text-brand-amber stroke-brand-amber" : "text-slate-400"
            }`}
          />
        </button>

        {/* Category & Status Overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-950/80 border border-grey-border/30 backdrop-blur-sm px-2.5 py-1 rounded-full text-slate-300 shadow-sm">
            {category}
          </span>
          {status === "alpha_testing" ? (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-amber/10 border border-brand-amber/35 text-brand-light px-2.5 py-1 rounded-full shadow-sm">
              Alpha Testing
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-success/10 border border-success/35 text-success px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Playable
            </span>
          )}
        </div>
      </div>

      {/* Info Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-baseline">
            <h3 className="font-outfit font-extrabold text-xl text-white truncate group-hover:text-brand-amber transition-colors">
              {name}
            </h3>
            {status === "active" && (
              <span className="text-xs font-bold text-success flex items-center gap-1 font-outfit">
                <Users className="w-3.5 h-3.5" />
                240 Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-1">{multiplayerType}</p>
        </div>

        <div className="flex items-center justify-between border-t border-grey-border/60 pt-4">
          <div className="flex flex-wrap gap-1 max-w-[60%]">
            {tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[10px] font-bold text-slate-400 bg-slate-dark/80 px-2 py-0.5 rounded-md border border-grey-border/20">
                #{t}
              </span>
            ))}
          </div>

          {status === "alpha_testing" ? (
            <Link href={`/games/${slug}`}>
              <Button variant="secondary" size="sm" className="!h-9 text-xs">
                Join Alpha
              </Button>
            </Link>
          ) : (
            <Link href={`/games/${slug}`}>
              <Button
                variant="primary"
                size="sm"
                className="!h-9 text-xs"
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Play
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
