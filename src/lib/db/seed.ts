import { getDb } from "./collections";
import { ObjectId } from "mongodb";

export async function seedDatabase() {
  const db = await getDb();
  console.log("Starting database seeding for database:", db.databaseName);

  // Clear existing collections to start fresh
  await db.collection("users").deleteMany({});
  await db.collection("rooms").deleteMany({});
  await db.collection("matches").deleteMany({});
  await db.collection("leaderboards").deleteMany({});
  await db.collection("notifications").deleteMany({});
  await db.collection("analytics_events").deleteMany({});
  console.log("Cleared existing data.");

  // 1. Create 5 test users
  const userIds = [
    new ObjectId(),
    new ObjectId(),
    new ObjectId(),
    new ObjectId(),
    new ObjectId(),
  ];

  const users = [
    {
      _id: userIds[0],
      email: "varshith@uniplay.gg",
      name: "Varshith Rao",
      username: "Varshith",
      avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      bio: "Founder of UniGames. Ready to challenge anyone!",
      role: "admin",
      xp: 1840,
      level: 4,
      settings: { notifications: true, privacy: "public", appearance: "light" },
      stats: {
        gamesPlayed: 24,
        wins: 18,
        losses: 4,
        draws: 2,
        winStreak: 6,
        maxWinStreak: 9,
        gameStats: {
          tictactoe: { played: 15, wins: 12, losses: 2, draws: 1, highScore: 100 },
        },
      },
      achievements: [
        { id: "first_win", unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { id: "level_3", unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      _id: userIds[1],
      email: "nova@uniplay.gg",
      name: "Nova Star",
      username: "Nova",
      avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      bio: "Pro Tic-Tac-Toe strategist. Come get some!",
      role: "user",
      xp: 1660,
      level: 4,
      settings: { notifications: true, privacy: "public", appearance: "light" },
      stats: {
        gamesPlayed: 22,
        wins: 16,
        losses: 5,
        draws: 1,
        winStreak: 5,
        maxWinStreak: 7,
        gameStats: {
          tictactoe: { played: 12, wins: 9, losses: 2, draws: 1 },
        },
      },
      achievements: [
        { id: "first_win", unlockedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      ],
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      _id: userIds[2],
      email: "boardking@uniplay.gg",
      name: "Board King",
      username: "BoardKing",
      avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      bio: "The monarch of classical board games.",
      role: "user",
      xp: 1410,
      level: 3,
      settings: { notifications: true, privacy: "public", appearance: "light" },
      stats: {
        gamesPlayed: 19,
        wins: 14,
        losses: 3,
        draws: 2,
        winStreak: 4,
        maxWinStreak: 8,
        gameStats: {
          tictactoe: { played: 10, wins: 7, losses: 2, draws: 1 },
        },
      },
      achievements: [],
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      _id: userIds[3],
      email: "luna@uniplay.gg",
      name: "Luna Gazer",
      username: "Luna",
      avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      bio: "Gazing at the moon while executing checkmates.",
      role: "user",
      xp: 1290,
      level: 3,
      settings: { notifications: false, privacy: "friends-only", appearance: "light" },
      stats: {
        gamesPlayed: 17,
        wins: 12,
        losses: 5,
        draws: 0,
        winStreak: 3,
        maxWinStreak: 6,
        gameStats: {
          tictactoe: { played: 8, wins: 6, losses: 2, draws: 0 },
        },
      },
      achievements: [],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      _id: userIds[4],
      email: "rookstar@uniplay.gg",
      name: "Rook Star",
      username: "RookStar",
      avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      bio: "Heavy rook endgame enthusiast.",
      role: "user",
      xp: 1180,
      level: 3,
      settings: { notifications: true, privacy: "public", appearance: "light" },
      stats: {
        gamesPlayed: 16,
        wins: 11,
        losses: 4,
        draws: 1,
        winStreak: 3,
        maxWinStreak: 5,
        gameStats: {
          tictactoe: { played: 7, wins: 4, losses: 2, draws: 1 },
        },
      },
      achievements: [],
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  ];

  await db.collection("users").insertMany(users);
  console.log("Seeded 5 test users.");

  // 2. Create 2 test active rooms (lobbies)
  const rooms = [
    {
      code: "TIC442",
      gameSlug: "tictactoe",
      players: [
        {
          userId: userIds[1].toString(),
          username: "Nova",
          avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
          isHost: true,
          isReady: true,
        },
        {
          userId: userIds[4].toString(),
          username: "RookStar",
          avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
          isHost: false,
          isReady: false,
        },
      ],
      maxPlayers: 2,
      status: "waiting",
      settings: { isPrivate: false },
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: "TIC881",
      gameSlug: "tictactoe",
      players: [
        {
          userId: userIds[0].toString(),
          username: "Varshith",
          avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
          isHost: true,
          isReady: true,
        },
      ],
      maxPlayers: 2,
      status: "waiting",
      settings: { isPrivate: false },
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("rooms").insertMany(rooms);
  console.log("Seeded 2 lobby rooms.");

  // 3. Create 10 completed matches
  const matches: any[] = [];
  for (let i = 0; i < 10; i++) {
    const gameSlug = "tictactoe";
    const p1Index = i % 5;
    const p2Index = (i + 1) % 5;
    const winnerIndex = i % 3 === 0 ? p1Index : i % 3 === 1 ? p2Index : null; // null for draw

    matches.push({
      roomCode: `MCH00${i}`,
      gameSlug,
      players: [
        {
          userId: userIds[p1Index].toString(),
          username: users[p1Index].username,
          avatar: users[p1Index].avatar,
          score: winnerIndex === p1Index ? 1 : winnerIndex === null ? 0 : -1,
          xpEarned: winnerIndex === p1Index ? 100 : winnerIndex === null ? 40 : 20,
        },
        {
          userId: userIds[p2Index].toString(),
          username: users[p2Index].username,
          avatar: users[p2Index].avatar,
          score: winnerIndex === p2Index ? 1 : winnerIndex === null ? 0 : -1,
          xpEarned: winnerIndex === p2Index ? 100 : winnerIndex === null ? 40 : 20,
        },
      ],
      status: "completed",
      winnerId: winnerIndex !== null ? userIds[winnerIndex].toString() : null,
      scores: {
        [userIds[p1Index].toString()]: winnerIndex === p1Index ? 10 : 0,
        [userIds[p2Index].toString()]: winnerIndex === p2Index ? 10 : 0,
      },
      duration: 120 + i * 15,
      createdAt: new Date(Date.now() - i * 8 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - i * 8 * 60 * 60 * 1000 + 150000),
    });
  }

  await db.collection("matches").insertMany(matches);
  console.log("Seeded 10 match records.");

  // 4. Create pre-aggregated leaderboard data (overall + games; weekly + all-time)
  const leaderboards: any[] = [];
  
  // Scopes: "global", "tictactoe"
  // Periods: "weekly", "all-time"
  const periods = ["weekly", "all-time"];
  const scopes = ["global", "tictactoe"];

  for (const period of periods) {
    for (const scope of scopes) {
      // Sort users by their stats to distribute rankings beautifully
      const sortedUsers = [...users].sort((a, b) => {
        if (scope === "global") return b.xp - a.xp;
        const bStats = b.stats.gameStats[scope as "tictactoe"]?.played || 0;
        const aStats = a.stats.gameStats[scope as "tictactoe"]?.played || 0;
        return bStats - aStats;
      });

      sortedUsers.forEach((user, index) => {
        // Calculate distinct XP values based on rank to keep list structured
        let baseXP = scope === "global" ? user.xp : (user.stats.gameStats[scope as "tictactoe"]?.wins || 0) * 100 + 120;
        if (period === "weekly") {
          baseXP = Math.floor(baseXP * 0.2) + 50; // weekly is smaller portion
        }

        leaderboards.push({
          period,
          gameSlug: scope,
          userId: user._id,
          username: user.username,
          avatar: user.avatar,
          xp: baseXP,
          updatedAt: new Date(),
        });
      });
    }
  }

  await db.collection("leaderboards").insertMany(leaderboards);
  console.log("Seeded leaderboard aggregated lists.");

  console.log("Database seeding completed successfully.");
}

// Execute if run directly
if (typeof require !== "undefined" && typeof module !== "undefined" && (require as any).main === module) {
  seedDatabase()
    .then(() => {
      console.log("DB Seed finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("DB Seed failed:", err);
      process.exit(1);
    });
}
