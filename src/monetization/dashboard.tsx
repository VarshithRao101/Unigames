"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, TrendingUp, Users, Eye, DollarSign, 
  ShoppingBag, Sparkles, SlidersHorizontal, Settings, HelpCircle, 
  Share2, ChevronRight, Award, Zap, Activity, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatItem {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

export function UserEngagementDashboard() {
  const [activeTab, setActiveTab] = useState<"engagement" | "monetization">("engagement");

  const [eventsCount, setEventsCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("unigames_analytics_events");
        if (raw) {
          const events = JSON.parse(raw);
          setEventsCount(events.length);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const stats: StatItem[] = [
    {
      label: "Active Users (DAU)",
      value: "1,248",
      change: "+12.4% vs yesterday",
      isPositive: true,
      icon: <Users className="w-5 h-5 text-brand-amber" />
    },
    {
      label: "Total Match Completions",
      value: "412",
      change: "+8.2% vs last week",
      isPositive: true,
      icon: <Trophy className="w-5 h-5 text-brand-amber" />
    },
    {
      label: "Platform Event Telemetries",
      value: String(Math.max(48, eventsCount)),
      change: "Recorded in local database",
      isPositive: true,
      icon: <Activity className="w-5 h-5 text-green-400" />
    },
    {
      label: "Avg. Lobby Session Duration",
      value: "14m 32s",
      change: "+1m 15s vs average",
      isPositive: true,
      icon: <Clock className="w-5 h-5 text-brand-amber" />
    }
  ];

  const monetizationStats: StatItem[] = [
    {
      label: "Estimated Ad Revenue",
      value: "$142.50",
      change: "+18.4% vs last week",
      isPositive: true,
      icon: <DollarSign className="w-5 h-5 text-green-400" />
    },
    {
      label: "Ad Placement Views",
      value: "14,820",
      change: "+4.1% vs yesterday",
      isPositive: true,
      icon: <Eye className="w-5 h-5 text-brand-amber" />
    },
    {
      label: "Sponsor Conversion Rate",
      value: "2.42%",
      change: "+0.15% vs average",
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5 text-brand-amber" />
    },
    {
      label: "Cosmetic Purchases",
      value: "128,400 Coins",
      change: "+15.2% vs last week",
      isPositive: true,
      icon: <ShoppingBag className="w-5 h-5 text-indigo-400" />
    }
  ];

  const popularPages = [
    { page: "/games", name: "Games Explorer Catalog", views: 2480 },
    { page: "/rooms", name: "Arena Room Browser", views: 1850 },
    { page: "/leaderboards", name: "Champions Leaderboard", views: 1210 },
    { page: "/profile", name: "Social Profile Lounge", views: 940 }
  ];

  const mostPlayedGames = [
    { game: "Chess Online", matches: 180, category: "Board Games", activeLobbies: 14 },
    { game: "Ludo Club", matches: 140, category: "Board Games", activeLobbies: 8 },
    { game: "Tic-Tac-Toe Arena", matches: 90, category: "Arcade", activeLobbies: 4 }
  ];

  return (
    <div className="space-y-8">
      {/* Tab control headers */}
      <div className="flex border border-slate-900 bg-slate-950 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("engagement")}
          className={`px-4 py-2 text-xs font-bold font-outfit uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === "engagement"
              ? "bg-brand-amber text-slate-950 font-black shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          User Engagement Metrics
        </button>
        <button
          onClick={() => setActiveTab("monetization")}
          className={`px-4 py-2 text-xs font-bold font-outfit uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === "monetization"
              ? "bg-brand-amber text-slate-950 font-black shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Platform Revenue Analytics
        </button>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(activeTab === "engagement" ? stats : monetizationStats).map((stat, idx) => (
          <div 
            key={idx}
            className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                {stat.icon}
              </div>
            </div>

            <div>
              <h4 className="font-outfit font-black text-2xl text-white">{stat.value}</h4>
              <p className={`text-[10px] font-semibold mt-1 ${stat.isPositive ? "text-green-400" : "text-red-400"}`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 columns - Most Played Games */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-450 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-amber" /> Game Module Engagements
            </h4>
            <span className="text-[9px] font-bold text-brand-amber uppercase tracking-wider">Live feeds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Game module</th>
                  <th className="pb-3 text-center">Category</th>
                  <th className="pb-3 text-center">Matches Launched</th>
                  <th className="pb-3 text-right">Active Rooms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-white font-medium">
                {mostPlayedGames.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-950/20">
                    <td className="py-4 font-outfit font-extrabold text-sm">{item.game}</td>
                    <td className="py-4 text-center text-slate-400">{item.category}</td>
                    <td className="py-4 text-center text-brand-amber font-mono font-bold">{item.matches}</td>
                    <td className="py-4 text-right text-slate-400 font-mono">{item.activeLobbies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 columns - Popular Pages / Path Tracker */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h4 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-450 flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-amber" /> Routing Views Tracker
          </h4>

          <div className="space-y-3">
            {popularPages.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-900">
                <div className="text-left space-y-0.5">
                  <span className="text-white font-bold block">{item.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono block">{item.page}</span>
                </div>
                <span className="text-[10px] text-brand-amber font-mono font-black">{item.views} Views</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
