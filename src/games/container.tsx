"use client";

import React, { useState, useEffect } from "react";
import { getGameRegistryEntry } from "./registry";
import { GameMetadata, GameLifeCycleState } from "./types";
import { MatchProvider, useMatchContext } from "./context";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, Settings, HelpCircle, Eye, RefreshCw, 
  Calendar, Award, Star, Info, Play, Pause, AlertTriangle, Cpu, Users
} from "lucide-react";
import { motion } from "framer-motion";

interface GameContainerProps {
  gameIdOrSlug: string;
  roomCode: string;
  onFinish?: (winnerId?: string, rankings?: string[], xp?: Record<string, number>) => void;
  onBack?: () => void;
}

export function GameContainer({ gameIdOrSlug, roomCode, onFinish, onBack }: GameContainerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"missing" | "unsupported" | "failed" | null>(null);

  const entry = getGameRegistryEntry(gameIdOrSlug);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (!entry) {
        setError("missing");
      } else if (entry.metadata.status === "coming_soon" && entry.metadata.id !== "tictactoe") {
        // Mocking unsupported or planning states for demonstration
        setError(null); 
      } else if (parseFloat(entry.metadata.version) < 0.5) {
        setError("unsupported");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [gameIdOrSlug, entry]);

  // Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-950 border border-slate-900 rounded-3xl p-8 text-center space-y-4">
        <svg className="animate-spin h-10 w-10 text-brand-amber" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="font-outfit font-black text-xs text-slate-400 uppercase tracking-widest">
          Mounting Dynamic Game Container...
        </p>
      </div>
    );
  }

  // Graceful Error Screen - Missing Game
  if (error === "missing" || !entry) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-outfit font-black text-2xl uppercase tracking-wide">Game Module Missing</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The requested game identifier <span className="text-brand-amber font-mono font-bold">"{gameIdOrSlug}"</span> is not registered in the platform game directory.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="secondary" onClick={() => window.location.reload()} className="h-10 text-xs font-bold uppercase tracking-wider">
            Reload Platform
          </Button>
          <Button variant="primary" onClick={() => (window.location.href = "/rooms")} className="h-10 text-xs font-bold uppercase tracking-wider text-slate-950">
            Browse Lobbies
          </Button>
        </div>
      </div>
    );
  }

  // Graceful Error Screen - Unsupported Version
  if (error === "unsupported") {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-brand-amber/10 border border-brand-amber/35 text-brand-amber rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-outfit font-black text-2xl uppercase tracking-wide">Outdated Engine Version</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Game module <span className="text-brand-amber font-bold">"{entry.metadata.name}"</span> version <span className="text-brand-amber font-mono font-bold">{entry.metadata.version}</span> is deprecated. Platform dynamic loader requires game components configured with SDK version <span className="text-white font-mono font-bold">&gt;= 0.5.0</span>.
          </p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-left">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Submitter Info</span>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Developer Team: <span className="text-white font-semibold">{entry.metadata.developerTeam.teamName}</span>. Contact developer lead to push a new SDK build version.
          </p>
        </div>
        <Button variant="primary" onClick={() => (window.location.href = "/rooms")} className="w-full h-11 text-xs font-bold uppercase tracking-wider text-slate-950">
          Return to Room Browser
        </Button>
      </div>
    );
  }

  // Placeholder support screen for Alpha / Beta / Upcoming Games
  if (entry.metadata.status !== "released") {
    const isUnderDev = entry.metadata.status === "development" || entry.metadata.status === "alpha";
    const devProgress = entry.metadata.status === "development" ? 45 : entry.metadata.status === "alpha" ? 65 : 85;

    return (
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-10 max-w-2xl mx-auto shadow-2xl space-y-8 relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-brand-amber/10 border-l border-b border-brand-amber/20 px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest text-brand-amber">
          {entry.metadata.status} status
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-center text-4xl shadow-md">
            {entry.metadata.thumbnail}
          </div>
          <div>
            <h2 className="font-outfit font-black text-2xl uppercase tracking-wide">{entry.metadata.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Category: {entry.metadata.category} | Version: {entry.metadata.version}</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
          {entry.metadata.description}
        </p>

        {/* Development progress bar */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Development Integration Progress</span>
            <span className="text-brand-amber font-mono">{devProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-brand-amber transition-all duration-500" style={{ width: `${devProgress}%` }} />
          </div>
        </div>

        {/* Developer Metadata Disclosure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="space-y-2">
            <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Developer Team</span>
            <div className="space-y-1">
              <p className="text-slate-200 font-bold">{entry.metadata.developerTeam.developerName}</p>
              <p className="text-[10px] text-slate-400">{entry.metadata.developerTeam.teamName} Hub</p>
            </div>
            <div className="pt-2">
              <span className="font-outfit font-bold text-[8px] uppercase tracking-widest text-slate-500 block mb-1">Contributors</span>
              <p className="text-[10px] text-slate-400">{entry.metadata.developerTeam.contributors.join(", ")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Release Notes</span>
            <ul className="space-y-1.5 list-disc pl-4 text-[10px] text-slate-400 leading-relaxed">
              {entry.metadata.developerTeam.releaseNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-800/80">
          <Button variant="secondary" onClick={() => window.history.back()} className="flex-1 h-11 uppercase font-bold text-xs">
            Back to Games
          </Button>
          <Button variant="primary" className="flex-1 h-11 uppercase font-bold text-xs text-slate-950">
            Submit Alpha Feedback
          </Button>
        </div>
      </div>
    );
  }

  // Setup match parameters
  const initialRoomData = {
    code: roomCode,
    name: "Platform Lobbies Arena",
    isPrivate: false,
    region: "us-west",
    friendsOnly: false,
    allowSpectators: true,
    autoStart: false
  };

  const initialPlayersList = [
    { id: "p1", name: "You (Varshith)", avatar: "V", isHost: true, isReady: false, isAI: false, color: "#FFC107" },
    { id: "p2", name: "AliceW", avatar: "A", isHost: false, isReady: true, isAI: false, color: "#1971C2" }
  ];

  const GameComponent = entry.component;

  return (
    <MatchProvider initialRoom={initialRoomData} initialPlayers={initialPlayersList} initialGameId={entry.metadata.id}>
      <GameWorkspaceWrapper component={GameComponent} metadata={entry.metadata} onFinish={onFinish} onBack={onBack} />
    </MatchProvider>
  );
}

// Subcomponent wrapper to consume the MatchContext inside Provider
function GameWorkspaceWrapper({ 
  component: GameComponent,
  metadata,
  onFinish,
  onBack
}: { 
  component: React.ComponentType<any>;
  metadata: GameMetadata;
  onFinish?: (winnerId?: string, rankings?: string[], xp?: Record<string, number>) => void;
  onBack?: () => void;
}) {
  const { 
    lifecycleState, setLifecycleState, settings, setSettings, room, match, players, spectators, isSpectator, sendAction, updateState, endMatch, setReady 
  } = useMatchContext();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [developerInfoOpen, setDeveloperInfoOpen] = useState(false);

  // Default SDK parameter passed to components
  const sdk = {
    sendAction,
    updateState,
    endMatch,
    setReady
  };

  // Trigger onFinish callback on match conclusions
  useEffect(() => {
    if (lifecycleState === "finished" && onFinish) {
      onFinish(match.winnerId, match.rankings, match.xpEarned);
    }
  }, [lifecycleState, onFinish, match]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Main Gameplay Screen Frame (Mobile, Tablet, Desktop Responsive Wrapper) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Game Render Frame Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          
          {/* Header Info HUD */}
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{metadata.thumbnail}</span>
              <div>
                <h3 className="font-outfit font-black text-sm uppercase tracking-wide text-white">
                  {metadata.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold block mt-0.5">
                  ID: {metadata.id} | Ver: {metadata.version}
                </span>
              </div>
            </div>

            {/* Lifecycle active status badge */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lifecycle</span>
              <span className="bg-brand-amber/10 border border-brand-amber/30 text-brand-amber text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                {lifecycleState}
              </span>
            </div>
          </div>

          {/* Load component inside standard container */}
          <div className="min-h-[350px] flex items-center justify-center bg-slate-950/45 rounded-2xl border border-slate-850 p-4">
            {lifecycleState === "waiting" ? (
              <div className="text-center space-y-4 max-w-sm py-12">
                <span className="text-5xl animate-pulse inline-block">{metadata.thumbnail}</span>
                <div>
                  <h4 className="font-outfit font-black text-base uppercase tracking-wide">Lobby Sync Complete</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Dynamic settings configured. Tap "Start Session" to bootstrap the {metadata.name} rules engine.
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  onClick={() => setLifecycleState("in_progress")}
                  className="h-10 text-xs font-bold uppercase tracking-wider text-slate-950"
                >
                  Start Session
                </Button>
              </div>
            ) : (
              <div className="w-full">
                <GameComponent 
                  room={room} 
                  match={match} 
                  players={players} 
                  spectators={spectators} 
                  lifecycleState={lifecycleState} 
                  settings={settings} 
                  isSpectator={isSpectator}
                  sdk={sdk} 
                />
              </div>
            )}
          </div>
          
        </div>

        {/* Dynamic Rules Engine panel */}
        <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-4">
          <h4 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-amber" /> Rules Engine Specification
          </h4>
          <ul className="space-y-2 list-disc pl-5 text-xs text-slate-400 leading-relaxed">
            {metadata.rulesList.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Side Controllers Panel */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Settings Hub Drawer */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <button 
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex justify-between items-center text-xs font-bold font-outfit uppercase tracking-wider text-slate-450 hover:text-white cursor-pointer"
          >
            <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-brand-amber" /> Game Parameters</span>
            <span className="text-brand-amber text-[10px]">{settingsOpen ? "Collapse" : "Expand"}</span>
          </button>

          {settingsOpen && (
            <div className="space-y-4 pt-4 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">Ranked Matchmaking</span>
                <input 
                  type="checkbox" 
                  checked={settings.ranked || false}
                  onChange={(e) => setSettings(prev => ({ ...prev, ranked: e.target.checked }))}
                  className="w-4 h-4 accent-brand-amber"
                />
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block">Max Turn Duration (seconds)</span>
                <input 
                  type="number" 
                  value={settings.turnTimer || 30}
                  onChange={(e) => setSettings(prev => ({ ...prev, turnTimer: parseInt(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-brand-amber"
                  min={10}
                  max={120}
                />
              </div>
            </div>
          )}
        </div>

        {/* Developer Metadata Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <button 
            onClick={() => setDeveloperInfoOpen(!developerInfoOpen)}
            className="w-full flex justify-between items-center text-xs font-bold font-outfit uppercase tracking-wider text-slate-450 hover:text-white cursor-pointer"
          >
            <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-brand-amber" /> Developer Metadata</span>
            <span className="text-brand-amber text-[10px]">{developerInfoOpen ? "Collapse" : "Expand"}</span>
          </button>

          {developerInfoOpen && (
            <div className="space-y-4 pt-4 border-t border-slate-800/80 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Team</span>
                  <p className="text-white font-bold mt-0.5">{metadata.developerTeam.teamName}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Version</span>
                  <p className="text-white font-bold mt-0.5">{metadata.version}</p>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Contributors</span>
                <p className="text-slate-400 mt-1 leading-relaxed">{metadata.developerTeam.contributors.join(", ")}</p>
              </div>

              <div className="border-t border-slate-850 pt-3">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Release History</span>
                <ul className="space-y-1 list-disc pl-4 text-[10px] text-slate-400">
                  {metadata.developerTeam.releaseNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
