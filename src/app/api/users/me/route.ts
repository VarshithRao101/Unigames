import { auth } from "@/auth";
import { getUserById, updateProfile } from "@/lib/services/user-service";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";
import { updateProfileSchema } from "@/lib/utils/validation";
import { rateLimit } from "@/lib/utils/rate-limit";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    return apiErrors.notFound("User profile not found in database");
  }

  return apiSuccess(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiErrors.unauthorized();
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const limitCheck = rateLimit(session.user.id || ip, "update-profile", { limit: 10, windowMs: 60 * 1000 });
  if (!limitCheck.success) {
    return apiErrors.rateLimited("Too many profile updates. Please try again in a minute.");
  }

  try {
    const body = await req.json();
    
    // Validate inputs
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return apiErrors.badRequest("Invalid profile inputs", validation.error.flatten());
    }

    const isUpdated = await updateProfile(session.user.id, validation.data);
    if (!isUpdated) {
      return apiErrors.badRequest("No profile fields were modified");
    }

    return apiSuccess({ success: true }, "Profile updated successfully");
  } catch (error) {
    console.error("Error in PATCH /api/users/me:", error);
    return apiErrors.serverError("Failed to update profile", error);
  }
}
