import { ObjectId } from "mongodb";
import { getUsersCollection, UserDoc } from "../db/collections";
import { UpdateProfileInput } from "../utils/validation";

/**
 * Calculates user level based on accumulated XP.
 * Win = +100 XP, Loss = +20 XP, Draw = +40 XP
 * Every level takes 500 XP.
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 500) + 1;
}

export async function getUserById(id: string): Promise<UserDoc | null> {
  try {
    const collection = await getUsersCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<UserDoc | null> {
  try {
    const collection = await getUsersCollection();
    return await collection.findOne({ email });
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<UserDoc | null> {
  try {
    const collection = await getUsersCollection();
    return await collection.findOne({ username });
  } catch (error) {
    console.error("Error in getUserByUsername:", error);
    return null;
  }
}

export async function updateProfile(
  id: string,
  data: UpdateProfileInput
): Promise<boolean> {
  try {
    const collection = await getUsersCollection();
    const updatePayload: any = {
      updatedAt: new Date(),
    };

    // Flatten direct fields
    if (data.username !== undefined) updatePayload.username = data.username;
    if (data.bio !== undefined) updatePayload.bio = data.bio;
    if (data.avatar !== undefined) {
      updatePayload.avatar = data.avatar;
      updatePayload.image = data.avatar; // Keep NextAuth default image field in sync
    }

    // Flatten nested settings fields to avoid replacing the whole object
    if (data.settings) {
      if (data.settings.notifications !== undefined) {
        updatePayload["settings.notifications"] = data.settings.notifications;
      }
      if (data.settings.privacy !== undefined) {
        updatePayload["settings.privacy"] = data.settings.privacy;
      }
      if (data.settings.appearance !== undefined) {
        updatePayload["settings.appearance"] = data.settings.appearance;
      }
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatePayload }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return false;
  }
}

/**
 * Adds XP to a user and handles level calculation.
 */
export async function addXP(
  id: string,
  amount: number
): Promise<{ success: boolean; newXP: number; newLevel: number; leveledUp: boolean }> {
  try {
    const collection = await getUsersCollection();
    const user = await collection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return { success: false, newXP: 0, newLevel: 1, leveledUp: false };
    }

    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const targetXP = currentXP + amount;
    const targetLevel = calculateLevel(targetXP);

    const leveledUp = targetLevel > currentLevel;

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          xp: targetXP,
          level: targetLevel,
          updatedAt: new Date(),
        },
      }
    );

    return {
      success: true,
      newXP: targetXP,
      newLevel: targetLevel,
      leveledUp,
    };
  } catch (error) {
    console.error("Error in addXP:", error);
    return { success: false, newXP: 0, newLevel: 1, leveledUp: false };
  }
}

/**
 * Updates stats, streaks, and adds matchmaking-derived XP rewards.
 */
export async function recordMatchResult(
  userId: string,
  result: "win" | "loss" | "draw",
  gameSlug: string,
  score?: number
): Promise<{ xpEarned: number; newLevel: number; leveledUp: boolean }> {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return { xpEarned: 0, newLevel: 1, leveledUp: false };
  }

  // Calculate XP reward
  let baseXP = 20; // loss base
  if (result === "win") baseXP = 100;
  if (result === "draw") baseXP = 40;

  // Streak bonus (10 * current win streak, max 50)
  const currentStreak = user.stats?.winStreak || 0;
  const streakBonus = result === "win" ? Math.min(50, 10 * currentStreak) : 0;
  const xpEarned = baseXP + streakBonus;

  // Compute new streaks
  const newStreak = result === "win" ? currentStreak + 1 : result === "draw" ? currentStreak : 0;
  const maxStreak = Math.max(user.stats?.maxWinStreak || 0, newStreak);

  // Compute game specific stats
  const gameStats = user.stats?.gameStats || {};
  const currentGameStats = gameStats[gameSlug] || { played: 0, wins: 0, losses: 0, draws: 0 };
  
  const updatedGameStats = {
    played: currentGameStats.played + 1,
    wins: currentGameStats.wins + (result === "win" ? 1 : 0),
    losses: currentGameStats.losses + (result === "loss" ? 1 : 0),
    draws: currentGameStats.draws + (result === "draw" ? 1 : 0),
    highScore: score !== undefined ? Math.max(currentGameStats.highScore || 0, score) : currentGameStats.highScore,
  };

  const updatedStats = {
    gamesPlayed: (user.stats?.gamesPlayed || 0) + 1,
    wins: (user.stats?.wins || 0) + (result === "win" ? 1 : 0),
    losses: (user.stats?.losses || 0) + (result === "loss" ? 1 : 0),
    draws: (user.stats?.draws || 0) + (result === "draw" ? 1 : 0),
    winStreak: newStreak,
    maxWinStreak: maxStreak,
    gameStats: {
      ...gameStats,
      [gameSlug]: updatedGameStats,
    },
  };

  // Add the earned XP
  const targetXP = (user.xp || 0) + xpEarned;
  const targetLevel = calculateLevel(targetXP);
  const leveledUp = targetLevel > (user.level || 1);

  await collection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        stats: updatedStats,
        xp: targetXP,
        level: targetLevel,
        updatedAt: new Date(),
      },
    }
  );

  return {
    xpEarned,
    newLevel: targetLevel,
    leveledUp,
  };
}
