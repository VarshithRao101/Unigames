export type GameLifeCycleState = 
  | "waiting" 
  | "ready" 
  | "starting" 
  | "in_progress" 
  | "paused" 
  | "finished" 
  | "cancelled";

export interface DeveloperTeam {
  developerName: string;
  teamName: string;
  contributors: string[];
  version: string;
  releaseNotes: string[];
}

export interface GameMetadata {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail: string;
  category: "Strategy" | "Board Games" | "Arcade" | "Card Games" | "Puzzle Games" | "Educational Games" | "Multiplayer" | "Single Player" | "Testing";
  status: "released" | "beta" | "alpha" | "development" | "planning" | "coming_soon";
  version: string;
  minPlayers: number;
  maxPlayers: number;
  supportsRooms: boolean;
  supportsSpectators: boolean;
  rulesList: string[];
  developerTeam: DeveloperTeam;
}

export interface RoomData {
  code: string;
  name: string;
  isPrivate: boolean;
  region: string;
  friendsOnly: boolean;
  allowSpectators: boolean;
  autoStart: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isAI: boolean;
  color?: string;
  score?: number;
}

export interface Spectator {
  id: string;
  name: string;
  avatar: string;
}

export interface MatchData {
  matchId: string;
  gameState: Record<string, any>;
  currentTurn?: string;
  winnerId?: string;
  rankings?: string[]; // Player IDs in order of rank
  xpEarned?: Record<string, number>;
  history: Array<{
    playerId: string;
    action: string;
    timestamp: number;
  }>;
}

export interface GameRules {
  turnBased: boolean;
  realTime: boolean;
  teamBased: boolean;
  minPlayers: number;
  maxPlayers: number;
  rulesDescription: string[];
}

export interface SettingFieldConfig {
  id: string;
  name: string;
  type: "select" | "number" | "boolean" | "text";
  defaultValue: any;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
}

export interface GameSettings {
  configs: SettingFieldConfig[];
}

export interface GameComponentProps {
  room: RoomData;
  match: MatchData;
  players: Player[];
  spectators: Spectator[];
  lifecycleState: GameLifeCycleState;
  settings: Record<string, any>;
  isSpectator: boolean;
  sdk: {
    sendAction: (action: string, data?: Record<string, any>) => void;
    updateState: (newState: Record<string, any>) => void;
    endMatch: (winnerId?: string, rankings?: string[], xp?: Record<string, number>) => void;
    setReady: (playerId: string, isReady: boolean) => void;
  };
}
