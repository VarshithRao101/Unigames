import { AdPlacement, AdSlotConfig, AdCreative } from "./ad-types";

// Prohibited zones mapping to prevent negative gaming experiences
export const PROHIBITED_PATHS = [
  /^\/checkout/,             // Payment windows
  /^\/payment/
];

/**
 * Validates path name safety policies before rendering ad units.
 */
export function isAdPlacementAllowed(pathname: string): boolean {
  if (!pathname) return true;
  return !PROHIBITED_PATHS.some((regex) => regex.test(pathname));
}

// Premium Direct Platform Sponsors database
export const PLATFORM_SPONSOR_CREATIVES: Record<string, AdCreative[]> = {
  home_banner: [
    {
      id: "sp1",
      title: "GeForce NOW RTX Ultimate",
      sponsorName: "NVIDIA",
      imageUrl: "♟️ Boost your gameplay to 240 FPS now.",
      targetUrl: "https://nvidia.com",
      ctaText: "Stream Now",
      description: "Experience GeForce RTX gaming in high resolutions on any device."
    }
  ],
  game_details: [
    {
      id: "sp2",
      title: "Mechanical Keyboards Pro",
      sponsorName: "Keychron",
      imageUrl: "⌨ Upgrade to hot-swappable switches today.",
      targetUrl: "https://keychron.com",
      ctaText: "Browse Collection",
      description: "Custom mechanical keyboards designed for tactile precision."
    }
  ],
  footer_sponsored: [
    {
      id: "sp3",
      title: "Scalable Game Databases",
      sponsorName: "Supabase",
      imageUrl: "⚡ Postgres database with real-time sockets.",
      targetUrl: "https://supabase.com",
      ctaText: "Get Started"
    }
  ]
};

// Available slot configs mapping dimensions to prevent CLS (Cumulative Layout Shift)
export const AD_SLOTS_DIRECTORY: Record<AdPlacement, AdSlotConfig> = {
  home_banner: {
    slotId: "div-gpt-ad-home-banner",
    placement: "home_banner",
    provider: "google_adsense",
    dimensions: { width: "100%", height: 90 },
    creativeFallback: PLATFORM_SPONSOR_CREATIVES.home_banner[0]
  },
  games_explorer: {
    slotId: "div-gpt-ad-explorer-mid",
    placement: "games_explorer",
    provider: "platform_direct",
    dimensions: { width: "100%", height: 120 }
  },
  category_between: {
    slotId: "div-gpt-ad-category-split",
    placement: "category_between",
    provider: "google_adsense",
    dimensions: { width: "100%", height: 90 }
  },
  community_feed: {
    slotId: "div-gpt-ad-feed",
    placement: "community_feed",
    provider: "custom_network",
    dimensions: { width: "100%", height: 180 }
  },
  project_showcase: {
    slotId: "div-gpt-ad-showcase",
    placement: "project_showcase",
    provider: "platform_direct",
    dimensions: { width: 300, height: 250 }
  },
  match_results: {
    slotId: "div-gpt-ad-results",
    placement: "match_results",
    provider: "google_adsense",
    dimensions: { width: "100%", height: 90 }
  },
  game_details: {
    slotId: "div-gpt-ad-details-side",
    placement: "game_details",
    provider: "platform_direct",
    dimensions: { width: 300, height: 600 },
    creativeFallback: PLATFORM_SPONSOR_CREATIVES.game_details[0]
  },
  sidebar_area: {
    slotId: "div-gpt-ad-sidebar",
    placement: "sidebar_area",
    provider: "google_adsense",
    dimensions: { width: 160, height: 600 }
  },
  footer_sponsored: {
    slotId: "div-gpt-ad-footer",
    placement: "footer_sponsored",
    provider: "platform_direct",
    dimensions: { width: "100%", height: 60 },
    creativeFallback: PLATFORM_SPONSOR_CREATIVES.footer_sponsored[0]
  },
  upcoming_games: {
    slotId: "div-gpt-ad-upcoming",
    placement: "upcoming_games",
    provider: "custom_network",
    dimensions: { width: 300, height: 250 }
  }
};
