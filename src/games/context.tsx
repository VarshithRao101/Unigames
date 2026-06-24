"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { RoomData, MatchData, Player, Spectator, GameLifeCycleState } from "./types";
import { getPusherClient } from "@/lib/pusher";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

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
  matchId,
  initialRoom,
  initialPlayers,
  initialGameState = {}
}: { 
  children: React.ReactNode;
  matchId: string;
  initialRoom: RoomData;
  initialPlayers: Player[];
  initialGameState?: Record<string, any>;
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [room, setRoom] = useState<RoomData>(initialRoom);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [spectators, setSpectators] = useState<Spectator[]>([]);
  const [lifecycleState, setLifecycleState] = useState<GameLifeCycleState>("in_progress");
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [match, setMatch] = useState<MatchData>({
    matchId,
    gameState: initialGameState,
    history: []
  });

  const isSpectator = user ? !players.some(p => p.id === user.id) : true;
  
  // Ref to prevent sending updates that we just received from Pusher
  const isApplyingRemoteUpdate = useRef(false);

  // Pusher real-time subscription
  useEffect(() => {
    if (!matchId || typeof window === "undefined") return;

    try {
      const pusher = getPusherClient();
      const channel = pusher.subscribe(`private-match-${matchId}`);

      // Listen for moves from other players
      channel.bind("game-move", (data: { senderId: string; action: string; data?: any; timestamp: number }) => {
        if (user && data.senderId === user.id) return; // Ignore our own broadcasted actions

        if (data.action === "update-state" && data.data) {
          isApplyingRemoteUpdate.current = true;
          setMatch((prev) => ({
            ...prev,
            gameState: {
              ...prev.gameState,
              ...data.data,
            },
          }));
          setTimeout(() => {
            isApplyingRemoteUpdate.current = false;
          }, 50);
        }

        // Add details to match history logs
        setMatch((prev) => ({
          ...prev,
          history: [
            ...prev.history,
            {
              playerId: data.senderId,
              action: `${data.action}: ${JSON.stringify(data.data || {})}`,
              timestamp: data.timestamp,
            },
          ],
        }));
      });

      // Listen for final results submission
      channel.bind("match-ended", (data: { matchId: string; winnerId: string | null; scores?: any; xpUpdates?: any }) => {
        setMatch((prev) => ({
          ...prev,
          winnerId: data.winnerId || undefined,
          scores: data.scores,
        }));
        setLifecycleState("finished");
        
        // Redirect to results screen
        router.replace(`/results/${matchId}`);
      });

      return () => {
        pusher.unsubscribe(`private-match-${matchId}`);
      };
    } catch (err) {
      console.error("Pusher connection error in MatchProvider:", err);
    }
  }, [matchId, user, router]);

  // Sends gameplay events to opponents via backend broadcast endpoint
  const sendAction = async (action: string, data?: Record<string, any>) => {
    // Optimistically update local logs
    setMatch((prev) => ({
      ...prev,
      history: [
        ...prev.history,
        {
          playerId: user?.id || "unknown",
          action: `${action}: ${JSON.stringify(data || {})}`,
          timestamp: Date.now(),
        },
      ],
    }));

    try {
      await fetch(`/api/matches/${matchId}/moves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
    } catch (err) {
      console.error("Failed to sync move action:", err);
    }
  };

  // Broadcasts game state updates to opponents
  const updateState = async (newState: Record<string, any>) => {
    // Optimistically update local game state
    setMatch((prev) => ({
      ...prev,
      gameState: {
        ...prev.gameState,
        ...newState,
      },
    }));

    // Avoid loops when applying incoming Pusher states
    if (isApplyingRemoteUpdate.current) return;

    try {
      await fetch(`/api/matches/${matchId}/moves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-state",
          data: newState,
        }),
      });
    } catch (err) {
      console.error("Failed to broadcast game state update:", err);
    }
  };

  // Submits final results to DB, triggers match-end callback, awards rewards
  const endMatch = async (winnerId?: string, rankings?: string[], xp?: Record<string, number>) => {
    try {
      await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId: winnerId || null,
          scores: xp || {}, // Send scores mapping if any
        }),
      });
    } catch (err) {
      console.error("Failed to finalize match results:", err);
    }
  };

  const setReady = (playerId: string, isReady: boolean) => {
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, isReady } : p)));
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
