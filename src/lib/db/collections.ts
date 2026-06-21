import { Collection, Db, ObjectId, Document } from "mongodb";
import clientPromise from "../mongodb";

// --- DATABASE TYPES ---

export interface UserSettings {
  notifications: boolean;
  privacy: "public" | "private" | "friends-only";
  appearance: "dark" | "light" | "system";
}

export interface UserDoc {
  _id?: ObjectId;
  email: string;
  name?: string;
  username: string; // fallback to slugified name or unique string
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  xp: number;
  level: number;
  settings?: UserSettings;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    winStreak: number;
    maxWinStreak: number;
    // Game-specific stats stored as dynamic key-value
    gameStats?: Record<string, {
      played: number;
      wins: number;
      losses: number;
      draws: number;
      highScore?: number;
    }>;
  };
  achievements: Array<{
    id: string;
    unlockedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchPlayer {
  userId: string;
  username: string;
  avatar?: string;
  score?: number;
  xpEarned?: number;
}

export interface MatchDoc {
  _id?: ObjectId;
  roomCode: string;
  gameSlug: string;
  players: MatchPlayer[];
  status: "active" | "completed" | "abandoned";
  winnerId?: string | null; // null for draw, or userId
  scores?: Record<string, number>; // userId -> score
  duration?: number; // in seconds
  createdAt: Date;
  completedAt?: Date;
}

export interface RoomPlayer {
  userId: string;
  username: string;
  avatar?: string;
  isHost: boolean;
  isReady: boolean;
}

export interface RoomDoc {
  _id?: ObjectId;
  code: string; // 6-digit uppercase code
  gameSlug: string;
  players: RoomPlayer[];
  maxPlayers: number;
  status: "waiting" | "playing";
  settings: {
    isPrivate: boolean;
    timeLimit?: number; // per turn/game in seconds
    [key: string]: any;
  };
  expiresAt: Date; // TTL index field (1 hour after room creation/update/match ends)
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageDoc {
  _id?: ObjectId;
  channel: string; // "global" or "room:{code}"
  sender: {
    userId: string;
    username: string;
    avatar?: string;
  };
  text: string;
  createdAt: Date; // TTL index field (expires after 24 hours)
}

export interface FriendshipDoc {
  _id?: ObjectId;
  requesterId: ObjectId;
  receiverId: ObjectId;
  status: "pending" | "accepted";
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDoc {
  _id?: ObjectId;
  userId: ObjectId;
  type: "friend_request" | "match_invite" | "match_result" | "achievement" | "system";
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: Date; // TTL index field (expires after 7 days)
}

export interface LeaderboardDoc {
  _id?: ObjectId;
  period: "weekly" | "all-time";
  gameSlug: string; // "global" for platform-wide XP, or specific game
  userId: ObjectId;
  username: string;
  avatar?: string;
  xp: number;
  rank: number;
  updatedAt: Date;
}

export interface AnalyticsEventDoc {
  _id?: ObjectId;
  eventName: string;
  category: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  userId?: ObjectId;
  createdAt: Date;
}

// --- DATABASE ACCESS HELPERS ---

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  // Use db name from connection string or default to 'uniplay'
  return client.db(process.env.MONGODB_DB_NAME || "uniplay");
}

export async function getCollection<T extends Document = any>(
  collectionName: string
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(collectionName);
}

// Named collection accessors
export const getUsersCollection = () => getCollection<UserDoc>("users");
export const getMatchesCollection = () => getCollection<MatchDoc>("matches");
export const getRoomsCollection = () => getCollection<RoomDoc>("rooms");
export const getChatCollection = () => getCollection<ChatMessageDoc>("chat_messages");
export const getFriendshipsCollection = () => getCollection<FriendshipDoc>("friendships");
export const getNotificationsCollection = () => getCollection<NotificationDoc>("notifications");
export const getLeaderboardsCollection = () => getCollection<LeaderboardDoc>("leaderboards");
export const getAnalyticsCollection = () => getCollection<AnalyticsEventDoc>("analytics_events");
