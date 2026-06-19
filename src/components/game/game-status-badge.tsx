"use client";

import { CheckCircle2, Play, Flame, Wrench, Lock, Compass } from "lucide-react";
import { GameStatus } from "@/types/game";

export function GameStatusBadge({ status }: { status: GameStatus }) {
  const configs = {
    released: {
      text: "Released",
      classes: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2,
    },
    beta: {
      text: "Beta Test",
      classes: "bg-amber-100 text-brand-dark border-brand-amber/30",
      icon: Play,
    },
    alpha: {
      text: "Alpha Test",
      classes: "bg-orange-100 text-orange-700 border-orange-200",
      icon: Flame,
    },
    development: {
      text: "In Coding",
      classes: "bg-purple-100 text-purple-700 border-purple-200",
      icon: Wrench,
    },
    planning: {
      text: "Planning",
      classes: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Compass,
    },
    coming_soon: {
      text: "Coming Soon",
      classes: "bg-slate-100 text-slate-600 border-slate-200",
      icon: Lock,
    },
  };

  const config = configs[status] || configs.coming_soon;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold font-outfit uppercase tracking-wider border rounded-full shadow-sm ${config.classes}`}
    >
      <Icon className="w-3.5 h-3.5 fill-current" />
      <span>{config.text}</span>
    </span>
  );
}
