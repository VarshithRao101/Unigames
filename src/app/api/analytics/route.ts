import { logServerAnalyticsEvent } from "@/lib/services/analytics-service";
import { auth } from "@/auth";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

/**
 * POST /api/analytics
 * Records a client-side analytics event in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body = await req.json();
    const { eventName, category, label, value, metadata } = body;

    if (!eventName || !category) {
      return apiErrors.badRequest("Missing eventName or category parameters.");
    }

    const success = await logServerAnalyticsEvent(
      eventName,
      category,
      label,
      value,
      metadata,
      userId
    );

    return apiSuccess({ success });
  } catch (error) {
    console.error("Error in POST /api/analytics:", error);
    return apiErrors.serverError("Failed to record analytics event", error);
  }
}
