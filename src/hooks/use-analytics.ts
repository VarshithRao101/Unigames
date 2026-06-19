"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function useAnalytics() {
  const pathname = usePathname();
  const { user } = useAuth();

  const trackEvent = useCallback(
    (eventName: string, properties: Record<string, any> = {}) => {
      const payload = {
        event: eventName,
        properties: {
          ...properties,
          path: pathname,
          timestamp: new Date().toISOString(),
          userId: user?.id || "anonymous",
          username: user?.username || "anonymous",
        },
      };

      // In production, sync with telemetry APIs (e.g. Vercel Analytics, GA, Mixpanel)
      if (process.env.NODE_ENV === "development") {
        console.log(`[Telemetry Log]: ${eventName}`, payload);
      } else {
        // Send payload to an endpoint
        fetch("/api/telemetry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    },
    [pathname, user]
  );

  const trackClick = useCallback(
    (targetId: string, itemType: string) => {
      trackEvent("UI_CLICK_EVENT", { targetId, itemType });
    },
    [trackEvent]
  );

  return { trackEvent, trackClick };
}
