import { auth } from "@/auth";
import { addSpectator, removeSpectator } from "@/lib/services/room-service";
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

  const userId = session.user.id;
  if (!code) {
    return apiErrors.badRequest("Room code is required");
  }

  try {
    const result = await addSpectator(code, userId);
    if (!result.success || !result.room) {
      return apiErrors.badRequest(result.error || "Failed to add spectator");
    }

    const room = result.room;
    const spectatorInfo = room.spectators?.find((s) => s.userId === userId);

    // Notify other players/spectators in the lobby room
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-room-${room.code}`, "spectator-joined", spectatorInfo);
    } catch (pushErr) {
      console.warn("Pusher spectator-joined broadcast warning:", pushErr);
    }

    return apiSuccess(room, "Successfully registered as spectator");
  } catch (error) {
    console.error(`Error in POST /api/rooms/${code}/spectate:`, error);
    return apiErrors.serverError("Failed to register as spectator", error);
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

  const userId = session.user.id;
  if (!code) {
    return apiErrors.badRequest("Room code is required");
  }

  try {
    const result = await removeSpectator(code, userId);
    if (!result.success || !result.room) {
      return apiErrors.badRequest("Failed to remove spectator");
    }

    const room = result.room;

    // Notify other players/spectators in the lobby room
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-room-${room.code}`, "spectator-left", { userId });
    } catch (pushErr) {
      console.warn("Pusher spectator-left broadcast warning:", pushErr);
    }

    return apiSuccess({ exited: true }, "Successfully exited spectator mode");
  } catch (error) {
    console.error(`Error in DELETE /api/rooms/${code}/spectate:`, error);
    return apiErrors.serverError("Failed to exit spectator mode", error);
  }
}
