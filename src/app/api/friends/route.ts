import { auth } from "@/auth";
import { sendFriendRequest, getFriendsList, getPendingRequests } from "@/lib/services/friend-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { friendRequestSchema } from "@/lib/utils/validation";
import { getPusherServer } from "@/lib/pusher";
import { rateLimit } from "@/lib/utils/rate-limit";
import { NextRequest } from "next/server";
import { getFriendshipsCollection } from "@/lib/db/collections";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  try {
    const userId = session.user.id;
    const friendsList = await getFriendsList(userId);
    const pending = await getPendingRequests(userId);

    const friendships = await getFriendshipsCollection();
    const userObjectId = new ObjectId(userId);
    const friendshipDocs = await friendships.find({
      status: "accepted",
      $or: [
        { requesterId: userObjectId },
        { receiverId: userObjectId },
      ],
    }).toArray();

    const friends = friendsList.map((f) => {
      const friendship = friendshipDocs.find((doc) =>
        (doc.requesterId.toString() === userId && doc.receiverId.toString() === f._id?.toString()) ||
        (doc.receiverId.toString() === userId && doc.requesterId.toString() === f._id?.toString())
      );
      return {
        ...f,
        friendshipId: friendship?._id?.toString(),
      };
    });

    return apiSuccess({ friends, pending });
  } catch (error) {
    console.error("Error in GET /api/friends:", error);
    return apiErrors.serverError("Failed to retrieve friends list", error);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const limitCheck = rateLimit(session.user.id || ip, "friend-request", { limit: 10, windowMs: 60 * 1000 });
  if (!limitCheck.success) {
    return apiErrors.rateLimited("Too many friend requests sent. Please wait a moment.");
  }

  try {
    const body = await req.json();
    const validation = friendRequestSchema.safeParse(body);

    if (!validation.success) {
      return apiErrors.badRequest("Invalid request format", validation.error.flatten());
    }

    const result = await sendFriendRequest(session.user.id, validation.data.receiverUsername);

    if (!result.success || !result.request) {
      return apiErrors.badRequest(result.error || "Failed to dispatch request");
    }

    // Notify target user via Pusher in real-time
    const targetUserId = result.request.receiverId.toString();
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-user-${targetUserId}`, "friend-request-received", {
        request: result.request,
        senderUsername: (session.user as any).username || session.user.name,
      });
    } catch (pushErr) {
      console.warn("Pusher notification warning:", pushErr);
    }

    return apiSuccess(result.request, "Friend request dispatched successfully", 201);
  } catch (error) {
    console.error("Error in POST /api/friends:", error);
    return apiErrors.serverError("Failed to dispatch friend request", error);
  }
}
