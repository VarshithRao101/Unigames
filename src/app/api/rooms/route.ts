import { auth } from "@/auth";
import { createRoom, listOpenRooms } from "@/lib/services/room-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { createRoomSchema } from "@/lib/utils/validation";
import { getPusherServer } from "@/lib/pusher";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const game = searchParams.get("game") || undefined;

  try {
    const rooms = await listOpenRooms(game);
    return apiSuccess(rooms);
  } catch (error) {
    console.error("Error in GET /api/rooms:", error);
    return apiErrors.serverError("Failed to retrieve lobbies", error);
  }
}

import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const limitCheck = rateLimit(session.user.id || ip, "create-room", { limit: 5, windowMs: 60 * 1000 });
  if (!limitCheck.success) {
    return apiErrors.rateLimited("Too many rooms created. Please wait before creating another lobby.");
  }

  try {
    const body = await req.json();
    const validation = createRoomSchema.safeParse(body);
    
    if (!validation.success) {
      return apiErrors.badRequest("Invalid room creation details", validation.error.flatten());
    }

    const { gameSlug, maxPlayers, settings } = validation.data;
    const room = await createRoom(session.user.id, gameSlug, maxPlayers, settings);

    if (!room) {
      return apiErrors.badRequest("Failed to establish game room");
    }

    // Broadcast room creation to lobbies lists in real-time
    try {
      const pusher = getPusherServer();
      await pusher.trigger("rooms-list", "room-created", {
        code: room.code,
        gameSlug: room.gameSlug,
        playersCount: room.players.length,
        maxPlayers: room.maxPlayers,
        settings: room.settings,
      });
    } catch (pushErr) {
      // Don't crash request if Pusher logs fail during compilation/test
      console.warn("Pusher broadcast warning:", pushErr);
    }

    return apiSuccess(room, "Lobby room created successfully", 201);
  } catch (error) {
    console.error("Error in POST /api/rooms:", error);
    return apiErrors.serverError("Failed to establish game room", error);
  }
}
