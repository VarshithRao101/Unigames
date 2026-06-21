"use client";

import React, { useState, useEffect } from "react";
import { getGameRegistryEntry } from "./registry";
import { GameMetadata } from "./types";
import { MatchProvider, useMatchContext } from "./context";
import { 
  ShieldAlert, Settings, HelpCircle, 
  RefreshCw, Award, Info, AlertTriangle, Cpu
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
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-800 border-[4px] border-black rounded-[2.5rem] p-8 text-center space-y-4 shadow-[8px_8px_0px_#000000]">
        <svg className="animate-spin h-10 w-10 text-brand-orange" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="font-outfit font-black text-xs text-slate-400 uppercase tracking-widest">
          Initializing Game Module...
        </p>
      </div>
    );
  }

  // Graceful Error Screen - Missing Game
  if (error === "missing" || !entry) {
    return (
      <div className="bg-slate-800 border-[4px] border-black text-white rounded-[2.5rem] p-12 text-center max-w-lg mx-auto shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="w-16 h-16 bg-danger/15 border-[3px] border-black rounded-2xl flex items-center justify-center mx-auto text-danger shadow-[3px_3px_0px_#000000]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-outfit font-black text-2xl uppercase tracking-wide">Game Module Missing</h2>
          <p className="text-xs text-slate-450 mt-2 leading-relaxed">
            The requested game identifier <span className="text-brand-orange font-mono font-bold">"{gameIdOrSlug}"</span> is not registered in the platform game directory.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={() => window.location.reload()} className="h-10 px-4 border-[2.5px] border-black bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest shadow-[2.5px_2.5px_0px_#000] cursor-pointer rounded-xl">
            Reload
          </button>
          <button onClick={() => (window.location.href = "/rooms")} className="btn-gaming h-10 px-4 rounded-xl text-[10px] font-black tracking-widest shadow-[2.5px_2.5px_0px_#000]">
            Browse Lobbies
          </button>
        </div>
      </div>
    );
  }

  // Graceful Error Screen - Unsupported Version
  if (error === "unsupported") {
    return (
      <div className="bg-slate-800 border-[4px] border-black text-white rounded-[2.5rem] p-12 text-center max-w-lg mx-auto shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="w-16 h-16 bg-brand-orange/15 border-[3px] border-black text-brand-orange rounded-2xl flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000000]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-outfit font-black text-2xl uppercase tracking-wide">Outdated Engine Version</h2>
          <p className="text-xs text-slate-450 mt-2 leading-relaxed">
            Game module <span className="text-brand-orange font-bold">"{entry.metadata.name}"</span> version <span className="text-brand-orange font-mono font-bold">{entry.metadata.version}</span> is deprecated. Platform dynamic loader requires game components configured with SDK version <span className="text-white font-mono font-bold">&gt;= 0.5.0</span>.
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border-2 border-black text-left shadow-[2px_2px_0px_#000]">
          <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest block">Submitter Info</span>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Developer Team: <span className="text-white font-bold">{entry.metadata.developerTeam.teamName}</span>. Contact developer lead to push a new SDK build version.
          </p>
        </div>
        <button onClick={() => (window.location.href = "/rooms")} className="btn-gaming w-full h-11 text-[10px] font-black tracking-widest shadow-[3px_3px_0px_#000000]">
          Return to Room Browser
        </button>
      </div>
    );
  }

  // Placeholder support screen for Alpha / Beta / Upcoming Games
  if (entry.metadata.status !== "released") {
    const devProgress = entry.metadata.status === "development" ? 45 : entry.metadata.status === "alpha" ? 65 : 85;

    return (
      <div className="bg-slate-800 border-[4px] border-black text-white rounded-[2.5rem] p-10 max-w-2xl mx-auto shadow-[8px_8px_0px_#000000] space-y-8 relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-brand-orange/15 border-l-2 border-b-2 border-black px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest text-brand-orange shadow-[1px_1px_0px_#000]">
          {entry.metadata.status} status
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 border-[3px] border-black rounded-2xl flex items-center justify-center text-4xl shadow-[3px_3px_0px_#000000]">
            {entry.metadata.thumbnail}
          </div>
          <div>
            <h2 className="font-outfit font-black text-2xl uppercase tracking-wide">{entry.metadata.name}</h2>
            <p className="text-xs text-slate-450 mt-0.5">Category: {entry.metadata.category} | Version: {entry.metadata.version}</p>
          </div>
        </div>

        <p className="text-xs text-slate-350 leading-relaxed bg-slate-900 p-4 border-[3px] border-black rounded-2xl shadow-[inset_2px_2px_0px_rgba(0,0,0,0.15)]">
          {entry.metadata.description}
        </p>

        {/* Development progress bar */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-450 uppercase tracking-wider">
            <span>Development Integration Progress</span>
            <span className="text-brand-orange font-mono font-black">{devProgress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-900 border-[3px] border-black rounded-full overflow-hidden shadow-[2px_2px_0px_#000]">
            <div className="h-full bg-brand-orange transition-all duration-500" style={{ width: `${devProgress}%` }} />
          </div>
        </div>

        {/* Developer Metadata Disclosure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t-[3px] border-black/40 text-xs">
          <div className="space-y-2">
            <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Developer Team</span>
            <div className="space-y-1">
              <p className="text-slate-200 font-bold">{entry.metadata.developerTeam.developerName}</p>
              <p className="text-[10px] text-slate-450 font-semibold">{entry.metadata.developerTeam.teamName} Hub</p>
            </div>
            <div className="pt-2">
              <span className="font-outfit font-bold text-[8px] uppercase tracking-widest text-slate-500 block mb-1">Contributors</span>
              <p className="text-[10px] text-slate-450 font-semibold">{entry.metadata.developerTeam.contributors.join(", ")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Release Notes</span>
            <ul className="space-y-1.5 list-disc pl-4 text-[10px] text-slate-450 leading-relaxed font-semibold">
              {entry.metadata.developerTeam.releaseNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t-[3px] border-black/40">
          <button onClick={() => window.history.back()} className="flex-1 h-11 border-[2.5px] border-black bg-slate-800 text-white hover:bg-slate-700 font-black text-xs uppercase tracking-widest rounded-xl shadow-[3px_3px_0px_#000] cursor-pointer animate-none">
            Back to Games
          </button>
          <button className="btn-gaming flex-1 h-11 uppercase font-black text-xs tracking-widest rounded-xl shadow-[3px_3px_0px_#000]">
            Submit Alpha Feedback
          </button>
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
    <MatchProvider matchId="sandbox-match" initialRoom={initialRoomData} initialPlayers={initialPlayersList}>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-none">
      
      {/* Main Gameplay Screen Frame */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Game Render Frame Container */}
        <div className="bg-slate-800 border-[3.5px] border-black rounded-[2rem] p-6 shadow-[6px_6px_0px_#000000] relative overflow-hidden">
          
          {/* Header Info HUD */}
          <div className="flex justify-between items-center border-b-[3px] border-black/45 pb-4 mb-6">
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
              <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Lifecycle</span>
              <span className="bg-brand-orange/15 border-[2px] border-black text-brand-orange text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_#000]">
                {lifecycleState}
              </span>
            </div>
          </div>

          {/* Load component inside standard container */}
          <div className="min-h-[350px] flex items-center justify-center bg-slate-900 rounded-2xl border-[3px] border-black p-4 shadow-[inset_3px_3px_0px_rgba(0,0,0,0.2)] relative overflow-hidden">
            {/* CRT Screen Scanlines and Flicker Overlays */}
            <div className="absolute inset-0 pointer-events-none z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] [background-size:100%_4px,6px_100%] opacity-[0.22] rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />

            {lifecycleState === "waiting" ? (
              <div className="text-center space-y-4 max-w-sm py-12">
                <span className="text-5xl inline-block">{metadata.thumbnail}</span>
                <div>
                  <h4 className="font-outfit font-black text-base uppercase tracking-wide text-white">Lobby Sync Complete</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
                    Dynamic settings configured. Tap "Start Session" to bootstrap the {metadata.name} rules engine.
                  </p>
                </div>
                <button 
                  onClick={() => setLifecycleState("in_progress")}
                  className="btn-gaming h-11 px-6 text-xs font-black uppercase tracking-widest rounded-xl shadow-[3px_3px_0px_#000000]"
                >
                  Start Session
                </button>
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
        <div className="bg-slate-800 border-[3.5px] border-black p-6 rounded-[2rem] shadow-[6px_6px_0px_#000000] space-y-4">
          <h4 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-orange" /> Rules Specification
          </h4>
          <ul className="space-y-2.5 list-none pl-0 text-xs text-slate-350 leading-relaxed font-semibold">
            {metadata.rulesList.map((rule, idx) => (
              <li key={idx} className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 shrink-0 border border-black shadow-[1px_1px_0px_#000]" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Side Controllers Panel */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Settings Hub Drawer */}
        <div className="bg-slate-800 border-[3.5px] border-black rounded-[2rem] p-6 space-y-4 shadow-[6px_6px_0px_#000000]">
          <button 
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex justify-between items-center text-xs font-black font-outfit uppercase tracking-wider text-slate-400 hover:text-white cursor-pointer"
          >
            <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-brand-orange" /> Game Parameters</span>
            <span className="text-brand-orange text-[10px] font-black">{settingsOpen ? "Collapse" : "Expand"}</span>
          </button>

          {settingsOpen && (
            <div className="space-y-4 pt-4 border-t-[2.5px] border-black/40 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-black">Ranked Matchmaking</span>
                <input 
                  type="checkbox" 
                  checked={settings.ranked || false}
                  onChange={(e) => setSettings(prev => ({ ...prev, ranked: e.target.checked }))}
                  className="w-5 h-5 accent-brand-orange cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 font-black block">Max Turn Duration (seconds)</span>
                <input 
                  type="number" 
                  value={settings.turnTimer || 30}
                  onChange={(e) => setSettings(prev => ({ ...prev, turnTimer: parseInt(e.target.value) }))}
                  className="w-full bg-slate-900 border-[3px] border-black rounded-xl px-3 py-2 text-white outline-none focus:border-brand-orange shadow-[2px_2px_0px_#000]"
                  min={10}
                  max={120}
                />
              </div>
            </div>
          )}
        </div>

        {/* Developer Metadata Panel */}
        <div className="bg-slate-800 border-[3.5px] border-black rounded-[2rem] p-6 space-y-4 shadow-[6px_6px_0px_#000000]">
          <button 
            onClick={() => setDeveloperInfoOpen(!developerInfoOpen)}
            className="w-full flex justify-between items-center text-xs font-black font-outfit uppercase tracking-wider text-slate-400 hover:text-white cursor-pointer"
          >
            <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-brand-orange" /> Developer Info</span>
            <span className="text-brand-orange text-[10px] font-black">{developerInfoOpen ? "Collapse" : "Expand"}</span>
          </button>

          {developerInfoOpen && (
            <div className="space-y-4 pt-4 border-t-[2.5px] border-black/40 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Team</span>
                  <p className="text-white font-bold mt-0.5">{metadata.developerTeam.teamName}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Version</span>
                  <p className="text-white font-bold mt-0.5">{metadata.version}</p>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Contributors</span>
                <p className="text-slate-400 mt-1 font-semibold leading-relaxed">{metadata.developerTeam.contributors.join(", ")}</p>
              </div>

              <div className="border-t-[2px] border-black/20 pt-3">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Release History</span>
                <ul className="space-y-1 list-disc pl-4 text-[10px] text-slate-450 font-semibold">
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
