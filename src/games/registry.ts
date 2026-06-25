import React from "react";
import { GameMetadata, GameRules, GameSettings } from "./types";
import { TICTACTOE_META, TICTACTOE_RULES, TICTACTOE_SETTINGS } from "./tictactoe/meta";
import TicTacToeGame from "./tictactoe/component";
import { TEST_ARENA_META, TEST_ARENA_RULES, TEST_ARENA_SETTINGS } from "./test-arena/meta";
import TestArenaGame from "./test-arena/component";
import { CHESS_META, CHESS_RULES, CHESS_SETTINGS } from "./chess/meta";
import ChessGame from "./chess/component";

export interface RegistryEntry {
  metadata: GameMetadata;
  component: React.ComponentType<any>;
  rules: GameRules;
  settings: GameSettings;
}

export const GAMES_REGISTRY: Record<string, RegistryEntry> = {
  "test-arena": {
    metadata: TEST_ARENA_META,
    component: TestArenaGame,
    rules: TEST_ARENA_RULES,
    settings: TEST_ARENA_SETTINGS
  },
  tictactoe: {
    metadata: TICTACTOE_META,
    component: TicTacToeGame,
    rules: TICTACTOE_RULES,
    settings: TICTACTOE_SETTINGS
  },
  chess: {
    metadata: CHESS_META,
    component: ChessGame,
    rules: CHESS_RULES,
    settings: CHESS_SETTINGS
  },
};

export function getGameRegistryEntry(gameIdOrSlug: string): RegistryEntry | undefined {
  if (GAMES_REGISTRY[gameIdOrSlug]) return GAMES_REGISTRY[gameIdOrSlug];
  return Object.values(GAMES_REGISTRY).find(
    (g) => g.metadata.id === gameIdOrSlug || g.metadata.slug === gameIdOrSlug
  );
}

export function getAllRegisteredGames(): GameMetadata[] {
  return Object.values(GAMES_REGISTRY).map((entry) => entry.metadata);
}
