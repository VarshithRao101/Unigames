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

    // Broadcast to other players that this user has entered the countdown screen
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-room-${room.code}`, "player-entered-countdown", {
        userId: session.user.id,
      });
    } catch (pushErr) {
      console.warn("Pusher countdown broadcast warning:", pushErr);
    }

    return apiSuccess({}, "Entered countdown broadcast sent");
  } catch (error) {
    console.error(`Error in POST /api/rooms/${code}/enter-countdown:`, error);
    return apiErrors.serverError("Failed to trigger countdown entry", error);
  }
}
