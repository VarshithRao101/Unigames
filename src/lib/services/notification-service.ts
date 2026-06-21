import { getNotificationsCollection, NotificationDoc } from "../db/collections";
import { ObjectId } from "mongodb";
import { getPusherServer } from "../pusher";

// Helper to format dynamic relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

/**
 * Creates a notification in the database and dispatches it in real-time via Pusher.
 */
export async function createNotification(
  userId: string,
  type: NotificationDoc["type"],
  title: string,
  body: string,
  link?: string
): Promise<any | null> {
  try {
    const collection = await getNotificationsCollection();
    
    const newDoc: NotificationDoc = {
      userId: new ObjectId(userId),
      type,
      title,
      body,
      link,
      isRead: false,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newDoc);
    
    const payload = {
      id: result.insertedId.toString(),
      type,
      title,
      message: body,
      link,
      time: "Just now",
      isRead: false,
    };

    // Dispatch real-time Pusher event to private-user-${userId}
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-user-${userId}`, "notification-received", payload);
    } catch (pushErr) {
      // Log Pusher error but don't crash database transaction
      console.error("Pusher dispatch failed for notification:", pushErr);
    }

    return payload;
  } catch (error) {
    console.error("Error in createNotification:", error);
    return null;
  }
}

/**
 * Retrieves notifications list for a specific user.
 */
export async function getNotifications(userId: string, limit = 50): Promise<any[]> {
  try {
    const collection = await getNotificationsCollection();
    const docs = await collection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map((doc) => ({
      id: doc._id?.toString() || "",
      type: doc.type,
      title: doc.title,
      message: doc.body,
      link: doc.link,
      time: formatRelativeTime(doc.createdAt),
      isRead: doc.isRead,
    }));
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return [];
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationRead(id: string, userId: string): Promise<boolean> {
  try {
    const collection = await getNotificationsCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: { isRead: true } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error in markNotificationRead:", error);
    return false;
  }
}

/**
 * Marks all notifications as read for a user.
 */
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  try {
    const collection = await getNotificationsCollection();
    const result = await collection.updateMany(
      { userId: new ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error in markAllNotificationsRead:", error);
    return false;
  }
}

/**
 * Clears/Deletes all notifications for a user.
 */
export async function clearAllNotifications(userId: string): Promise<boolean> {
  try {
    const collection = await getNotificationsCollection();
    const result = await collection.deleteMany({ userId: new ObjectId(userId) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error in clearAllNotifications:", error);
    return false;
  }
}
