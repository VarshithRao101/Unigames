import { auth } from "@/auth";
import { joinRoom } from "@/lib/services/room-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { getPusherServer } from "@/lib/pusher";
import { rateLimit } from "@/lib/utils/rate-limit";
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

  const userId = session.user.id;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const limitCheck = rateLimit(userId || ip, "join-room", { limit: 15, windowMs: 60 * 1000 });
  if (!limitCheck.success) {
    return apiErrors.rateLimited("Too many room join attempts. Please try again in a moment.");
  }

  if (!code) {
    return apiErrors.badRequest("Room code is required");
  }

  try {
    const result = await joinRoom(code, userId);
    
    if (!result.success || !result.room) {
      return apiErrors.badRequest(result.error || "Failed to join room");
    }

    const room = result.room;
    const joinedPlayer = room.players.find(p => p.userId === userId);

    // Notify other players via Pusher
    try {
      const pusher = getPusherServer();
      
      // Notify active room lobby channel
      await pusher.trigger(`private-room-${room.code}`, "player-joined", joinedPlayer);
      
      // Update global public room lists count
      await pusher.trigger("rooms-list", "room-updated", {
        code: room.code,
        playersCount: room.players.length,
      });
    } catch (pushErr) {
      console.warn("Pusher join broadcast warning:", pushErr);
    }

    return apiSuccess(room, "Successfully joined room");
  } catch (error) {
    console.error(`Error in POST /api/rooms/${code}/join:`, error);
    return apiErrors.serverError("Failed to join game lobby", error);
  }
}
