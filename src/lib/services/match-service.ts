import { getMatchesCollection, getRoomsCollection, MatchDoc, MatchPlayer } from "../db/collections";
import { recordMatchResult } from "./user-service";
import { updateLeaderboardXP } from "./leaderboard-service";
import { ObjectId } from "mongodb";

export async function getMatchById(id: string): Promise<MatchDoc | null> {
  try {
    const collection = await getMatchesCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error in getMatchById:", error);
    return null;
  }
}

/**
 * Creates an active match record from a lobby room code.
 */
export async function createMatch(
  roomCode: string,
  hostId: string
): Promise<MatchDoc | null> {
  try {
    const roomsCollection = await getRoomsCollection();
    const matchesCollection = await getMatchesCollection();

    const room = await roomsCollection.findOne({ code: roomCode.toUpperCase() });
    if (!room) {
      console.error("Room not found during match creation");
      return null;
    }

    // Validate requester is the host
    const hostPlayer = room.players.find((p) => p.isHost);
    if (!hostPlayer || hostPlayer.userId !== hostId) {
      console.error("Only the room host can initiate a match");
      return null;
    }

    // Ensure all players are ready
    const allReady = room.players.every((p) => p.isReady);
    if (!allReady) {
      console.error("Cannot start match: Not all players are ready");
      return null;
    }

    // Map RoomPlayer[] to MatchPlayer[]
    const players: MatchPlayer[] = room.players.map((p) => ({
      userId: p.userId,
      username: p.username,
      avatar: p.avatar,
    }));

    const newMatch: MatchDoc = {
      roomCode: room.code,
      gameSlug: room.gameSlug,
      players,
      status: "active",
      createdAt: new Date(),
    };

    const insertResult = await matchesCollection.insertOne(newMatch);
    
    // Update room status to "playing" to hide it from lobby directory listings
    await roomsCollection.updateOne(
      { code: room.code },
      { $set: { status: "playing", updatedAt: new Date() } }
    );

    return {
      ...newMatch,
      _id: insertResult.insertedId,
    };
  } catch (error) {
    console.error("Error in createMatch:", error);
    return null;
  }
}

/**
 * Ends a match, calculates score/XP, updates player profiles, and resets room lobby.
 */
export async function endMatch(
  matchId: string,
  winnerId: string | null, // null for draw/tie
  scores?: Record<string, number>, // userId -> score
  duration?: number // in seconds
): Promise<{ success: boolean; match?: MatchDoc; xpUpdates?: Record<string, { xpEarned: number; newLevel: number; leveledUp: boolean }> }> {
  try {
    const matchesCollection = await getMatchesCollection();
    const roomsCollection = await getRoomsCollection();

    const match = await matchesCollection.findOne({ _id: new ObjectId(matchId) });
    if (!match || match.status !== "active") {
      return { success: false };
    }

    const xpUpdates: Record<string, { xpEarned: number; newLevel: number; leveledUp: boolean }> = {};
    const updatedPlayers = await Promise.all(
      match.players.map(async (player) => {
        let result: "win" | "loss" | "draw" = "loss";
        
        if (winnerId === null) {
          result = "draw";
        } else if (player.userId === winnerId) {
          result = "win";
        }

        const score = scores ? scores[player.userId] : undefined;
        
        // Record match stats and calculate XP rewards
        const xpUpdate = await recordMatchResult(player.userId, result, match.gameSlug, score);
        
        xpUpdates[player.userId] = xpUpdate;

        // Record XP to leaderboards
        await updateLeaderboardXP(
          player.userId,
          player.username,
          player.avatar,
          match.gameSlug,
          xpUpdate.xpEarned
        );

        return {
          ...player,
          score,
          xpEarned: xpUpdate.xpEarned,
        };
      })
    );

    // Save final match results to database
    const completedTime = new Date();
    await matchesCollection.updateOne(
      { _id: new ObjectId(matchId) },
      {
        $set: {
          players: updatedPlayers,
          status: "completed",
          winnerId,
          scores,
          duration,
          completedAt: completedTime,
        },
      }
    );

    // Reset room state so players can play again
    const room = await roomsCollection.findOne({ code: match.roomCode });
    if (room) {
      const resetPlayers = room.players.map((p) => ({
        ...p,
        // Keep host ready, reset others to not ready
        isReady: p.isHost,
      }));

      const updatedTime = new Date();
      await roomsCollection.updateOne(
        { code: match.roomCode },
        {
          $set: {
            status: "waiting",
            players: resetPlayers,
            updatedAt: updatedTime,
            expiresAt: new Date(updatedTime.getTime() + 60 * 60 * 1000), // Reset 1h expiry timer
          },
        }
      );
    }

    const updatedMatch = await matchesCollection.findOne({ _id: new ObjectId(matchId) });

    return {
      success: true,
      match: updatedMatch || undefined,
      xpUpdates,
    };
  } catch (error) {
    console.error("Error in endMatch:", error);
    return { success: false };
  }
}
