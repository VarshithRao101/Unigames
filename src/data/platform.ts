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
    shortCode: "CHS",
    tone: "amber",
    spotlight: "Tactical warfare on 64 squares",
    category: "Strategy",
    multiplayerType: "2 Players",
    status: "beta",
    progressPercent: 95,
    developerName: "UniGames",
    tags: ["deep strategy", "ranked", "classic"],
    description: "Tactical warfare on a 64-square battlefield. Synchronize moves in real-time.",
    rules: [
      "Take your opponent's king to checkmate.",
      "Players take turns moving one piece at a time.",
      "Follow standard chess rules and timed match options.",
    ],
    features: ["Elo ratings", "Move history", "Timed matches"],
    votes: 450,
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
    { rank: 2, name: "Nova", xp: 1660, wins: 16, streak: 5, favorite: "Chess Arena" },
    { rank: 3, name: "BoardKing", xp: 1410, wins: 14, streak: 4, favorite: "Tic-Tac-Toe" },
    { rank: 4, name: "Luna", xp: 1295, wins: 12, streak: 4, favorite: "Chess Arena" },
    { rank: 5, name: "RookStar", xp: 1180, wins: 11, streak: 3, favorite: "Chess Arena" },
    { rank: 6, name: "PixelFox", xp: 1040, wins: 9, streak: 2, favorite: "Tic-Tac-Toe" },
    { rank: 7, name: "Zephyr", xp: 960, wins: 8, streak: 1, favorite: "Tic-Tac-Toe" },
  ],
  allTime: [
    { rank: 1, name: "Garry", xp: 12640, wins: 126, streak: 14, favorite: "Chess Arena" },
    { rank: 2, name: "Varshith", xp: 9880, wins: 95, streak: 9, favorite: "Tic-Tac-Toe" },
    { rank: 3, name: "BoardKing", xp: 9320, wins: 88, streak: 8, favorite: "Tic-Tac-Toe" },
    { rank: 4, name: "Luna", xp: 8615, wins: 81, streak: 6, favorite: "Chess Arena" },
    { rank: 5, name: "Nova", xp: 8040, wins: 78, streak: 5, favorite: "Chess Arena" },
    { rank: 6, name: "PixelFox", xp: 7420, wins: 71, streak: 4, favorite: "Tic-Tac-Toe" },
    { rank: 7, name: "RookStar", xp: 6880, wins: 65, streak: 3, favorite: "Chess Arena" },
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
  chess: {
    weekly: [
      { rank: 1, name: "Garry", xp: 1340, wins: 11, streak: 7, favorite: "Chess Arena" },
      { rank: 2, name: "Nova", xp: 1160, wins: 9, streak: 5, favorite: "Chess Arena" },
      { rank: 3, name: "RookStar", xp: 980, wins: 8, streak: 4, favorite: "Chess Arena" },
      { rank: 4, name: "Luna", xp: 820, wins: 6, streak: 3, favorite: "Chess Arena" },
      { rank: 5, name: "IronBishop", xp: 660, wins: 5, streak: 2, favorite: "Chess Arena" },
      { rank: 6, name: "Tempest", xp: 500, wins: 4, streak: 1, favorite: "Chess Arena" },
    ],
    allTime: [
      { rank: 1, name: "Garry", xp: 11200, wins: 112, streak: 14, favorite: "Chess Arena" },
      { rank: 2, name: "Nova", xp: 9100, wins: 91, streak: 9, favorite: "Chess Arena" },
      { rank: 3, name: "RookStar", xp: 7840, wins: 78, streak: 7, favorite: "Chess Arena" },
      { rank: 4, name: "Luna", xp: 6920, wins: 68, streak: 6, favorite: "Chess Arena" },
      { rank: 5, name: "IronBishop", xp: 5840, wins: 57, streak: 4, favorite: "Chess Arena" },
      { rank: 6, name: "Tempest", xp: 4960, wins: 48, streak: 3, favorite: "Chess Arena" },
      { rank: 7, name: "Castler", xp: 4100, wins: 40, streak: 2, favorite: "Chess Arena" },
    ],
  },
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
