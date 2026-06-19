"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Users, ArrowUpRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Game } from "@/types/game";
import { GameStatusBadge } from "./game-status-badge";

export interface AdvancedGameCardProps {
  game: Game;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string, state: boolean) => void;
}

export function AdvancedGameCard({ game, isFavorited = false, onToggleFavorite }: AdvancedGameCardProps) {
  const [fav, setFav] = useState(isFavorited);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !fav;
    setFav(newState);
    if (onToggleFavorite) onToggleFavorite(game.id, newState);
  };

  const getStatusColor = (status: Game["status"]) => {
    switch (status) {
      case "released": return "bg-green-600";
      case "beta": return "bg-amber-500";
      case "alpha": return "bg-orange-500";
      case "development": return "bg-purple-600";
      case "planning": return "bg-blue-600";
      default: return "bg-slate-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`border rounded-3xl p-6 bg-grey-surface/90 flex flex-col justify-between h-[360px] shadow-premium relative group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-hover border-brand-amber/15 hover:border-brand-amber/40 ${
        game.status === "coming_soon" ? "border-dashed border-grey-border" : "border-grey-border"
      }`}
    >
      {/* Top Bar: Category & Status */}
      <div className="flex justify-between items-start z-10">
        <span className="text-[9px] font-bold uppercase tracking-widest bg-slate-dark border border-grey-border/30 px-2.5 py-1 rounded-full text-slate-300">
          {game.category}
        </span>
        <GameStatusBadge status={game.status} />
      </div>

      {/* Middle: Game representation placeholder & Info */}
      <div className="my-5 flex-1 flex flex-col justify-center text-center">
        {/* Animated Letter circle */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-dark border border-grey-border/30 flex items-center justify-center text-slate-400 mb-3.5 font-outfit font-extrabold text-2xl group-hover:scale-105 group-hover:bg-brand-amber/10 group-hover:text-brand-light transition-all duration-300 relative">
          <span>{game.name.charAt(0)}</span>
          
          {/* Heart/Favorite toggle overlays */}
          <button
            onClick={toggleFavorite}
            className="absolute -top-1.5 -right-1.5 p-1.5 rounded-full bg-slate-dark/95 border border-grey-border/40 shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            aria-label="Toggle Favorite"
          >
            <motion.div animate={{ scale: fav ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.2 }}>
              <Heart className={`w-3.5 h-3.5 ${fav ? "text-red-500 fill-red-500" : "text-slate-500"}`} />
            </motion.div>
          </button>
        </div>

        <h3 className="font-outfit font-extrabold text-lg text-white leading-snug truncate group-hover:text-brand-amber transition-colors px-2">
          {game.name}
        </h3>
        
        <p className="text-[10px] text-slate-400 font-bold font-outfit uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
          <Users className="w-3.5 h-3.5 text-slate-500" /> {game.multiplayerType}
        </p>
      </div>

      {/* Bottom Bar: Engine/Votes progress bar & Launch link */}
      <div>
        <div className="mb-4 pl-0.5 pr-0.5">
          <div className="flex justify-between text-[10px] font-bold font-outfit text-slate-400 mb-1">
            <span>{game.status === "coming_soon" ? "COMMUNITY REQUESTS" : "ENGINE PROGRESS"}</span>
            <span>{game.status === "coming_soon" ? `${game.votes || 0} Votes` : `${game.progressPercent}%`}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-dark rounded-full overflow-hidden border border-grey-border/30">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getStatusColor(game.status)}`}
              style={{ width: `${game.status === "coming_soon" ? Math.min(((game.votes || 0) / 300) * 100, 100) : game.progressPercent}%` }}
            />
          </div>
        </div>

        {/* View Details Link */}
        <Link href={`/games/${game.slug}`} className="block w-full">
          <Button
            variant={game.status === "released" ? "primary" : "secondary"}
            size="sm"
            className="w-full text-xs"
            rightIcon={game.status === "released" ? <ArrowUpRight className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          >
            {game.status === "released" ? "Play Arena" : "View Specifications"}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
