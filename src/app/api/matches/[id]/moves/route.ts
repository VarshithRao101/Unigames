import { auth } from "@/auth";
import { getMatchById } from "@/lib/services/match-service";
import { getPusherServer } from "@/lib/pusher";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

export async function POST(
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
    if (!match || match.status !== "active") {
      return apiErrors.notFound("Active match not found");
    }

    const userId = session.user.id;
    const isParticipant = match.players.some((p) => p.userId === userId);

    if (!isParticipant) {
      return apiErrors.forbidden("You are not a participant of this match");
    }

    const body = await req.json();
    const { action, data } = body;

    // Broadcast move to all players subscribed to this match channel
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-match-${id}`, "game-move", {
        senderId: userId,
        action,
        data,
        timestamp: Date.now(),
      });
    } catch (pushErr) {
      console.warn("Pusher game-move broadcast warning:", pushErr);
    }

    return apiSuccess({ success: true }, "Move broadcasted successfully");
  } catch (error) {
    console.error(`Error in POST /api/matches/${id}/moves:`, error);
    return apiErrors.serverError("Failed to broadcast gameplay action", error);
  }
}
