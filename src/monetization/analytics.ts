"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { TrackedEvent } from "./ad-types";

// Key for storage tracking
const ANALYTICS_STORAGE_KEY = "unigames_analytics_events";

export function logAnalyticsEvent(
  eventName: string,
  category: TrackedEvent["category"],
  label?: string,
  value?: number,
  metadata?: Record<string, any>
) {
  if (typeof window === "undefined") return;

  const newEvent: TrackedEvent = {
    eventName,
    category,
    label,
    value,
    metadata,
    timestamp: Date.now()
  };

  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    const existing: TrackedEvent[] = raw ? JSON.parse(raw) : [];
    
    // Cap historical array size to 200 events for storage sanity
    const capped = [...existing, newEvent].slice(-200);
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(capped));

    // POST event to backend database asynchronously
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    }).catch((err) => {
      console.error("Failed to POST analytics event to backend:", err);
    });

    // Mock console log for developers visibility
    console.log(`[Analytics] Tracked Event: ${eventName}`, newEvent);
  } catch (err) {
    console.error("Failed to append event to local analytics database", err);
  }
}

export function useAnalytics() {
  const pathname = usePathname();

  // Track standard page views automatically on transition
  useEffect(() => {
    if (pathname) {
      logAnalyticsEvent("view_page", "page_view", pathname);
    }
  }, [pathname]);

  return {
    trackAdClick: (slotId: string, sponsorName: string) => {
      logAnalyticsEvent("click_advertisement", "ad_interaction", sponsorName, 1, { slotId });
    },
    trackGameLaunch: (gameId: string, gameName: string) => {
      logAnalyticsEvent("launch_game", "match_event", gameName, 1, { gameId });
    },
    trackRoomCreation: (gameId: string, code: string) => {
      logAnalyticsEvent("create_room", "room_event", code, 1, { gameId });
    },
    trackRoomJoin: (code: string) => {
      logAnalyticsEvent("join_room", "room_event", code, 1);
    },
    trackMatchStart: (matchId: string, gameId: string) => {
      logAnalyticsEvent("start_match", "match_event", matchId, 1, { gameId });
    },
    trackMatchComplete: (matchId: string, winnerId: string) => {
      logAnalyticsEvent("complete_match", "match_event", matchId, 1, { winnerId });
    },
    trackUserInteraction: (buttonId: string, label: string) => {
      logAnalyticsEvent("user_click", "user_action", label, 1, { buttonId });
    }
  };
}
