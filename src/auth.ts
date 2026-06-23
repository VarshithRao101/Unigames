import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days session age
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // User is available on initial login
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.username = (user as any).username || "";
        token.xp = (user as any).xp || 0;
        token.level = (user as any).level || 1;
        token.bio = (user as any).bio || "";
        if (user.image) {
          token.picture = user.image;
        }
      }
      
      // Handle session updates (if we update profile details in the frontend)
      if (trigger === "update" && session) {
        if (session.username) token.username = session.username;
        if (session.image) token.picture = session.image;
        if (session.bio !== undefined) token.bio = session.bio;
        if (session.role) token.role = session.role;
        if (session.xp !== undefined) token.xp = session.xp;
        if (session.level !== undefined) token.level = session.level;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).username = token.username as string;
        (session.user as any).xp = token.xp as number;
        (session.user as any).level = token.level as number;
        (session.user as any).bio = token.bio as string;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
  events: {
    // When a user signs in for the very first time, initialize our custom platform stats
    async createUser({ user }) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || "uniplay");
      const usersCollection = db.collection("users");

      const rawEmail = user.email || "";
      const baseUsername = rawEmail.split("@")[0]
        .replace(/[^a-zA-Z0-9_]/g, "")
        .toLowerCase() || "gamer";

      // Check if username exists, find a unique one
      let finalUsername = baseUsername;
      let counter = 1;
      while (await usersCollection.findOne({ username: finalUsername })) {
        finalUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
        counter++;
        if (counter > 10) break; // emergency break
      }

      // Update the freshly created user doc with our default fields
      await usersCollection.updateOne(
        { _id: new ObjectId(user.id) },
        {
          $set: {
            username: finalUsername,
            role: "user",
            xp: 0,
            level: 1,
            stats: {
              gamesPlayed: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              winStreak: 0,
              maxWinStreak: 0,
              gameStats: {},
            },
            achievements: [],
            settings: {
              notifications: true,
              privacy: "public",
              appearance: "system"
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    },
  },
  pages: {
    signIn: "/", // Redirect to home if they need to sign in
    error: "/",  // Redirect to home on error
  },
});
