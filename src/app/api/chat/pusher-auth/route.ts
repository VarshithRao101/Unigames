import { auth } from "@/auth";
import { getPusherServer } from "@/lib/pusher";
import { apiErrors } from "@/lib/utils/api-response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  try {
    let socketId = "";
    let channelName = "";

    // Parse according to content type (supporting both application/json and application/x-www-form-urlencoded)
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      socketId = body.socket_id;
      channelName = body.channel_name;
    } else {
      const formData = await req.formData();
      socketId = formData.get("socket_id") as string;
      channelName = formData.get("channel_name") as string;
    }

    if (!socketId || !channelName) {
      return new NextResponse("Missing socket_id or channel_name parameters", { status: 400 });
    }

    const pusher = getPusherServer();
    
    // For presence channels, attach user metadata
    let authResponse;
    if (channelName.startsWith("presence-")) {
      const presenceData = {
        user_id: session.user.id,
        user_info: {
          username: (session.user as any).username || session.user.name || "Gamer",
          image: session.user.image || "/avatars/avatar-placeholder.png",
        },
      };
      authResponse = pusher.authorizeChannel(socketId, channelName, presenceData);
    } else {
      if (channelName.startsWith("private-user-")) {
        const channelUserId = channelName.substring("private-user-".length);
        if (channelUserId !== session.user.id) {
          return apiErrors.unauthorized("Cannot subscribe to another user's private channel.");
        }
      }
      authResponse = pusher.authorizeChannel(socketId, channelName);
    }

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Error in Pusher auth endpoint:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
