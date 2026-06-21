import { createIndexes } from "@/lib/db/indexes";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";

/**
 * GET /api/admin/indexes
 * Triggers database index creation for unique constraints and TTL settings.
 */
export async function GET() {
  try {
    await createIndexes();
    return apiSuccess({ indexed: true }, "Database indexes initialized successfully!");
  } catch (error) {
    console.error("Error creating database indexes:", error);
    return apiErrors.serverError("Database index initialization failed", error);
  }
}
