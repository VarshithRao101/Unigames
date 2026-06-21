import { auth } from "@/auth";
import { createMatch } from "@/lib/services/match-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { getPusherServer } from "@/lib/pusher";
import { NextRequest } from "next/server";
import { z } from "zod";

const startMatchSchema = z.object({
  roomCode: z.string().min(6).max(6),
});

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  try {
    const body = await req.json();
    const validation = startMatchSchema.safeParse(body);
    
    if (!validation.success) {
      return apiErrors.badRequest("Invalid start match request details", validation.error.flatten());
    }

    const { roomCode } = validation.data;
    const match = await createMatch(roomCode, session.user.id);

    if (!match) {
      return apiErrors.badRequest("Failed to start match. Ensure all players are ready.");
    }

    const matchId = match._id?.toString() || "";

    // Broadcast redirect triggers via Pusher
    try {
      const pusher = getPusherServer();
      
      // Tell players in the room to navigate to the game play page
      await pusher.trigger(`private-room-${roomCode}`, "match-started", {
        matchId,
        gameSlug: match.gameSlug,
      });

      // Update public lobby lists (remove the playing room)
      await pusher.trigger("rooms-list", "room-updated", {
        code: roomCode,
        status: "playing",
      });
    } catch (pushErr) {
      console.warn("Pusher match-start broadcast warning:", pushErr);
    }

    return apiSuccess(match, "Match initialized successfully", 201);
  } catch (error) {
    console.error("Error in POST /api/matches:", error);
    return apiErrors.serverError("Failed to initialize match", error);
  }
}
