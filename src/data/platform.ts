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
];

export const ROOMS_AVAILABLE: LobbyRoom[] = [
  {
    id: "room-1",
    code: "TIC442",
    name: "Quick Warmup",
    gameSlug: "tictactoe",
    gameName: "Tic-Tac-Toe",
    host: "Nova",
    currentPlayers: 2,
    maxPlayers: 2,
    status: "live",
    isPrivate: false,
    region: "Singapore",
    note: "Fast rematches and short rounds.",
  },
  {
    id: "room-2",
    code: "TIC881",
    name: "Friends Match",
    gameSlug: "tictactoe",
    gameName: "Tic-Tac-Toe",
    host: "Varshith",
    currentPlayers: 1,
    maxPlayers: 2,
    status: "open",
    isPrivate: false,
    region: "Mumbai",
    note: "Open slot — join for a quick round.",
  },
  {
    id: "room-3",
    code: "TIC339",
    name: "Private Duel",
    gameSlug: "tictactoe",
    gameName: "Tic-Tac-Toe",
    host: "BoardKing",
    currentPlayers: 1,
    maxPlayers: 2,
    status: "open",
    isPrivate: true,
    passcode: "1234",
    region: "Mumbai",
    note: "Private room. Use passcode 1234 for the demo preview.",
  },
];

export const LEADERBOARD_DATA: Record<"weekly" | "allTime", LeaderboardEntry[]> = {
  weekly: [
    { rank: 1, name: "Varshith", xp: 1840, wins: 18, streak: 6, favorite: "Tic-Tac-Toe" },
    { rank: 2, name: "Nova", xp: 1660, wins: 16, streak: 5, favorite: "Tic-Tac-Toe" },
    { rank: 3, name: "BoardKing", xp: 1410, wins: 14, streak: 4, favorite: "Tic-Tac-Toe" },
    { rank: 4, name: "Luna", xp: 1295, wins: 12, streak: 4, favorite: "Tic-Tac-Toe" },
    { rank: 5, name: "RookStar", xp: 1180, wins: 11, streak: 3, favorite: "Tic-Tac-Toe" },
  ],
  allTime: [
    { rank: 1, name: "Garry", xp: 12640, wins: 126, streak: 14, favorite: "Tic-Tac-Toe" },
    { rank: 2, name: "Varshith", xp: 9880, wins: 95, streak: 9, favorite: "Tic-Tac-Toe" },
    { rank: 3, name: "BoardKing", xp: 9320, wins: 88, streak: 8, favorite: "Tic-Tac-Toe" },
    { rank: 4, name: "Luna", xp: 8615, wins: 81, streak: 6, favorite: "Tic-Tac-Toe" },
    { rank: 5, name: "Nova", xp: 8040, wins: 78, streak: 5, favorite: "Tic-Tac-Toe" },
    { rank: 6, name: "PixelFox", xp: 7420, wins: 71, streak: 4, favorite: "Tic-Tac-Toe" },
  ],
};

export const ONLINE_SQUAD: ChatMember[] = [
  { id: "s1", name: "Varshith", status: "online", activity: "Waiting in Tic-Tac-Toe" },
  { id: "s2", name: "Nova", status: "match", activity: "Finishing a Tic-Tac-Toe round" },
  { id: "s3", name: "BoardKing", status: "online", activity: "Looking for a Tic-Tac-Toe match" },
  { id: "s4", name: "Luna", status: "away", activity: "Back in 5 min" },
];

export const GLOBAL_CHAT_SEED: ChatSeedMessage[] = [
  { id: "m1", sender: "System", text: "Welcome to the main lobby chat.", time: "19:40" },
  { id: "m2", sender: "Nova", text: "Anyone up for a quick Tic-Tac-Toe match?", time: "19:42" },
  { id: "m3", sender: "BoardKing", text: "TIC881 room has one free slot!", time: "19:44" },
];

export function getGameBySlug(slug: string) {
  return PLATFORM_GAMES.find((game) => game.slug === slug);
}

export function getRoomByCode(code: string) {
  return ROOMS_AVAILABLE.find((room) => room.code === code.toUpperCase());
}
