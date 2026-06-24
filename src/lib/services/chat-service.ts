import { getChatCollection, ChatMessageDoc } from "../db/collections";

export async function saveMessage(
  channel: string,
  userId: string,
  username: string,
  avatar: string | undefined,
  text: string
): Promise<ChatMessageDoc | null> {
  try {
    const collection = await getChatCollection();
    const message: ChatMessageDoc = {
      channel,
      sender: {
        userId,
        username,
        avatar,
      },
      text,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(message);
    return {
      ...message,
      _id: result.insertedId,
    };
  } catch (error) {
    console.error("Error in saveMessage:", error);
    return null;
  }
}

export async function getRecentMessages(
  channel: string,
  limit = 50
): Promise<ChatMessageDoc[]> {
  try {
    const collection = await getChatCollection();
    return await collection
      .find({ channel })
      .sort({ createdAt: 1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error("Error in getRecentMessages:", error);
    return [];
  }
}
