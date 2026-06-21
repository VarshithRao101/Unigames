import { getFriendshipsCollection, getUsersCollection, FriendshipDoc, UserDoc } from "../db/collections";
import { getUserByUsername, getUserById } from "./user-service";
import { ObjectId } from "mongodb";

export async function sendFriendRequest(
  fromId: string,
  toUsername: string
): Promise<{ success: boolean; error?: string; request?: FriendshipDoc }> {
  try {
    const requesterId = new ObjectId(fromId);
    const targetUser = await getUserByUsername(toUsername);

    if (!targetUser) {
      return { success: false, error: "Player username not found" };
    }

    const receiverId = targetUser._id;
    if (!receiverId) {
      return { success: false, error: "Invalid player ID" };
    }

    if (fromId === receiverId.toString()) {
      return { success: false, error: "You cannot add yourself as a friend" };
    }

    const friendships = await getFriendshipsCollection();

    // Check if relation already exists (either direction)
    const existing = await friendships.findOne({
      $or: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return { success: false, error: "You are already friends with this player" };
      }
      if (existing.requesterId.toString() === fromId) {
        return { success: false, error: "Friend request is already pending approval" };
      }
      return { success: false, error: "This player has already sent you a friend request" };
    }

    const newFriendship: FriendshipDoc = {
      requesterId,
      receiverId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await friendships.insertOne(newFriendship);
    newFriendship._id = insertResult.insertedId;

    return { success: true, request: newFriendship };
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    return { success: false, error: "Failed to send friend request" };
  }
}

export async function acceptFriendRequest(
  friendshipId: string,
  userId: string
): Promise<boolean> {
  try {
    const friendships = await getFriendshipsCollection();
    const result = await friendships.updateOne(
      {
        _id: new ObjectId(friendshipId),
        receiverId: new ObjectId(userId),
        status: "pending",
      },
      {
        $set: {
          status: "accepted",
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    return false;
  }
}

export async function rejectFriendRequest(
  friendshipId: string,
  userId: string
): Promise<boolean> {
  try {
    const friendships = await getFriendshipsCollection();
    
    // Only the receiver can reject a pending request
    const result = await friendships.deleteOne({
      _id: new ObjectId(friendshipId),
      receiverId: new ObjectId(userId),
      status: "pending",
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error);
    return false;
  }
}

export async function removeFriend(
  friendshipId: string,
  userId: string
): Promise<boolean> {
  try {
    const friendships = await getFriendshipsCollection();
    const userObjectId = new ObjectId(userId);

    // Either player can delete an accepted friendship
    const result = await friendships.deleteOne({
      _id: new ObjectId(friendshipId),
      status: "accepted",
      $or: [
        { requesterId: userObjectId },
        { receiverId: userObjectId },
      ],
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error in removeFriend:", error);
    return false;
  }
}

export async function getFriendsList(userId: string): Promise<UserDoc[]> {
  try {
    const friendships = await getFriendshipsCollection();
    const users = await getUsersCollection();
    const userObjectId = new ObjectId(userId);

    // Find all accepted friendships for user
    const list = await friendships.find({
      status: "accepted",
      $or: [
        { requesterId: userObjectId },
        { receiverId: userObjectId },
      ],
    }).toArray();

    if (list.length === 0) return [];

    // Extract friend IDs
    const friendIds = list.map((f) => 
      f.requesterId.toString() === userId ? f.receiverId : f.requesterId
    );

    // Fetch details of those users
    return await users.find({
      _id: { $in: friendIds },
    }).project<UserDoc>({
      email: 0,
      settings: 0, // Exclude private info
    }).toArray();
  } catch (error) {
    console.error("Error in getFriendsList:", error);
    return [];
  }
}

export async function getPendingRequests(
  userId: string
): Promise<{ incoming: any[]; outgoing: any[] }> {
  try {
    const friendships = await getFriendshipsCollection();
    const users = await getUsersCollection();
    const userObjectId = new ObjectId(userId);

    // Find incoming requests
    const incomingList = await friendships.find({
      receiverId: userObjectId,
      status: "pending",
    }).toArray();

    // Find outgoing requests
    const outgoingList = await friendships.find({
      requesterId: userObjectId,
      status: "pending",
    }).toArray();

    // Map profiles for incoming
    const incoming = await Promise.all(
      incomingList.map(async (req) => {
        const sender = await users.findOne(
          { _id: req.requesterId },
          { projection: { username: 1, avatar: 1, level: 1 } }
        );
        return {
          id: req._id?.toString(),
          sender: sender ? {
            id: sender._id?.toString(),
            username: sender.username,
            avatar: sender.avatar,
            level: sender.level,
          } : null,
          createdAt: req.createdAt,
        };
      })
    );

    // Map profiles for outgoing
    const outgoing = await Promise.all(
      outgoingList.map(async (req) => {
        const receiver = await users.findOne(
          { _id: req.receiverId },
          { projection: { username: 1, avatar: 1, level: 1 } }
        );
        return {
          id: req._id?.toString(),
          receiver: receiver ? {
            id: receiver._id?.toString(),
            username: receiver.username,
            avatar: receiver.avatar,
            level: receiver.level,
          } : null,
          createdAt: req.createdAt,
        };
      })
    );

    return { incoming, outgoing };
  } catch (error) {
    console.error("Error in getPendingRequests:", error);
    return { incoming: [], outgoing: [] };
  }
}
