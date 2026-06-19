"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  RoomData, MatchData, Player, Spectator, GameLifeCycleState, GameComponentProps 
} from "./types";

interface MatchContextType {
  room: RoomData;
  match: MatchData;
  players: Player[];
  spectators: Spectator[];
  lifecycleState: GameLifeCycleState;
  settings: Record<string, any>;
  isSpectator: boolean;
  setRoom: React.Dispatch<React.SetStateAction<RoomData>>;
  setMatch: React.Dispatch<React.SetStateAction<MatchData>>;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setSpectators: React.Dispatch<React.SetStateAction<Spectator[]>>;
  setLifecycleState: (state: GameLifeCycleState) => void;
  setSettings: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  sendAction: (action: string, data?: Record<string, any>) => void;
  updateState: (newState: Record<string, any>) => void;
  endMatch: (winnerId?: string, rankings?: string[], xp?: Record<string, number>) => void;
  setReady: (playerId: string, isReady: boolean) => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ 
  children,
  initialRoom,
  initialPlayers,
  initialGameId
}: { 
  children: React.ReactNode;
  initialRoom: RoomData;
  initialPlayers: Player[];
  initialGameId: string;
}) {
  const [room, setRoom] = useState<RoomData>(initialRoom);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [spectators, setSpectators] = useState<Spectator[]>([]);
  const [lifecycleState, setLifecycleState] = useState<GameLifeCycleState>("waiting");
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [match, setMatch] = useState<MatchData>({
    matchId: `match-${Date.now()}`,
    gameState: {},
    history: []
  });

  const isSpectator = !players.some(p => p.id === "p1"); // Assume "p1" is current user's local player ID

  const sendAction = (action: string, data?: Record<string, any>) => {
    setMatch(prev => ({
      ...prev,
      history: [
        ...prev.history,
        {
          playerId: "p1",
          action: `${action}: ${JSON.stringify(data || {})}`,
          timestamp: Date.now()
        }
      ]
    }));
  };

  const updateState = (newState: Record<string, any>) => {
    setMatch(prev => ({
      ...prev,
      gameState: {
        ...prev.gameState,
        ...newState
      }
    }));
  };

  const endMatch = (winnerId?: string, rankings?: string[], xp?: Record<string, number>) => {
    setMatch(prev => ({
      ...prev,
      winnerId,
      rankings,
      xpEarned: xp
    }));
    setLifecycleState("finished");
  };

  const setReady = (playerId: string, isReady: boolean) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isReady } : p));
  };

  return (
    <MatchContext.Provider value={{
      room,
      match,
      players,
      spectators,
      lifecycleState,
      settings,
      isSpectator,
      setRoom,
      setMatch,
      setPlayers,
      setSpectators,
      setLifecycleState,
      setSettings,
      sendAction,
      updateState,
      endMatch,
      setReady
    }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatchContext() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error("useMatchContext must be used within a MatchProvider");
  }
  return context;
}
