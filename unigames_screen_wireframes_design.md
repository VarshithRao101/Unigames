# UniGames Screen-by-Screen UI/UX Specifications

This document outlines the detailed layout wireframes, component breakdowns, responsive breakpoint behaviors, and micro-interaction frameworks for every screen in the **UniGames** platform.

---

## 1. Design Visual Baseline

Below is the design mockup representing the visual interface for the **Game Room Lobby**, demonstrating the glassmorphic panels, ready status indicators, and clean layout:

![Lobby UI Mockup](./room_lobby_mockup_1781692444691.png)

---

## 2. Global Layout Grid & Breakpoints

To maintain consistent layouts across all 16 pages, developers should follow this layout guide:

```
  ┌──────────────────────────────────────────────────────────┐
  │                    GLOBAL GRID SYSTEM                    │
  ├───────────────┬───────────────────────────┬──────────────┤
  │ Device Class  │ Canvas Container Width    │ Layout Grid  │
  ├───────────────┼───────────────────────────┼──────────────┤
  │ Mobile        │ 100% fluid (16px margins) │ 1-Column     │
  │ Tablet        │ 720px fixed               │ 2-Column     │
  │ Desktop       │ 1200px / 1440px max-width │ 12-Col Grid  │
  └───────────────┴───────────────────────────┴──────────────┘
```

---

## 3. Detailed Screen Specifications

---

### Screen 1: Landing Page

#### 1. Wireframe Layout (Desktop)
```
┌────────────────────────────────────────────────────────────────────────┐
│ [Logo] UniGames        Explore   Community   Leaderboards    [Login]   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                       PLAY TOGETHER, INSTANTLY.                        │
│             Zero downloads. Pure social multiplayer gaming.             │
│                                                                        │
│                [ Create Quick Room ]   [ Browse Games ]                │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  Featured Games [▶ Active: 12.4K]    Upcoming [░ Roadmap: 65%]         │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐              │
│  │ Ludo Party     │ │ Tic-Tac-Toe    │ │ Chess Royale   │              │
│  │ Active: 3.2k   │ │ Active: 1.1k   │ │ Coming Soon... │              │
│  └────────────────┘ └────────────────┘ └────────────────┘              │
├────────────────────────────────────────────────────────────────────────┤
│  Stats: [142k Matches Played]   [98.4% Server Uptime]   [Level 2.4m XP]│
├────────────────────────────────────────────────────────────────────────┤
│  Platform Roadmap                                                      │
│  [Q1: Alpha Core] ────► [Q2: Friends API] ────► [Q3: 50+ Games Launch] │
├────────────────────────────────────────────────────────────────────────┤
│  Footer: © 2026 UniGames.       Terms | Privacy | Developer Portal     │
└────────────────────────────────────────────────────────────────────────┘
```

#### 2. Responsive Breakpoint Behavior
* **Mobile (320px - 480px)**: The navigation links collapse into a hamburger menu. The Hero CTA buttons stack vertically. The featured games grid changes to a swipeable horizontal card carousel.
* **Tablet (768px - 1024px)**: Columns use a 2-card grid layout. The Hero section uses a smaller display font size (`display-md`).
* **Desktop (1025px+)**: 12-column grid layout. High-contrast typography with spacious padding.

#### 3. UX Reasoning
* Emphasizes immediate player onboarding. The secondary Hero CTA is designed to launch a room instantly, reducing obstacles for new users.

#### 4. Animations & Micro-interactions
* **Hero Text**: Text slides up smoothly on load (`y: [20, 0]`, `duration: 0.8s`).
* **Hover State**: CTA buttons scale up slightly (`1.02x`) with a subtle glow highlight.

---

### Screen 2: Explore Games Page

#### 1. Wireframe Layout (Desktop)
```
┌────────────────────────────────────────────────────────────────────────┐
│ [Search Game...]  [ All ] [ Multiplayer ] [ Card ] [ Strategy ]        │
├────────────────────────────────────────────────────────────────────────┤
│ Active Matches (Live)                                                  │
│ ┌───────────────────────┐ ┌───────────────────────┐                    │
│ │ Ludo Live (4P)        │ │ Speed Chess (2P)      │                    │
│ │ [2.4k playing] [Play] │ │ [980 playing]  [Play] │                    │
│ └───────────────────────┘ └───────────────────────┘                    │
├────────────────────────────────────────────────────────────────────────┤
│ Coming Soon & Community Pipeline                                       │
│ ┌───────────────────────┐ ┌───────────────────────┐                    │
│ │ Trivia Clash          │ │ Battleship Pro        │                    │
│ │ [Progress: 60%] [Vote]│ │ [Progress: 15%] [Vote]│                    │
│ └───────────────────────┘ └───────────────────────┘                    │
└────────────────────────────────────────────────────────────────────────┘
```

#### 2. Responsive Breakpoint Behavior
* **Mobile**: The filter bar converts into a scrollable horizontal menu. The active matches list formats into a single-column layout.
* **Tablet**: Standard 2-column card layout.
* **Desktop**: 3-column card grid for active games, and a 4-column layout for the "Coming Soon" section.

#### 3. UX Reasoning
* Groups active, playable games at the top of the interface to avoid frustrating users with unreleased titles.
* The "Coming Soon" section features community upvote buttons, keeping users engaged with future releases.

#### 4. Animations & Micro-interactions
* **Category Filters**: Clicking a category changes the active background with a sliding indicator animation.
* **Card Upvote**: The upvote button scales up briefly on tap.

---

### Screen 3: Game Details Page

#### 1. Wireframe Layout (Desktop)
```
┌────────────────────────────────────────────────────────────────────────┐
│ ◄ Back to Catalog                                                      │
├────────────────────────────────────────────────────────────────────────┤
│ [============= Game Banner Graphic / Live Gameplay Video ============] │
├────────────────────────────────────────────────────────────────────────┤
│ Ludo Party                                                             │
│ Board Game • 2-4 Players • Avg Playtime: 15 mins                       │
│                                                                        │
│ Roll the dice, move your tokens, and race home.                        │
│                                                                        │
│ [ Create Room ]  [ Matchmaking Queue ]  [ Spectate Match ]             │
├────────────────────────────────────────────────────────────────────────┤
│ Personal Statistics                   High Scores                      │
│ Matches: 42   Wins: 18   XP: 4,200     1. ElitePlayer     48,200 XP    │
│ Win Rate: 43%                         2. ChessMaster     45,100 XP    │
└────────────────────────────────────────────────────────────────────────┘
```

#### 2. Responsive Breakpoint Behavior
* **Mobile**: The layout changes to a single column. The action CTAs stack vertically and are pinned to the bottom of the viewport for easy reach.
* **Tablet**: Split layout featuring stats at the bottom.
* **Desktop**: A 2-column layout displaying the game details and media on the left, and statistics and leaderboards on the right.

#### 3. UX Reasoning
* Consolidates all launch options (Custom Room, Matchmaking, Spectate) in one prominent action center.
* Highlights the user's personal game history, encouraging repeat play.

#### 4. Animations & Micro-interactions
* **Play Button Hover**: The play button features a slow-pulsing background highlight.
* **Launch Trigger**: Transitioning to matchmaking initiates a full-width overlay loader.

---

### Screen 4: User Profile Page

#### 1. Wireframe Layout (Desktop)
```
┌────────────────────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ (Avatar)  User: ProGamer99         │ │ Level 18 [=========>] 85%   │ │
│ │ Bio: Casually competitive...       │ │ Total XP: 148,500           │ │
│ │ Join Date: Feb 2026                │ │ Badges: [🥇] [🥈] [💎]      │ │
│ └────────────────────────────────────┘ └─────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ Match History                         Friends List                     │
│ ┌──────────────────────────────────┐  ┌──────────────────────────────┐ │
│ │ Ludo Party • Won • +120XP  [1h ago]│  │ Friend1 [● Online] [Invite]  │ │
│ │ Chess      • Lost • +30XP  [2h ago]│  │ Friend2 [○ Offline]          │ │
│ └──────────────────────────────────┘  └──────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### 2. Responsive Breakpoint Behavior
* **Mobile**: Tabs display sequentially (Profile Card -> Stats Dashboard -> Match History -> Friends List).
* **Tablet**: Two-column layout pairing profile stats and match history.
* **Desktop**: Multi-column dashboard with all panels visible.

#### 3. UX Reasoning
* Groups key statistics (Level, XP, Badges) at the top of the interface for a clean layout.
* Includes a quick "Invite" button next to online friends to simplify room invitations.

#### 4. Animations & Micro-interactions
* **XP Progress Bar**: Animates from 0% to the current value when the page is loaded.
* **Friend Cards**: Hovering over offline friends reveals their last-active timestamp.

---

### Screen 5: Leaderboards Page

#### 1. Wireframe Layout (Desktop)
```
┌────────────────────────────────────────────────────────────────────────┐
│ Global Leaderboard   [ Global ] [ Weekly ] [ Game: Chess ]             │
├────────────────────────────────────────────────────────────────────────┤
│               [2] Player2            [1] Player1         [3] Player3   │
│                142k XP                180k XP             110k XP      │
│                ┌─────┐                ┌─────┐             ┌─────┐      │
│                │     │                │     │             │     │      │
├────────────────┴─────┴────────────────┴─────┴─────────────┴─────┴──────┤
│ 4. Rank4Player                 Level 42                98,400 XP       │
│ 5. Rank5Player                 Level 38                92,100 XP       │
└────────────────────────────────────────────────────────────────────────┘
```

#### 2. Responsive Breakpoint Behavior
* **Mobile**: The top-3 podium layout is simplified to a stacked vertical layout. Row data collapses to show only usernames and XP values.
* **Tablet**: Standard podium layout.
* **Desktop**: Displays the top-3 podium prominently, followed by a list of subsequent ranks.

#### 3. UX Reasoning
* Visualizes the top 3 players on a podium to emphasize high achievement.
* Dropdown filters allow users to quickly toggle between global and game-specific stats.

#### 4. Animations & Micro-interactions
* **Podium Load**: Podiums animate upward to different heights on load.
* **Row Hover**: Hovering over leaderboard rows highlights them with a soft grey background (`#F8F9FA`).

---

### Screen 6: Room Lobby System

#### 1. Wireframe Layout (Desktop)
```
┌────────────────────────────────────────────────────────────────────────┐
│ Game: Ludo Party  •  Room Code: AX49D   [Copy Link]                    │
├────────────────────────────────────────────────────────────────────────┤
│ Players (2/4)                         Lobby Chat                       │
│ ┌──────────────────────────────────┐  ┌──────────────────────────────┐ │
│ │ (Avatar) HostUser   [Host]       │  │ System: Room created.        │ │
│ │ (Avatar) PlayerTwo  [Ready]      │  │ Host: Hello! Ready to start? │ │
│ │ (Avatar) [Open Slot]             │  │                              │ │
│ │ (Avatar) [Open Slot]             │  │                              │ │
│ └──────────────────────────────────┘  └──────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ [ Spectator Mode: ON ]                [ Cancel ]  [ Start Match ]      │
└────────────────────────────────────────────────────────────────────────┘
```

#### 2. Responsive Breakpoint Behavior
* **Mobile**: The workspace shifts to a tabbed view (Lobby List -> Chat Room). The action buttons are pinned to the bottom.
* **Tablet**: Stacked layout with the chat module moved underneath the player grid.
* **Desktop**: A balanced two-column layout.

#### 3. UX Reasoning
* Displays open slots clearly to encourage players to invite friends.
* The room code and invitation link are placed at the top for quick copying.

#### 4. Animations & Micro-interactions
* **Ready Toggle**: Ready flags toggle between grey ("Waiting") and green ("Ready") states.
* **Chat Message**: New messages slide in from the bottom with a short fade transition.

---

### Screen 7: Community Page

#### 1. Wireframe Layout (Desktop)
```
┌────────────────────────────────────────────────────────────────────────┐
│ Community Forum                        [ New Suggestion ]              │
├────────────────────────────────────────────────────────────────────────┤
│ Suggestions & Feature Requests                                         │
│ ┌──────────────────────────────────────────────────────────┬─────────┐ │
│ │ Add 8-Player Room Size to Ludo Party                     │  [^] 84 │ │
│ │ Suggested by UserX • Category: Game Modes • Status: Open │  [v]    │ │
│ └──────────────────────────────────────────────────────────┴─────────┘ │
│ ┌──────────────────────────────────────────────────────────┬─────────┐ │
│ │ Keyboard Shortcuts config in Settings                    │  [^] 62 │ │
│ │ Suggested by UserY • Category: Accessibility•Planned      │  [v]    │ │
│ └──────────────────────────────────────────────────────────┴─────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### 2. Responsive Breakpoint Behavior
* **Mobile**: The upvote widget is placed below the post title to maximize horizontal space. The search and filter options collapse into a sliding menu.
* **Tablet**: Standard grid layout.
* **Desktop**: Large-format layout with sidebars listing top-ranked requests and popular tags.

#### 3. UX Reasoning
* Upvote buttons are placed on the right of each row for consistent, clean navigation.
* Displays status badges (e.g., Open, Planned, Implemented) clearly to show active community development.

#### 4. Animations & Micro-interactions
* **Vote Click**: Clicking upvote increments the counter instantly, accompanied by a subtle amber color shift.

---

### Screen 8: Settings Page

#### 1. Wireframe Layout (Desktop)
```
┌────────────────────────────────────────────────────────────────────────┐
│ Settings                                                               │
├───────────────┬────────────────────────────────────────────────────────┤
│ [⚙ Account]   │ Edit Profile                                           │
│ [🔒 Privacy]   │ Username: [ ProGamer99       ]                         │
│ [🔔 Alerts]    │ Bio:      [ Casually competitive...                  ] │
│ [🎨 Theme]     │                                                        │
│               │ Notification Preferences                               │
│               │ [x] Receive Friend Invites                             │
│               │ [ ] Receive Email Newsletters                          │
│               │                                                        │
│               │ [ Save Changes ]                                       │
└───────────────┴────────────────────────────────────────────────────────┘
```

#### 2. Responsive Breakpoint Behavior
* **Mobile**: The sidebar menu converts into a dropdown selector. The configuration options are displayed below the selector.
* **Tablet**: Standard layout.
* **Desktop**: Two-column layout with category links on the left and form options on the right.

#### 3. UX Reasoning
* Consolidates settings categories into a clean, simple layout.
* Avoids multi-page forms, keeping configuration options quick and easy to edit.

#### 4. Animations & Micro-interactions
* **Category Toggle**: Swapping tabs runs a smooth fade-in animation on the right panel.
* **Save Confirmation**: Clicking "Save" displays a brief toast notification.

---

### Screen 9: Notifications Page

#### 1. Wireframe Layout (Desktop)
```
┌────────────────────────────────────────────────────────────────────────┐
│ Notifications                                     [ Mark all as read ] │
├────────────────────────────────────────────────────────────────────────┤
│ Recent Alerts                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 🔔 Friend Request: UserA wants to add you.   [Accept]  [Ignore]    │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │ 🎮 Game Invite: UserB invites you to Ludo.   [Join Room]           │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │ 🏆 Achievement: Unlocked "First Victory!"                           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### 2. Responsive Breakpoint Behavior
* **Mobile**: Action buttons expand to take up full horizontal space.
* **Tablet**: Standard list layout.
* **Desktop**: List layout with secondary sidebars showing upcoming matches.

#### 3. UX Reasoning
* Groups actionable alerts (like friend requests and lobby invites) at the top of the feed to help users react quickly.

#### 4. Animations & Micro-interactions
* **Clear Animation**: Clearing a notification slides the row out of view and fades it to 0% opacity.

---

### Screen 10: Coming Soon Card System

```
  ┌──────────────────────────────────────────────────────────┐
  │ COMING SOON CARD WIREFRAME                               │
  ├──────────────────────────────────────────────────────────┤
  │ ┌──────────────────────────────────────────────────────┐ │
  │ │ [Category] Tag                                       │ │
  │ │                                                      │ │
  │ │                    Trivia Clash                      │ │
  │ │                                                      │ │
  │ │  Status: Active Coding                               │ │
  │ │  Progress: [=====================>           ] 65%   │ │
  │ │                                                      │ │
  │ │  Release Window: Q3 2026                             │ │
  │ │  Developers: Team Alpha                              │ │
  │ │                                                      │ │
  │ │  [ Follow Updates ]                                  │ │
  │ └──────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────┘
```

#### Component Breakdown
* **Category Tag**: Small, upper-left text indicator in grey capital letters (e.g. `CARD GAME`).
* **Game Name**: Displayed in Outfit Bold.
* **Status**: A clean, readable tag showing the current stage of development.
* **Progress Bar**: An outline bar with a yellow fill to visualize current project completion.
* **Details**: Lists the developer team and estimated release window.
* **CTA Button**: A secondary outline button labeled "Follow Updates".

#### UX Reasoning
* Dotted borders and clear progress bars manage player expectations transparently.
* The "Follow Updates" option keeps users engaged with future releases.

---

## 4. Key Platform Interaction Flows

### User Flow A: Quick Match Matchmaking
```
 [Explore Page] ──► Click "Play Match" ──► Open Matchmaking overlay
                                                    │
                                                    ▼
 Show Pulsing Search Indicator ◄── Match found (WebSockets trigger)
            │
            ▼
 Transition to Active Game Session
```

### User Flow B: Suggestion Submission & Upvote Loop
```
 [Community Forum] ──► Click "New Suggestion" ──► Input Idea Form
                                                          │
                                                          ▼
 Increment Upvote Score ◄── Click "Upvote" ◄── Post in Suggestions Feed
```
