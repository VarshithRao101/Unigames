import { auth } from "@/auth";
import { saveMessage, getRecentMessages } from "@/lib/services/chat-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { getPusherServer } from "@/lib/pusher";
import { NextRequest } from "next/server";
import { z } from "zod";

const sendMessageSchema = z.object({
  channel: z.string().min(1),
  text: z.string().min(1).max(1000),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");

  if (!channel) {
    return apiErrors.badRequest("Channel parameter is required");
  }

  try {
    const rawMessages = await getRecentMessages(channel);
    
    // Map to frontend structure
    const messages = rawMessages.map((m) => ({
      id: m._id?.toString() || `${Date.now()}`,
      sender: m.sender.username,
      senderId: m.sender.userId,
      avatar: m.sender.avatar,
      text: m.text,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

    return apiSuccess(messages);
  } catch (error) {
    console.error("Error in GET /api/chat:", error);
    return apiErrors.serverError("Failed to retrieve chat history", error);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  try {
    const body = await req.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      return apiErrors.badRequest("Invalid chat message body");
    }

    const { channel, text } = validation.data;
    const username = (session.user as any).username || session.user.name || "Gamer";
    const avatar = session.user.image || undefined;

    const saved = await saveMessage(channel, session.user.id, username, avatar, text);
    if (!saved) {
      return apiErrors.serverError("Failed to save chat message");
    }

    const payload = {
      id: saved._id?.toString() || `${Date.now()}`,
      sender: username,
      senderId: session.user.id,
      avatar,
      text,
      time: new Date(saved.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Broadcast in real-time via Pusher
    try {
      const pusher = getPusherServer();
      
      if (channel === "global") {
        await pusher.trigger("presence-global-chat", "new-message", payload);
      } else if (channel.startsWith("room:")) {
        const roomCode = channel.split(":")[1];
        await pusher.trigger(`private-room-${roomCode}`, "room-message", payload);
      }
    } catch (pushErr) {
      console.warn("Pusher chat message broadcast warning:", pushErr);
    }

    return apiSuccess(payload, "Message sent successfully", 201);
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return apiErrors.serverError("Failed to send chat message", error);
  }
}
