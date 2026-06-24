import { getRoomsCollection, RoomDoc, RoomPlayer } from "../db/collections";
import { getUserById } from "./user-service";

/**
 * Generates a unique 6-character uppercase alphanumeric room code.
 */
export async function generateUniqueRoomCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789"; // Avoid O and 0
  const collection = await getRoomsCollection();
  
  while (true) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    const existing = await collection.findOne({ code });
    if (!existing) {
      return code;
    }
  }
}

export async function getRoomByCode(code: string): Promise<RoomDoc | null> {
  const collection = await getRoomsCollection();
  return await collection.findOne({ code: code.toUpperCase() });
}

export async function createRoom(
  hostId: string,
  gameSlug: string,
  maxPlayers: number,
  settings: { isPrivate: boolean; timeLimit?: number; [key: string]: any }
): Promise<RoomDoc | null> {
  try {
    const hostUser = await getUserById(hostId);
    if (!hostUser) return null;

    const collection = await getRoomsCollection();
    const code = await generateUniqueRoomCode();

    const hostPlayer: RoomPlayer = {
      userId: hostId,
      username: hostUser.username,
      avatar: hostUser.avatar || "/avatars/avatar-placeholder.png",
      isHost: true,
      isReady: true, // Host is ready by default
    };

    const newRoom: RoomDoc = {
      code,
      gameSlug,
      players: [hostPlayer],
      maxPlayers,
      status: "waiting",
      settings,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expires in 1 hour
    };

    await collection.insertOne(newRoom);
    return newRoom;
  } catch (error) {
    console.error("Error in createRoom:", error);
    return null;
  }
}

export async function joinRoom(code: string, userId: string): Promise<{ success: boolean; error?: string; room?: RoomDoc }> {
  try {
    const collection = await getRoomsCollection();
    const room = await collection.findOne({ code: code.toUpperCase() });

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    if (room.status !== "waiting") {
      return { success: false, error: "Game has already started in this room" };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: "Room is full" };
    }

    // Check if player is already in room
    const isAlreadyIn = room.players.some((p) => p.userId === userId);
    if (isAlreadyIn) {
      return { success: true, room };
    }

    const user = await getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const newPlayer: RoomPlayer = {
      userId,
      username: user.username,
      avatar: user.avatar || "/avatars/avatar-placeholder.png",
      isHost: false,
      isReady: false,
    };

    const updatedTime = new Date();
    await collection.updateOne(
      { code: room.code },
      {
        $push: { players: newPlayer },
        $set: {
          updatedAt: updatedTime,
          expiresAt: new Date(updatedTime.getTime() + 60 * 60 * 1000), // Extend expiry
        },
      }
    );

    const updatedRoom = await collection.findOne({ code: room.code });
    return { success: true, room: updatedRoom || undefined };
  } catch (error) {
    console.error("Error in joinRoom:", error);
    return { success: false, error: "Failed to join room" };
  }
}

export async function leaveRoom(
  code: string,
  userId: string
): Promise<{ success: boolean; empty: boolean; newHostId?: string }> {
  try {
    const collection = await getRoomsCollection();
    const room = await collection.findOne({ code: code.toUpperCase() });

    if (!room) {
      return { success: false, empty: true };
    }

    const updatedPlayers = room.players.filter((p) => p.userId !== userId);

    if (updatedPlayers.length === 0) {
      // Delete the room if empty
      await collection.deleteOne({ code: room.code });
      return { success: true, empty: true };
    }

    let newHostId: string | undefined;
    const wasHost = room.players.find((p) => p.userId === userId)?.isHost;

    if (wasHost) {
      // Reassign host
      updatedPlayers[0].isHost = true;
      updatedPlayers[0].isReady = true; // New host is ready
      newHostId = updatedPlayers[0].userId;
    }

    const updatedTime = new Date();
    await collection.updateOne(
      { code: room.code },
      {
        $set: {
          players: updatedPlayers,
          updatedAt: updatedTime,
          expiresAt: new Date(updatedTime.getTime() + 60 * 60 * 1000),
        },
      }
    );

    return { success: true, empty: false, newHostId };
  } catch (error) {
    console.error("Error in leaveRoom:", error);
    return { success: false, empty: false };
  }
}

export async function setPlayerReady(
  code: string,
  userId: string,
  isReady: boolean
): Promise<RoomDoc | null> {
  try {
    const collection = await getRoomsCollection();
    const room = await collection.findOne({ code: code.toUpperCase() });

    if (!room) return null;

    const updatedPlayers = room.players.map((p) => {
      if (p.userId === userId) {
        return { ...p, isReady };
      }
      return p;
    });

    const updatedTime = new Date();
    await collection.updateOne(
      { code: room.code },
      {
        $set: {
          players: updatedPlayers,
          updatedAt: updatedTime,
          expiresAt: new Date(updatedTime.getTime() + 60 * 60 * 1000),
        },
      }
    );

    return await collection.findOne({ code: room.code });
  } catch (error) {
    console.error("Error in setPlayerReady:", error);
    return null;
  }
}

export async function listOpenRooms(gameSlug?: string): Promise<RoomDoc[]> {
  try {
    const collection = await getRoomsCollection();
    const mockUsernames = ["Nova", "BoardKing", "Luna", "RookStar"];
    const query: any = {
      status: "waiting",
      "settings.isPrivate": false,
      "players.0.username": { $nin: mockUsernames }
    };
    
    if (gameSlug) {
      query.gameSlug = gameSlug;
    }

    return await collection.find(query).sort({ createdAt: -1 }).toArray();
  } catch (error) {
    console.error("Error in listOpenRooms:", error);
    return [];
  }
}

export async function addSpectator(
  code: string,
  userId: string
): Promise<{ success: boolean; error?: string; room?: RoomDoc }> {
  try {
    const collection = await getRoomsCollection();
    const room = await collection.findOne({ code: code.toUpperCase() });

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    // Check if spectator is already in list
    const specs = room.spectators || [];
    const isAlreadyIn = specs.some((s) => s.userId === userId);
    if (isAlreadyIn) {
      return { success: true, room };
    }

    const user = await getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const newSpectator = {
      userId,
      username: user.username,
      avatar: user.avatar || "/avatars/avatar-placeholder.png",
      isHost: false,
      isReady: false,
    };

    const updatedTime = new Date();
    await collection.updateOne(
      { code: room.code },
      {
        $push: { spectators: newSpectator as any },
        $set: {
          updatedAt: updatedTime,
          expiresAt: new Date(updatedTime.getTime() + 60 * 60 * 1000),
        },
      }
    );

    const updatedRoom = await collection.findOne({ code: room.code });
    return { success: true, room: updatedRoom || undefined };
  } catch (error) {
    console.error("Error in addSpectator:", error);
    return { success: false, error: "Failed to add spectator" };
  }
}

export async function removeSpectator(
  code: string,
  userId: string
): Promise<{ success: boolean; room?: RoomDoc }> {
  try {
    const collection = await getRoomsCollection();
    const room = await collection.findOne({ code: code.toUpperCase() });

    if (!room) {
      return { success: false };
    }

    const specs = room.spectators || [];
    const updatedSpectators = specs.filter((s) => s.userId !== userId);

    const updatedTime = new Date();
    await collection.updateOne(
      { code: room.code },
      {
        $set: {
          spectators: updatedSpectators,
          updatedAt: updatedTime,
          expiresAt: new Date(updatedTime.getTime() + 60 * 60 * 1000),
        },
      }
    );

    const updatedRoom = await collection.findOne({ code: room.code });
    return { success: true, room: updatedRoom || undefined };
  } catch (error) {
    console.error("Error in removeSpectator:", error);
    return { success: false };
  }
}
