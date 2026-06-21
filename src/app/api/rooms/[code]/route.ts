import { auth } from "@/auth";
import { getRoomByCode, leaveRoom } from "@/lib/services/room-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { getPusherServer } from "@/lib/pusher";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return apiErrors.badRequest("Room code is required");
  }

  try {
    const room = await getRoomByCode(code);
    if (!room) {
      return apiErrors.notFound("Lobby room not found");
    }

    return apiSuccess(room);
  } catch (error) {
    console.error(`Error in GET /api/rooms/${code}:`, error);
    return apiErrors.serverError("Failed to fetch room details", error);
  }
}

export async function DELETE(
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

    const userId = session.user.id;
    const leaveResult = await leaveRoom(code, userId);

    if (!leaveResult.success) {
      return apiErrors.badRequest("Failed to exit the game lobby");
    }

    // Trigger Pusher notification about leaving
    try {
      const pusher = getPusherServer();
      
      if (leaveResult.empty) {
        // Broadcast rooms-list update (remove from public list)
        await pusher.trigger("rooms-list", "room-deleted", { code });
      } else {
        // Broadcast to players in the lobby room
        await pusher.trigger(`private-room-${code}`, "player-left", {
          userId,
          newHostId: leaveResult.newHostId,
        });

        // Broadcast rooms-list update (reduced count)
        await pusher.trigger("rooms-list", "room-updated", {
          code,
          playersCount: room.players.length - 1,
        });
      }
    } catch (pushErr) {
      console.warn("Pusher leave warning:", pushErr);
    }

    return apiSuccess({ exited: true }, "Successfully exited the game room");
  } catch (error) {
    console.error(`Error in DELETE /api/rooms/${code}:`, error);
    return apiErrors.serverError("Failed to exit the game room", error);
  }
}
