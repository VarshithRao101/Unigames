import { getLeaderboard } from "@/lib/services/leaderboard-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const game = searchParams.get("game") || "global"; // "global" or game slug
  const period = searchParams.get("period") || "all-time"; // "weekly" or "all-time"
  const limitStr = searchParams.get("limit") || "20";

  if (period !== "weekly" && period !== "all-time") {
    return apiErrors.badRequest("Invalid period filter. Must be 'weekly' or 'all-time'.");
  }

  const limit = parseInt(limitStr, 10);
  if (isNaN(limit) || limit <= 0) {
    return apiErrors.badRequest("Invalid limit parameter.");
  }

  try {
    const list = await getLeaderboard(game, period, limit);
    return apiSuccess(list);
  } catch (error) {
    console.error("Error in GET /api/leaderboards:", error);
    return apiErrors.serverError("Failed to fetch leaderboard data", error);
  }
}
