import { auth } from "@/auth";
import { getRoomByCode } from "@/lib/services/room-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { getPusherServer } from "@/lib/pusher";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  const { code } = await params;

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  if (!code) {
    return apiErrors.badRequest("Room code is required");
  }

  try {
    const room = await getRoomByCode(code);
    if (!room) {
      return apiErrors.notFound("Room not found");
    }

    // Verify caller is the host of the room
    const hostPlayer = room.players.find(p => p.isHost);
    if (hostPlayer?.userId !== session.user.id) {
      return apiErrors.forbidden("Only the host can start the match");
    }

    // Notify other players via Pusher that the match is starting (opens the ad popup)
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-room-${room.code}`, "match-starting", {});
    } catch (pushErr) {
      console.warn("Pusher match-starting broadcast warning:", pushErr);
    }

    return apiSuccess({}, "Match starting triggered successfully");
  } catch (error) {
    console.error(`Error in POST /api/rooms/${code}/start:`, error);
    return apiErrors.serverError("Failed to trigger match start", error);
  }
}
