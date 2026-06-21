import { auth } from "@/auth";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
} from "@/lib/services/notification-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

/**
 * GET /api/notifications
 * Returns list of notifications for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  try {
    const list = await getNotifications(session.user.id);
    return apiSuccess(list);
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return apiErrors.serverError("Failed to fetch notifications", error);
  }
}

/**
 * PATCH /api/notifications
 * Marks notifications as read.
 * Body payload: { id?: string, action?: "readAll" }
 */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  try {
    const body = await req.json();
    const { id, action } = body;

    if (id) {
      const success = await markNotificationRead(id, session.user.id);
      return apiSuccess({ success });
    } else if (action === "readAll" || !id) {
      const success = await markAllNotificationsRead(session.user.id);
      return apiSuccess({ success });
    }

    return apiErrors.badRequest("Invalid request parameters.");
  } catch (error) {
    console.error("Error in PATCH /api/notifications:", error);
    return apiErrors.serverError("Failed to update notifications", error);
  }
}

/**
 * DELETE /api/notifications
 * Clears all notifications for the authenticated user.
 */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  try {
    const success = await clearAllNotifications(session.user.id);
    return apiSuccess({ success });
  } catch (error) {
    console.error("Error in DELETE /api/notifications:", error);
    return apiErrors.serverError("Failed to clear notifications", error);
  }
}
