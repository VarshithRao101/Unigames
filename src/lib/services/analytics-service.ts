import { getAnalyticsCollection, AnalyticsEventDoc } from "../db/collections";
import { ObjectId } from "mongodb";

/**
 * Persists an analytics tracking log in the database.
 */
export async function logServerAnalyticsEvent(
  eventName: string,
  category: string,
  label?: string,
  value?: number,
  metadata?: Record<string, any>,
  userId?: string
): Promise<boolean> {
  try {
    const collection = await getAnalyticsCollection();
    
    const doc: AnalyticsEventDoc = {
      eventName,
      category,
      label,
      value,
      metadata,
      userId: userId ? new ObjectId(userId) : undefined,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return result.acknowledged;
  } catch (error) {
    console.error("Error in logServerAnalyticsEvent:", error);
    return false;
  }
}
