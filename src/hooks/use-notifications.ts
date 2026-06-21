import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { getPusherClient } from "@/lib/pusher";

export interface NotificationItem {
  id: string;
  type: "friend_request" | "room_invite" | "match_invite" | "match_result" | "achievement" | "system" | "announcement";
  title: string;
  message: string;
  link?: string;
  time: string;
  isRead: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data || []);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const markRead = useCallback(async (id: string) => {
    if (!user?.id) return;
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, [user?.id]);

  const markAllRead = useCallback(async () => {
    if (!user?.id) return;
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "readAll" }),
      });
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, [user?.id]);

  const clearAll = useCallback(async () => {
    if (!user?.id) return;
    // Optimistic UI update
    setNotifications([]);
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  }, [user?.id]);

  // Initial fetch on mount / user change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to real-time events via Pusher client
  useEffect(() => {
    if (!user?.id) return;

    let pusherClient: any;
    let channel: any;
    const channelName = `private-user-${user.id}`;

    try {
      pusherClient = getPusherClient();
      channel = pusherClient.subscribe(channelName);
      
      channel.bind("notification-received", (data: NotificationItem) => {
        setNotifications((prev) => {
          // Avoid duplicate items if trigger fired twice
          if (prev.some((n) => n.id === data.id)) return prev;
          return [data, ...prev];
        });
      });
    } catch (err) {
      console.error("Failed to subscribe to Pusher notifications:", err);
    }

    return () => {
      if (pusherClient && channel) {
        channel.unbind_all();
        pusherClient.unsubscribe(channelName);
      }
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    clearAll,
    refresh: fetchNotifications,
  };
}
