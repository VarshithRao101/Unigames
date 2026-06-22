"use client";

import React from "react";
import { Gamepad, Users, Trophy, Bell, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type EmptyStateType = "games" | "friends" | "achievements" | "notifications" | "search";

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ type, title, description, actionText, onAction }: EmptyStateProps) {
  const getConfig = () => {
    switch (type) {
      case "games":
        return {
          icon: <Gamepad className="w-10 h-10 text-brand-amber animate-pulse" />,
          title: title || "No games found",
          description: description || "There are no matches or lobbies active in this category right now.",
          actionText: actionText || "Create Lobby",
        };
      case "friends":
        return {
          icon: <Users className="w-10 h-10 text-brand-amber" />,
          title: title || "No Friends Added",
          description: description || "Connect with other board gamers to form custom lobby rooms.",
          actionText: actionText || "Find Friends",
        };
      case "achievements":
        return {
          icon: <Trophy className="w-10 h-10 text-brand-amber" />,
          title: title || "No Achievements Unlocked",
          description: description || "Play Tic-Tac-Toe and other arena games to earn competitive medals.",
          actionText: actionText || "Explore Leaderboards",
        };
      case "notifications":
        return {
          icon: <Bell className="w-10 h-10 text-slate-500" />,
          title: title || "Inbox is Clear",
          description: description || "We will notify you here when you receive invitations or invites.",
          actionText: null,
        };
      case "search":
        return {
          icon: <Search className="w-10 h-10 text-slate-500" />,
          title: title || "No Results Match",
          description: description || "We couldn't find matches for your search filter term.",
          actionText: actionText || "Reset Filters",
        };
      default:
        return {
          icon: <AlertCircle className="w-10 h-10 text-slate-500" />,
          title: "Nothing found",
          description: "This view is currently empty.",
          actionText: null,
        };
    }
  };

  const config = getConfig();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-slate-900/40 border border-slate-900 max-w-md mx-auto space-y-4">
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
        {config.icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-outfit font-bold text-base text-white uppercase tracking-wide">
          {config.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed px-4">
          {config.description}
        </p>
      </div>
      {config.actionText && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          size="sm"
          className="font-outfit font-extrabold uppercase tracking-wider text-[10px] py-1.5 h-8 shadow-tactile transition-all"
        >
          {config.actionText}
        </Button>
      )}
    </div>
  );
}
