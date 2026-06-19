export type GameStatus = "released" | "beta" | "alpha" | "development" | "planning" | "coming_soon";

export interface Game {
  id: string;
  slug: string;
  name: string;
  category: "Strategy" | "Board Games" | "Arcade" | "Card Games" | "Puzzle Games" | "Educational Games" | "Multiplayer" | "Single Player" | "Testing";
  multiplayerType: string;
  status: GameStatus;
  progressPercent: number;
  releaseWindow?: string;
  developerName: string;
  tags: string[];
  description: string;
  rules: string[];
  features?: string[];
  votes?: number;
}
