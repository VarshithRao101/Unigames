import { Game } from "@/types/game";

export interface PlatformGame extends Game {
  shortCode: string;
  tone: "amber" | "cyan" | "rose" | "emerald";
  spotlight: string;
}

export type RoomStatus = "open" | "full" | "live";

export interface LobbyRoom {
  id: string;
  code: string;
  name: string;
  gameSlug: string;
  gameName: string;
  host: string;
  currentPlayers: number;
  maxPlayers: number;
  status: RoomStatus;
  isPrivate: boolean;
  passcode?: string;
  region: string;
  note: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  wins: number;
  streak: number;
  favorite: string;
}

export interface ChatMember {
  id: string;
  name: string;
  status: "online" | "match" | "away";
  activity: string;
}

export interface ChatSeedMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export const PLATFORM_METRICS = [
  { label: "Players online", value: "2.8k" },
  { label: "Open rooms", value: "126" },
  { label: "Matches today", value: "9.4k" },
  { label: "Top win streak", value: "18" },
];

export const PLATFORM_GAMES: PlatformGame[] = [
  {
    id: "g1",
    slug: "tictactoe",
    name: "Tic-Tac-Toe",
    shortCode: "XO",
    tone: "cyan",
    spotlight: "Fastest warm-up match",
    category: "Arcade",
    multiplayerType: "2 Players",
    status: "released",
    progressPercent: 100,
    developerName: "UniGames",
    tags: ["quick", "simple", "party"],
    description: "A fast room for quick wins, simple turns, and instant replay.",
    rules: [
      "Make a line of three to win.",
      "Players take turns one move at a time.",
      "A full board with no line ends in a draw.",
    ],
    features: ["Instant reset", "Spectator view", "Simple controls"],
    votes: 720,
  },
  {
    id: "g2",
    slug: "chess",
    name: "Chess Arena",
    shortCode: "♟",
    tone: "amber",
    spotlight: "Ultimate tactical duel",
    category: "Strategy",
    multiplayerType: "2 Players",
    status: "released",
    progressPercent: 100,
    developerName: "UniGames",
    tags: ["tactical", "classic", "strategy"],
    description: "Engage in the timeless clash of kings. Perfect your tactics in real-time or practice with NeuroBot.",
    rules: [
      "White moves first, players alternate turns.",
      "Move pieces legally according to standard chess rules.",
      "Checkmate the opponent king to win the game.",
      "Draws can occur via stalemate, insufficient material, three-fold repetition, or 50-move rule.",
    ],
    features: ["AI practice partner", "Real-time sync", "Spectator view"],
    votes: 940,
  },
  {
    id: "g3",
    slug: "ludo",
    name: "Ludo Arena",
    shortCode: "🎲",
    tone: "emerald",
    spotlight: "Classic 4-player board race",
    category: "Board Games",
    multiplayerType: "2-4 Players",
    status: "released",
    progressPercent: 100,
    developerName: "UniGames",
    tags: ["multiplayer", "classic", "party"],
    description: "Classic 4-player board race. Roll the 3D dice, release your tokens, capture opponents, and reach the center home first!",
    rules: [
      "Roll a 6 to release a token from HOME.",
      "Roll the 3D dice, click on a token to move it forward.",
      "Rolling a 6, cutting an opponent, or finishing a token grants a bonus roll.",
      "Star cells are Safe Zones where no cuts can occur.",
      "Two same-colored tokens on a space form a blockade."
    ],
    features: ["Strategic bot players", "3D animated dice", "Retro sound synth"],
    votes: 860,
  }
];

export const ROOMS_AVAILABLE: LobbyRoom[] = [];

export const LEADERBOARD_DATA: Record<"weekly" | "allTime", LeaderboardEntry[]> = {
  weekly: [
    { rank: 1, name: "Varshith", xp: 1840, wins: 18, streak: 6, favorite: "Tic-Tac-Toe" },
    { rank: 2, name: "Nova", xp: 1660, wins: 16, streak: 5, favorite: "Tic-Tac-Toe" },
    { rank: 3, name: "BoardKing", xp: 1410, wins: 14, streak: 4, favorite: "Tic-Tac-Toe" },
    { rank: 4, name: "Luna", xp: 1295, wins: 12, streak: 4, favorite: "Tic-Tac-Toe" },
    { rank: 5, name: "RookStar", xp: 1180, wins: 11, streak: 3, favorite: "Tic-Tac-Toe" },
    { rank: 6, name: "PixelFox", xp: 1040, wins: 9, streak: 2, favorite: "Tic-Tac-Toe" },
    { rank: 7, name: "Zephyr", xp: 960, wins: 8, streak: 1, favorite: "Tic-Tac-Toe" },
  ],
  allTime: [
    { rank: 1, name: "Garry", xp: 12640, wins: 126, streak: 14, favorite: "Tic-Tac-Toe" },
    { rank: 2, name: "Varshith", xp: 9880, wins: 95, streak: 9, favorite: "Tic-Tac-Toe" },
    { rank: 3, name: "BoardKing", xp: 9320, wins: 88, streak: 8, favorite: "Tic-Tac-Toe" },
    { rank: 4, name: "Luna", xp: 8615, wins: 81, streak: 6, favorite: "Tic-Tac-Toe" },
    { rank: 5, name: "Nova", xp: 8040, wins: 78, streak: 5, favorite: "Tic-Tac-Toe" },
    { rank: 6, name: "PixelFox", xp: 7420, wins: 71, streak: 4, favorite: "Tic-Tac-Toe" },
    { rank: 7, name: "RookStar", xp: 6880, wins: 65, streak: 3, favorite: "Tic-Tac-Toe" },
    { rank: 8, name: "Zephyr", xp: 6210, wins: 58, streak: 2, favorite: "Tic-Tac-Toe" },
  ],
};

// Per-game individual leaderboards
export const GAME_LEADERBOARDS: Record<string, Record<"weekly" | "allTime", LeaderboardEntry[]>> = {
  tictactoe: {
    weekly: [
      { rank: 1, name: "Varshith", xp: 1120, wins: 14, streak: 6, favorite: "Tic-Tac-Toe" },
      { rank: 2, name: "BoardKing", xp: 980, wins: 12, streak: 4, favorite: "Tic-Tac-Toe" },
      { rank: 3, name: "PixelFox", xp: 840, wins: 10, streak: 3, favorite: "Tic-Tac-Toe" },
      { rank: 4, name: "Zephyr", xp: 700, wins: 8, streak: 2, favorite: "Tic-Tac-Toe" },
      { rank: 5, name: "CipherX", xp: 580, wins: 6, streak: 1, favorite: "Tic-Tac-Toe" },
      { rank: 6, name: "Spark", xp: 460, wins: 5, streak: 1, favorite: "Tic-Tac-Toe" },
    ],
    allTime: [
      { rank: 1, name: "Varshith", xp: 8240, wins: 82, streak: 9, favorite: "Tic-Tac-Toe" },
      { rank: 2, name: "BoardKing", xp: 7680, wins: 76, streak: 8, favorite: "Tic-Tac-Toe" },
      { rank: 3, name: "PixelFox", xp: 6420, wins: 63, streak: 6, favorite: "Tic-Tac-Toe" },
      { rank: 4, name: "Zephyr", xp: 5840, wins: 57, streak: 4, favorite: "Tic-Tac-Toe" },
      { rank: 5, name: "CipherX", xp: 5120, wins: 50, streak: 3, favorite: "Tic-Tac-Toe" },
      { rank: 6, name: "Spark", xp: 4380, wins: 43, streak: 2, favorite: "Tic-Tac-Toe" },
      { rank: 7, name: "NightOwl", xp: 3740, wins: 36, streak: 2, favorite: "Tic-Tac-Toe" },
    ],
  },
};

export const ONLINE_SQUAD: ChatMember[] = [];

export const GLOBAL_CHAT_SEED: ChatSeedMessage[] = [];

export function getGameBySlug(slug: string) {
  return PLATFORM_GAMES.find((game) => game.slug === slug);
}

export function getRoomByCode(code: string) {
  return ROOMS_AVAILABLE.find((room) => room.code === code.toUpperCase());
}
