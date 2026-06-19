"use client";

import { useMatchContext } from "./context";
import { Player, Spectator, RoomData, MatchData } from "./types";

export interface UnigamesSDK {
  room: RoomData;
  match: MatchData;
  players: Player[];
  spectators: Spectator[];
  isSpectator: boolean;
  localPlayer: Player | undefined;
  gameState: Record<string, any>;
  submitMove: (actionType: string, payload?: Record<string, any>) => void;
  updateState: (newState: Record<string, any>) => void;
  declareWinner: (winnerId: string, rankings?: string[], xp?: Record<string, number>) => void;
  setReady: (isReady: boolean) => void;
}

export function useUnigamesSDK(): UnigamesSDK {
  const context = useMatchContext();

  const localPlayer = context.players.find(p => p.id === "p1");

  return {
    room: context.room,
    match: context.match,
    players: context.players,
    spectators: context.spectators,
    isSpectator: context.isSpectator,
    localPlayer,
    gameState: context.match.gameState,
    submitMove: (actionType, payload) => {
      context.sendAction(actionType, payload);
    },
    updateState: (newState) => {
      context.updateState(newState);
    },
    declareWinner: (winnerId, rankings, xp) => {
      context.endMatch(winnerId, rankings, xp);
    },
    setReady: (isReady) => {
      context.setReady("p1", isReady);
    }
  };
}
