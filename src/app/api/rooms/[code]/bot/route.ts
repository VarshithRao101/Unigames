import { auth } from "@/auth";
import { getRoomByCode } from "@/lib/services/room-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { getPusherServer } from "@/lib/pusher";
import { getRoomsCollection } from "@/lib/db/collections";
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

  try {
    const room = await getRoomByCode(code);
    if (!room) {
      return apiErrors.notFound("Room not found");
    }

    const hostPlayer = room.players.find((p) => p.isHost);
    if (hostPlayer?.userId !== session.user.id) {
      return apiErrors.unauthorized("Only the room host can add bots");
    }

    if (room.players.length >= room.maxPlayers) {
      return apiErrors.badRequest("Lobby room is full");
    }

    const { botName } = await req.json();

    const botPlayer = {
      userId: `bot-${Date.now()}`,
      username: botName,
      avatar: "AI",
      isHost: false,
      isReady: true,
      isAI: true,
    };

    const collection = await getRoomsCollection();
    await collection.updateOne(
      { code: room.code },
      { $push: { players: botPlayer as any } }
    );

    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-room-${room.code}`, "player-joined", botPlayer);
      await pusher.trigger("rooms-list", "room-updated", {
        code: room.code,
        playersCount: room.players.length + 1,
      });
    } catch (pushErr) {
      console.warn("Pusher bot trigger warning:", pushErr);
    }

    return apiSuccess(botPlayer, "Bot successfully added", 201);
  } catch (error) {
    console.error("Error in POST /api/rooms/[code]/bot:", error);
    return apiErrors.serverError("Failed to add bot", error);
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

  try {
    const room = await getRoomByCode(code);
    if (!room) {
      return apiErrors.notFound("Room not found");
    }

    const hostPlayer = room.players.find((p) => p.isHost);
    if (hostPlayer?.userId !== session.user.id) {
      return apiErrors.unauthorized("Only the room host can remove bots");
    }

    const { botId } = await req.json();

    const collection = await getRoomsCollection();
    await collection.updateOne(
      { code: room.code },
      { $pull: { players: { userId: botId } as any } }
    );

    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-room-${room.code}`, "player-left", { userId: botId });
      await pusher.trigger("rooms-list", "room-updated", {
        code: room.code,
        playersCount: room.players.length - 1,
      });
    } catch (pushErr) {
      console.warn("Pusher remove bot warning:", pushErr);
    }

    return apiSuccess({ removed: true }, "Bot successfully removed");
  } catch (error) {
    console.error("Error in DELETE /api/rooms/[code]/bot:", error);
    return apiErrors.serverError("Failed to remove bot", error);
  }
}
