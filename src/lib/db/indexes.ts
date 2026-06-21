import { getDb } from "./collections";

export async function createIndexes() {
  const db = await getDb();
  console.log("Starting index creation for database:", db.databaseName);

  // 1. Users Indexes
  const users = db.collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ username: 1 }, { unique: true });
  console.log("Created users indexes.");

  // 2. Matches Indexes
  const matches = db.collection("matches");
  await matches.createIndex({ "players.userId": 1 });
  await matches.createIndex({ createdAt: -1 });
  console.log("Created matches indexes.");

  // 3. Rooms Indexes
  const rooms = db.collection("rooms");
  await rooms.createIndex({ code: 1 }, { unique: true });
  // TTL index: Documents will expire at the specific date/time in the 'expiresAt' field
  await rooms.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  console.log("Created rooms indexes (including TTL).");

  // 4. Chat Messages Indexes
  const chat = db.collection("chat_messages");
  await chat.createIndex({ channel: 1 });
  // TTL index: expire after 24 hours (86,400 seconds)
  await chat.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
  console.log("Created chat_messages indexes (including TTL).");

  // 5. Friendships Indexes
  const friendships = db.collection("friendships");
  await friendships.createIndex({ requesterId: 1, receiverId: 1 }, { unique: true });
  await friendships.createIndex({ receiverId: 1, status: 1 });
  console.log("Created friendships indexes.");

  // 6. Notifications Indexes
  const notifications = db.collection("notifications");
  await notifications.createIndex({ userId: 1 });
  // TTL index: expire after 7 days (604,800 seconds)
  await notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 });
  console.log("Created notifications indexes (including TTL).");

  // 7. Leaderboards Indexes
  const leaderboards = db.collection("leaderboards");
  await leaderboards.createIndex({ period: 1, gameSlug: 1, xp: -1 });
  await leaderboards.createIndex({ userId: 1, period: 1, gameSlug: 1 }, { unique: true });
  console.log("Created leaderboards indexes.");

  // 8. Analytics Indexes
  const analytics = db.collection("analytics_events");
  await analytics.createIndex({ category: 1, eventName: 1 });
  // TTL index: expire after 30 days (2,592,000 seconds)
  await analytics.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
  console.log("Created analytics_events indexes (including TTL).");

  console.log("Database index creation completed successfully.");
}

// Allow running directly if this script is executed
if (typeof require !== "undefined" && typeof module !== "undefined" && (require as any).main === module) {
  createIndexes()
    .then(() => {
      console.log("Indexes initialized successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error initializing indexes:", err);
      process.exit(1);
    });
}
