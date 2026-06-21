import { auth } from "@/auth";
import { acceptFriendRequest, rejectFriendRequest, removeFriend } from "@/lib/services/friend-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: friendshipId } = await params;

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  if (!friendshipId) {
    return apiErrors.badRequest("Friendship ID parameter is required");
  }

  try {
    const success = await acceptFriendRequest(friendshipId, session.user.id);
    if (!success) {
      return apiErrors.badRequest("Failed to accept friend request. It may have expired or was modified.");
    }

    return apiSuccess({ success: true }, "Friend request accepted");
  } catch (error) {
    console.error(`Error in PATCH /api/friends/${friendshipId}:`, error);
    return apiErrors.serverError("Failed to accept friend request", error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: friendshipId } = await params;

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  if (!friendshipId) {
    return apiErrors.badRequest("Friendship ID parameter is required");
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "reject"; // 'reject' or 'remove'

  try {
    let success = false;
    const userId = session.user.id;

    if (action === "remove") {
      success = await removeFriend(friendshipId, userId);
    } else {
      // Default: reject pending request
      success = await rejectFriendRequest(friendshipId, userId);
    }

    if (!success) {
      return apiErrors.badRequest(`Failed to ${action} friend relationship.`);
    }

    return apiSuccess({ success: true }, `Friend relationship successfully ${action}ed`);
  } catch (error) {
    console.error(`Error in DELETE /api/friends/${friendshipId}:`, error);
    return apiErrors.serverError("Failed to update friendship status", error);
  }
}
