import { auth } from "@/auth";
import { setPlayerReady } from "@/lib/services/room-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { getPusherServer } from "@/lib/pusher";
import { NextRequest } from "next/server";
import { z } from "zod";

const readySchema = z.object({
  isReady: z.boolean(),
});

export async function PATCH(
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
    const body = await req.json();
    const validation = readySchema.safeParse(body);
    
    if (!validation.success) {
      return apiErrors.badRequest("Invalid request body");
    }

    const { isReady } = validation.data;
    const room = await setPlayerReady(code, session.user.id, isReady);

    if (!room) {
      return apiErrors.notFound("Room not found or player is not in this room");
    }

    // Notify other players via Pusher
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-room-${room.code}`, "player-ready", {
        userId: session.user.id,
        isReady,
      });
    } catch (pushErr) {
      console.warn("Pusher ready broadcast warning:", pushErr);
    }

    return apiSuccess(room, "Ready state updated successfully");
  } catch (error) {
    console.error(`Error in PATCH /api/rooms/${code}/ready:`, error);
    return apiErrors.serverError("Failed to update ready state", error);
  }
}
