import { seedDatabase } from "@/lib/db/seed";
import { apiSuccess, apiErrors } from "@/lib/utils/api-response";

/**
 * GET /api/admin/seed
 * Triggers the database seeding utility for development testing.
 */
export async function GET() {
  try {
    await seedDatabase();
    return apiSuccess({ seeded: true }, "Database seeded successfully!");
  } catch (error) {
    console.error("Error running database seed endpoint:", error);
    return apiErrors.serverError("Database seeding execution failed", error);
  }
}
