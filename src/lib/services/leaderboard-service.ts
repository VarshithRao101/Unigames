import { getLeaderboardsCollection, LeaderboardDoc } from "../db/collections";
import { ObjectId } from "mongodb";

/**
 * Increments leaderboard XP for a user.
 */
export async function updateLeaderboardXP(
  userId: string,
  username: string,
  avatar: string | undefined,
  gameSlug: string,
  xpDelta: number
): Promise<void> {
  try {
    const collection = await getLeaderboardsCollection();
    const userObjectId = new ObjectId(userId);

    const periods: Array<"weekly" | "all-time"> = ["weekly", "all-time"];
    
    // We update both the specific game leaderboard AND the platform-wide "global" leaderboard
    const scopes = [gameSlug, "global"];

    for (const period of periods) {
      for (const scope of scopes) {
        await collection.updateOne(
          {
            userId: userObjectId,
            gameSlug: scope,
            period,
          },
          {
            $set: {
              username,
              avatar,
              updatedAt: new Date(),
            },
            $inc: {
              xp: xpDelta,
            },
          },
          { upsert: true }
        );
      }
    }
  } catch (error) {
    console.error("Error in updateLeaderboardXP:", error);
  }
}

/**
 * Retrieves leaderboard list.
 */
export async function getLeaderboard(
  gameSlug: string,
  period: "weekly" | "all-time",
  limit = 20
): Promise<any[]> {
  try {
    const collection = await getLeaderboardsCollection();
    const { getUsersCollection } = await import("../db/collections");
    const usersColl = await getUsersCollection();

    // Query entries matching scope, sorted by XP descending
    const results = await collection
      .find({ gameSlug, period })
      .sort({ xp: -1 })
      .limit(limit)
      .toArray();

    // Extract userIds
    const userIds = results.map((r) => r.userId);
    const users = await usersColl.find({ _id: { $in: userIds } }).toArray();
    const userMap = new Map(users.map((u) => [u._id?.toString(), u]));

    // Assign rank dynamically based on array index and enrich with user stats
    return results.map((entry, index) => {
      const userDoc = userMap.get(entry.userId.toString());
      
      // Calculate favorite game
      let favoriteGame = "Tic-Tac-Toe";
      if (userDoc?.stats?.gameStats) {
        let maxPlayed = 0;
        for (const [slug, stats] of Object.entries(userDoc.stats.gameStats)) {
          if (stats.played > maxPlayed) {
            maxPlayed = stats.played;
            favoriteGame = slug === "tictactoe" ? "Tic-Tac-Toe" : slug;
          }
        }
      }

      const wins = gameSlug === "global"
        ? (userDoc?.stats?.wins || 0)
        : (userDoc?.stats?.gameStats?.[gameSlug]?.wins || 0);

      const streak = userDoc?.stats?.winStreak || 0;

      return {
        _id: entry._id,
        rank: index + 1,
        name: entry.username, // mapped to username for the UI
        avatar: entry.avatar || userDoc?.avatar,
        xp: entry.xp,
        wins,
        streak,
        favorite: favoriteGame,
        gameSlug: entry.gameSlug,
        period: entry.period,
        userId: entry.userId,
      };
    });
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
    return [];
  }
}

/**
 * Resets weekly leaderboards (run by cron or admin trigger).
 */
export async function resetWeeklyLeaderboards(): Promise<void> {
  try {
    const collection = await getLeaderboardsCollection();
    // Delete all weekly entries to reset for the next week
    await collection.deleteMany({ period: "weekly" });
    console.log("Weekly leaderboards reset successfully.");
  } catch (error) {
    console.error("Error resetting weekly leaderboards:", error);
  }
}
