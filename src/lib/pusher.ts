import PusherServer from "pusher";
import PusherClient from "pusher-js";

let pusherServerInstance: PusherServer | null = null;

/**
 * Gets the server-side Pusher instance. Lazily initialized to prevent build-time crashes.
 */
export const getPusherServer = (): PusherServer => {
  if (!pusherServerInstance) {
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!appId || !key || !secret || !cluster) {
      throw new Error(
        "Missing Pusher server credentials in environment variables. " +
        "Ensure PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, PUSHER_SECRET, and NEXT_PUBLIC_PUSHER_CLUSTER are set."
      );
    }

    pusherServerInstance = new PusherServer({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }
  return pusherServerInstance;
};

let pusherClientInstance: PusherClient | null = null;

/**
 * Gets the client-side Pusher instance. Cached as a singleton on the client.
 */
export const getPusherClient = (): PusherClient => {
  if (typeof window === "undefined") {
    throw new Error("getPusherClient cannot be called on the server side.");
  }

  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      throw new Error(
        "Missing NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER client environment variables."
      );
    }

    pusherClientInstance = new PusherClient(key, {
      cluster,
      forceTLS: true,
      authEndpoint: "/api/chat/pusher-auth", // NextAuth authorized Pusher auth endpoint
    });
  }

  return pusherClientInstance;
};
