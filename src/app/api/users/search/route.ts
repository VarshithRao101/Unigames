import { auth } from "@/auth";
import { getUsersCollection } from "@/lib/db/collections";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (query.trim().length < 2) {
    return apiSuccess([]);
  }

  try {
    const users = await getUsersCollection();
    const matched = await users.find({
      username: { $regex: query, $options: "i" },
      _id: { $ne: new ObjectId(session.user.id) }
    }).project({
      username: 1,
      avatar: 1,
      level: 1,
      role: 1,
      bio: 1
    }).limit(10).toArray();

    const results = matched.map(u => ({
      id: u._id?.toString(),
      username: u.username,
      avatar: u.avatar,
      level: u.level,
      role: u.role,
      bio: u.bio
    }));

    return apiSuccess(results);
  } catch (error) {
    console.error("Error in GET /api/users/search:", error);
    return apiErrors.serverError("Failed to search users", error);
  }
}
