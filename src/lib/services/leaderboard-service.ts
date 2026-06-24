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
    const { getUsersCollection, getMatchesCollection } = await import("../db/collections");
    const usersColl = await getUsersCollection();
    const matchesColl = await getMatchesCollection();

    if (period === "all-time") {
      if (gameSlug === "global") {
        // Query overall all-time rankings directly from the users collection
        const users = await usersColl
          .find({})
          .sort({ xp: -1 })
          .limit(limit)
          .toArray();

        return users.map((userDoc, index) => {
          let favoriteGame = "Tic-Tac-Toe";
          if (userDoc.stats?.gameStats) {
            let maxPlayed = 0;
            for (const [slug, stats] of Object.entries(userDoc.stats.gameStats)) {
              if ((stats as any).played > maxPlayed) {
                maxPlayed = (stats as any).played;
                favoriteGame = slug === "tictactoe" ? "Tic-Tac-Toe" : slug;
              }
            }
          }

          return {
            _id: userDoc._id,
            rank: index + 1,
            name: userDoc.username,
            avatar: userDoc.avatar || "/avatars/avatar-placeholder.png",
            xp: userDoc.xp || 0,
            wins: userDoc.stats?.wins || 0,
            streak: userDoc.stats?.winStreak || 0,
            favorite: favoriteGame,
            gameSlug,
            period,
            userId: userDoc._id,
          };
        });
      } else {
        // Game-specific all-time:
        // Find users where stats.gameStats[gameSlug] exists, compute game-specific XP in-memory, and sort
        const users = await usersColl
          .find({ [`stats.gameStats.${gameSlug}`]: { $exists: true } })
          .toArray();

        const list = users.map((userDoc) => {
          const stats = userDoc.stats?.gameStats?.[gameSlug] || { wins: 0, losses: 0, draws: 0, played: 0 };
          const computedXP = (stats.wins * 100) + (stats.draws * 40) + (stats.losses * 20);
          
          let favoriteGame = "Tic-Tac-Toe";
          if (userDoc.stats?.gameStats) {
            let maxPlayed = 0;
            for (const [slug, s] of Object.entries(userDoc.stats.gameStats)) {
              if ((s as any).played > maxPlayed) {
                maxPlayed = (s as any).played;
                favoriteGame = slug === "tictactoe" ? "Tic-Tac-Toe" : slug;
              }
            }
          }

          return {
            _id: userDoc._id,
            name: userDoc.username,
            avatar: userDoc.avatar || "/avatars/avatar-placeholder.png",
            xp: computedXP,
            wins: stats.wins || 0,
            streak: userDoc.stats?.winStreak || 0,
            favorite: favoriteGame,
            gameSlug,
            period,
            userId: userDoc._id,
          };
        });

        // Sort by XP descending, then wins descending
        list.sort((a, b) => b.xp - a.xp || b.wins - a.wins);

        // Assign ranks after sorting
        return list.slice(0, limit).map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
      }
    } else {
      // period === "weekly" (aggregated dynamically from the matches collection in the last 7 days)
      const pastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const queryMatch: any = {
        status: "completed",
        completedAt: { $gte: pastWeek }
      };
      
      if (gameSlug !== "global") {
        queryMatch.gameSlug = gameSlug;
      }

      const weeklyAgg = await matchesColl.aggregate([
        {
          $match: queryMatch
        },
        {
          $unwind: "$players"
        },
        {
          $group: {
            _id: "$players.userId",
            weeklyXP: { $sum: "$players.xpEarned" }
          }
        },
        {
          $sort: { weeklyXP: -1 }
        },
        {
          $limit: limit
        }
      ]).toArray();

      if (weeklyAgg.length === 0) {
        return [];
      }

      const userObjectIds = weeklyAgg.map(item => {
        try {
          return new ObjectId(item._id);
        } catch {
          return item._id;
        }
      });

      const users = await usersColl.find({ _id: { $in: userObjectIds } }).toArray();
      const userMap = new Map(users.map(u => [u._id?.toString() || "", u]));

      return weeklyAgg.map((item, index) => {
        const userIdStr = item._id.toString();
        const userDoc = userMap.get(userIdStr);
        
        let favoriteGame = "Tic-Tac-Toe";
        if (userDoc?.stats?.gameStats) {
          let maxPlayed = 0;
          for (const [slug, stats] of Object.entries(userDoc.stats.gameStats)) {
            if ((stats as any).played > maxPlayed) {
              maxPlayed = (stats as any).played;
              favoriteGame = slug === "tictactoe" ? "Tic-Tac-Toe" : slug;
            }
          }
        }

        const wins = gameSlug === "global"
          ? (userDoc?.stats?.wins || 0)
          : (userDoc?.stats?.gameStats?.[gameSlug]?.wins || 0);

        const streak = userDoc?.stats?.winStreak || 0;

        return {
          _id: userDoc?._id || new ObjectId(),
          rank: index + 1,
          name: userDoc?.username || "Unknown",
          avatar: userDoc?.avatar || "/avatars/avatar-placeholder.png",
          xp: item.weeklyXP,
          wins,
          streak,
          favorite: favoriteGame,
          gameSlug,
          period,
          userId: userDoc?._id || item._id,
        };
      });
    }
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
