# UniGames Frontend Architecture & Development Blueprint

This document specifies the industry-standard frontend folder structures, component API design, layout systems, state management protocols, and development guidelines for **UniGames** to support a library of 50+ games and real-time multiplayer lobbies.

---

## 1. Next.js App Router Folder Structure

We use a modular, domain-driven directory structure built on the Next.js App Router pattern:

```
src/
├── app/                    # Next.js App Router Routing Layer
│   ├── (public)/           # Unauthenticated Marketing Pages
│   │   ├── about/
│   │   ├── contact/
│   │   └── page.tsx        # Landing Page
│   ├── (auth)/             # Identity Management
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/        # Main Logged-In Portal
│   │   ├── explore/
│   │   ├── leaderboards/
│   │   ├── community/
│   │   ├── settings/
│   │   └── profile/
│   ├── (game)/             # Real-Time Game Engine Frames
│   │   └── rooms/[code]/
│   ├── layout.tsx          # Root Layout (Providers, ToastContainer)
│   └── error.tsx           # Global Error boundary
├── components/             # Reusable UI Component Library
│   ├── ui/                 # ShadCN Base Elements (Buttons, Inputs)
│   ├── common/             # Global Components (Navbar, Sidebar)
│   ├── game/               # Game Room & Placeholder Components
│   └── profile/            # Statistics, History, & Badges Modules
├── hooks/                  # Custom React Hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   ├── useRoom.ts
│   └── useMatchmaker.ts
├── context/                # Context Providers
│   ├── SocketContext.tsx   # WebSocket Client Connection Wrapper
│   └── ThemeContext.tsx
├── services/               # Stateless API Gateway Callers
│   ├── api.ts              # Axios / Fetch client
│   └── socket.ts           # Centrifugo / Socket.io clients
├── types/                  # TypeScript Types & Interfaces
│   ├── index.ts
│   ├── user.ts
│   ├── game.ts
│   └── lobby.ts
├── utils/                  # Helper Functions
│   └── cn.ts               # Tailwind Class Merger (clsx + tailwind-merge)
└── styles/                 # Global styling
    └── globals.css
```

---

## 2. Global Component API & Prop Contracts

To ensure strict type safety across all components, developers must implement components matching the following API contracts.

### 1. Tactile Button Component (`@/components/ui/button.tsx`)
```typescript
import { ButtonHTMLAttributes, ReactNode } from "react";
import { VariantProps } from "class-variance-authority";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// buttonVariants CVA configuration details:
// - primary: "bg-brand-amber text-slate-dark shadow-[0_4px_0_#FF8F00] active:translate-y-1 active:shadow-none"
// - secondary: "bg-grey-surface border border-grey-border text-slate-dark hover:bg-grey-border"
// - glass: "bg-white/40 backdrop-blur-md border border-white/50 text-slate-dark hover:bg-white/60"
```

### 2. Scalable Game Card Component (`@/components/game/game-card.tsx`)
Designed to support 50+ games with distinct progress meters and action overlays.
```typescript
export type GameStatus = "active" | "alpha_testing" | "prototyping" | "coming_soon";

export interface GameCardProps {
  id: string;
  slug: string;
  name: string;
  thumbnailUrl: string;
  category: string;
  multiplayerType: string;
  status: GameStatus;
  progressPercent: number; // 0 to 100
  releaseWindow?: string; // e.g. "Q4 2026"
  developerName: string;
  tags: string[];
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onLaunchGame?: (id: string) => void;
}
```

### 3. Hexagonal Achievement Badge (`@/components/profile/achievement-badge.tsx`)
```typescript
export interface AchievementBadgeProps {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  xpValue: number;
  unlockedAt?: string; // ISO String, empty indicates locked
  difficulty: "common" | "rare" | "epic" | "legendary";
}
```

---

## 3. App Router Layout Tree & Nesting Rules

Next.js layouts are nested hierarchically to prevent unnecessary page re-renders:

```
[ Root Layout ] (Shared Toast notification manager, Auth listener)
       │
       ├─► [ Public Layout ] (General Nav, Footer)
       │         └─► Landing, About, Contact
       │
       ├─► [ Dashboard Layout ] (Collapsible Friends Sidebar, Profile Navigation)
       │         └─► Explore, Leaderboards, Settings, Profiles
       │
       └─► [ Game Layout ] (Fullscreen immersive mode, Chat Drawer Overlay)
                 └─► Room Lobbies, Active Canvas Frames
```

---

## 4. Multi-Layered State Management Strategy

To ensure optimal performance under heavy real-time traffic, the platform uses a tiered state management approach:

```
                  ┌─────────────────────────────────┐
                  │      STATE ARCHITECTURE         │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Server State   │       │ Global UI State │       │ Ephemeral State │
│  (React Query)  │       │    (Zustand)    │       │  (WebSockets)   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ - User Profile  │       │ - Friend Drawer │       │ - Ludo Lobby    │
│ - Game Catalog  │       │ - Theme Config  │       │ - Player Grid   │
│ - Leaderboards  │       │ - Auth Status   │       │ - Chat Rooms    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **Server State (TanStack Query)**: Handles all HTTP GET data. Provides automatic query caching, background data refetching, and query invalidation upon updates.
2. **Global Client State (Zustand)**: A lightweight, fast state manager that handles UI flags (such as whether the friends drawer is open, or current theme settings).
3. **Ephemeral State (React Context + WebSockets)**: Manages real-time data within active lobbies. Bypasses normal database read/write cycles to synchronize quick coordinates and ready statuses.

---

## 5. Responsive Breakpoint Standards

Tailwind CSS styles are configured to scale across all viewports:

```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '480px',    // Mobile Portrait / Landscape transition
      'md': '768px',    // Tablet layouts
      'lg': '1024px',   // Small laptops
      'xl': '1280px',   // Desktop views
      '2xl': '1536px',  // Large desktops
      'uw': '1920px',   // Ultra-wide displays & TV modes
    }
  }
}
```

---

## 6. Framer Motion Animation Standards

Animations must run at 60 FPS by using hardware-accelerated attributes (`opacity`, `transform`, `scale`).

### 1. Standard Easing Tokens
* **Elastic / Tactile Transition**: `type: "spring", stiffness: 300, damping: 20`
* **Linear Fade Transition**: `ease: "easeInOut", duration: 0.2`

### 2. Page Transition Animation Wrapper
```typescript
export const pageTransitionVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: "easeIn" } }
};
```

---

## 7. Accessibility & Keyboard Navigation Specifications

To meet WCAG 2.1 AA guidelines, developers must implement the following accessibility behaviors:

* **Keyboard Traps**: Within room lobbies and modals, focus must remain trapped inside the modal container. Use libraries like `@radix-ui/react-focus-scope` to manage focus cycles.
* **Aria Attributes**: Interactive elements must include proper labels (e.g. `<button aria-label="Toggle Friends Sidebar">`).
* **Visual Focus Indicator**: Active focusable elements must feature a clear outline rings (`focus-visible:ring-2 focus-visible:ring-brand-amber`).
* **Dynamic Announcements**: Screen readers should announce important real-time events (like new chat messages or player invites) using `aria-live="polite"` regions.

---

## 8. Coding Standards & Development Guidelines

### 1. Naming Conventions
* **Directories & Files**: `kebab-case` (e.g. `src/components/game-card.tsx`).
* **React Components**: `PascalCase` (e.g. `export function LeaderboardPodium() {}`).
* **TypeScript Types & Interfaces**: `PascalCase` prefixed with domain details (e.g. `interface UserProfile {}`).
* **Utility Constants**: `SCREAMING_SNAKE_CASE` (e.g. `export const MAX_LOBBY_PLAYERS = 4;`).

### 2. Import Organization Rules
Imports must be organized cleanly using absolute path aliases:
```typescript
// 1. External Third-party packages
import { useState } from "react";
import { motion } from "framer-motion";

// 2. Shared Common UI elements
import { Button } from "@/components/ui/button";

// 3. Local Hooks and Utility Functions
import { useRoom } from "@/hooks/useRoom";
import { cn } from "@/utils/cn";
```

### 3. Code Optimization & Dynamic Loading
To keep load times fast as the game library scales past 50+ games, developers must dynamically load active game frames on demand:
```typescript
import dynamic from "next/dynamic";

const ChessEngine = dynamic(() => import("@/components/game/engines/chess"), {
  loading: () => <GameLoadingSkeleton />,
  ssr: false, // Bypasses server-side rendering for game canvas frames
});
```
This ensures the main application bundle size remains small and fast, loading game engines only when a user joins a lobby.
