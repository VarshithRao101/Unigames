import { LobbyRoom } from "@/data/platform";

const STORAGE_KEY = "unigames-created-rooms";

export function createRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function loadCreatedRooms() {
  if (typeof window === "undefined") {
    return [] as LobbyRoom[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [] as LobbyRoom[];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LobbyRoom[]) : ([] as LobbyRoom[]);
  } catch {
    return [] as LobbyRoom[];
  }
}

export function saveCreatedRoom(room: LobbyRoom) {
  if (typeof window === "undefined") {
    return;
  }

  const currentRooms = loadCreatedRooms().filter((item) => item.code !== room.code);
  const nextRooms = [room, ...currentRooms].slice(0, 12);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRooms));
}

export function deleteCreatedRoom(code: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const nextRooms = parsed.filter((r: LobbyRoom) => r.code !== code);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRooms));
    }
  } catch (err) {
    console.error("Error deleting created room:", err);
  }
}

export function mergeRooms(primaryRooms: LobbyRoom[], secondaryRooms: LobbyRoom[]) {
  const seen = new Set<string>();
  const merged: LobbyRoom[] = [];

  for (const room of [...primaryRooms, ...secondaryRooms]) {
    if (seen.has(room.code)) {
      continue;
    }

    seen.add(room.code);
    merged.push(room);
  }

  return merged;
}
