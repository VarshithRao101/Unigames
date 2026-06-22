import { z } from "zod";

// --- USER & PROFILE VALIDATION ---

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores")
    .optional(),
  bio: z.string().max(200, "Bio must be at most 200 characters").optional(),
  avatar: z.string().max(10000, "Avatar too long").optional(),
  settings: z
    .object({
      notifications: z.boolean().optional(),
      privacy: z.enum(["public", "private", "friends-only"]).optional(),
      appearance: z.enum(["dark", "light", "system"]).optional(),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// --- ROOM VALIDATION ---

export const createRoomSchema = z.object({
  gameSlug: z.string().min(1, "Game slug is required"),
  maxPlayers: z.number().int().min(2).max(10).default(4),
  settings: z.object({
    isPrivate: z.boolean().default(false),
    timeLimit: z.number().int().positive().optional(),
  }).default({
    isPrivate: false,
  }),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

// --- CHAT MESSAGE VALIDATION ---

export const sendMessageSchema = z.object({
  channel: z.string().min(1, "Channel is required"),
  text: z
    .string()
    .min(1, "Message cannot be empty")
    .max(500, "Message cannot exceed 500 characters")
    .transform((str) => str.trim()),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// --- FRIENDSHIP VALIDATION ---

export const friendRequestSchema = z.object({
  receiverUsername: z.string().min(1, "Receiver username is required"),
});

export type FriendRequestInput = z.infer<typeof friendRequestSchema>;

// --- MATCH VALIDATION ---

export const endMatchSchema = z.object({
  winnerId: z.string().nullable(),
  scores: z.record(z.string(), z.number().int().nonnegative()).optional(),
  duration: z.number().int().nonnegative().optional(),
});

export type EndMatchInput = z.infer<typeof endMatchSchema>;
