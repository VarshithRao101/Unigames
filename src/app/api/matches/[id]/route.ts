import { auth } from "@/auth";
import { getMatchById, endMatch } from "@/lib/services/match-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { getPusherServer } from "@/lib/pusher";
import { NextRequest } from "next/server";
import { z } from "zod";

const endMatchSchema = z.object({
  winnerId: z.string().nullable(), // null for draw
  scores: z.record(z.string(), z.number()).optional(),
  duration: z.number().int().positive().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return apiErrors.badRequest("Match ID is required");
  }

  try {
    const match = await getMatchById(id);
    if (!match) {
      return apiErrors.notFound("Match not found");
    }

    return apiSuccess(match);
  } catch (error) {
    console.error(`Error in GET /api/matches/${id}:`, error);
    return apiErrors.serverError("Failed to retrieve match details", error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  if (!id) {
    return apiErrors.badRequest("Match ID is required");
  }

  try {
    const match = await getMatchById(id);
    if (!match) {
      return apiErrors.notFound("Match not found");
    }

    if (match.status !== "active") {
      return apiErrors.badRequest("Match has already been finalized");
    }

    const userId = session.user.id;
    const isParticipant = match.players.some((p) => p.userId === userId);
    const isAdmin = (session.user as any).role === "admin";

    if (!isParticipant && !isAdmin) {
      return apiErrors.forbidden("You are not authorized to submit results for this match");
    }

    const body = await req.json();
    const validation = endMatchSchema.safeParse(body);

    if (!validation.success) {
      return apiErrors.badRequest("Invalid end match data schema", validation.error.flatten());
    }

    const { winnerId, scores, duration } = validation.data;
    const result = await endMatch(id, winnerId, scores, duration);

    if (!result.success || !result.match) {
      return apiErrors.badRequest("Failed to submit match results");
    }

    // Broadcast match end to players in-game
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-match-${id}`, "match-ended", {
        matchId: id,
        winnerId,
        scores,
        xpUpdates: result.xpUpdates,
      });

      // Broadcast room deletion to lobbies list in real-time
      if (match.roomCode) {
        await pusher.trigger("rooms-list", "room-deleted", {
          code: match.roomCode,
        });
      }
    } catch (pushErr) {
      console.warn("Pusher match-end/rooms-list broadcast warning:", pushErr);
    }

    return apiSuccess(result.match, "Match results finalized successfully");
  } catch (error) {
    console.error(`Error in PATCH /api/matches/${id}:`, error);
    return apiErrors.serverError("Failed to finalize match results", error);
  }
}
