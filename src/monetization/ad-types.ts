export type AdPlacement =
  | "home_banner"
  | "games_explorer"
  | "category_between"
  | "community_feed"
  | "project_showcase"
  | "match_results"
  | "game_details"
  | "sidebar_area"
  | "footer_sponsored"
  | "upcoming_games";

export type AdProvider = "google_adsense" | "platform_direct" | "custom_network";

export interface AdCreative {
  id: string;
  title: string;
  sponsorName: string;
  imageUrl: string;
  targetUrl: string;
  ctaText?: string;
  description?: string;
}

export interface AdSlotConfig {
  slotId: string;
  placement: AdPlacement;
  provider: AdProvider;
  dimensions: {
    width: number | string;
    height: number | string;
  };
  creativeFallback?: AdCreative;
}

export interface TrackedEvent {
  eventName: string;
  category: "page_view" | "ad_interaction" | "match_event" | "room_event" | "user_action";
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
}
