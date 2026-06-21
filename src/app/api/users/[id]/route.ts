import { getUserById } from "@/lib/services/user-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return apiErrors.badRequest("User ID is required");
  }

  const user = await getUserById(id);
  if (!user) {
    return apiErrors.notFound("User not found");
  }

  // Respect user privacy settings
  const privacy = user.settings?.privacy || "public";
  if (privacy === "private") {
    // Return limited public visibility
    return apiSuccess({
      id: user._id?.toString(),
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      level: user.level,
      privacy: "private",
    });
  }

  // Return public profile metadata
  return apiSuccess({
    id: user._id?.toString(),
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    xp: user.xp,
    level: user.level,
    stats: {
      gamesPlayed: user.stats?.gamesPlayed || 0,
      wins: user.stats?.wins || 0,
      losses: user.stats?.losses || 0,
      draws: user.stats?.draws || 0,
      winStreak: user.stats?.winStreak || 0,
      maxWinStreak: user.stats?.maxWinStreak || 0,
      gameStats: user.stats?.gameStats || {},
    },
    achievements: user.achievements || [],
    createdAt: user.createdAt,
  });
}
