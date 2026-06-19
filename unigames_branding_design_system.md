# UniGames Brand Guidelines & UI Design System

This document establishes the comprehensive visual identity, typography system, component tokens, user experience philosophy, and branding specifications for **UniGames**—designed to feel modern, clean, premium, and startup-focused.

---

## 1. Visual Brand Mockup

Below is the generated brand mockup visualizing the combination of warm amber-yellow, premium slate grey, and clean white, utilizing soft glassmorphic layers and minimalist controls:

![Brand Identity Mockup](./brand_identity_mockup_1781692392982.png)

---

## 2. UI Philosophy: "The Social Lounge"

Unlike typical gaming platforms that use dark themes, heavy neon colors, and crowded layouts, UniGames adopts **"The Social Lounge"** design philosophy. It treats digital gaming like a modern, well-lit physical board game café:

* **Minimalism Over Complexity**: Focus on clear interfaces, generous whitespace, and sharp content presentation.
* **Warm Social Prominence**: A color scheme that highlights warm tones and friendly typography.
* **Tactile Interactions**: Uses subtle shadows and smooth transitions to make elements feel physical and responsive.
* **Non-Disruptive Immersion**: Games launch in clean overlays, letting users stay connected to chat rooms, notifications, and friends lists without interruption.

---

## 3. Visual Moodboard & Design Elements

```
   ┌──────────────────────────────────────────────────────────┐
   │                    VISUAL MOODBOARD                      │
   ├────────────────────────────┬─────────────────────────────┤
   │ Interface Paradigm         │ Soft Neumorphism & Glass    │
   │ Typography Tone            │ Energetic Geometric / Clean │
   │ Depth & Layering           │ Soft shadows, blur backdrops│
   │ Animation Feel             │ Natural elastic easing      │
   └────────────────────────────┴─────────────────────────────┘
```

* **Interface Paradigm**: Inspired by modern tools like Linear, Pitch, and Airbnb. Displays clean panels, thin borders, and solid backgrounds instead of bright neon styling.
* **Photography & Imagery Style**: High-contrast, clean 3D clay illustrations with warm lighting. Avoids hyper-realistic, dark, or violent graphics.
* **Depth & Layering**: Panels use soft drop shadows to float over a clean, warm background.

---

## 4. Typography System

We use Google Fonts to build a clean, readable text hierarchy:
* **Primary Title Font**: **Outfit** (Geometric, warm, friendly).
* **UI & Body Font**: **Inter** (Clean, neutral, and highly readable in interfaces).

### Typography Scale (Base 16px)

| Token Name | Font | Size (rem) | Size (px) | Weight | Line Height | Case / Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `display-xl` | Outfit | 3.5rem | 56px | 800 (ExtraBold) | 1.1 | -0.02em |
| `h1` | Outfit | 2.5rem | 40px | 700 (Bold) | 1.2 | -0.01em |
| `h2` | Outfit | 1.75rem | 28px | 700 (Bold) | 1.25 | -0.01em |
| `h3` | Outfit | 1.25rem | 20px | 600 (SemiBold) | 1.3 | 0 |
| `body-lg` | Inter | 1.125rem| 18px | 400 (Regular) | 1.5 | 0 |
| `body-md` | Inter | 1.0rem | 16px | 400 (Regular) | 1.5 | 0 |
| `body-sm` | Inter | 0.875rem| 14px | 500 (Medium) | 1.4 | +0.01em |
| `button-lg` | Inter | 1.0rem | 16px | 600 (SemiBold) | 1.0 | +0.02em (Caps) |
| `label-sm` | Inter | 0.75rem | 12px | 700 (Bold) | 1.0 | +0.05em (All-Caps) |

---

## 5. Color System & Accessibility Matrix

Our color system uses primary warm amber-yellow paired with a neutral grey scale. This combination avoids typical dark gaming themes to make the platform feel accessible and inviting.

```
       #FFC107             #212529             #F8F9FA
  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
  │  Warm Amber   │   │  Slate Dark   │   │  Soft Light   │
  │   (Primary)   │   │ (Typography)  │   │ (Backgrounds) │
  └───────────────┘   └───────────────┘   └───────────────┘
```

### Palette Tokens

```yaml
ColorPalette:
  Primary:
    Brand-Amber: "#FFC107"  # Core primary accent
    Brand-Light: "#FFE082"  # Hover accent
    Brand-Dark:  "#FF8F00"  # Active/Press accent
  Neutral:
    Slate-Dark:  "#212529"  # Core text and dark headers
    Slate-Muted: "#495057"  # Secondary labels & system icons
    Grey-Border: "#E9ECEF"  # Standard dividers & frame outlines
    Grey-Surface:"#F1F3F5"  # Card layers and page backdrops
    Grey-Light:  "#F8F9FA"  # Outer canvas page wrapper
    White:       "#FFFFFF"  # Primary card background
  System:
    Success:     "#2B8A3E"  # Emerald green (Lobby active, ready state)
    Warning:     "#E67E22"  # Amber orange (Alpha testing state)
    Danger:      "#C92A2A"  # Brick red (Errors, disconnected state)
    Info:        "#1971C2"  # Sky blue (System announcements)
```

### Accessibility Compliance Rules
* **Text Contrast**: Dark text (`#212529`) must always be used on white (`#FFFFFF`) or light grey (`#F8F9FA`) backgrounds to meet WCAG AA compliance (4.5:1 ratio).
* **Primary Button Contrast**: White text (`#FFFFFF`) must not be placed directly on the Brand-Amber (`#FFC107`) background. Instead, use Slate-Dark (`#212529`) text on Amber buttons to ensure clear readability.

---

## 6. Ten Unique Logo Concepts

These concepts combine gaming symbols with community themes using a warm yellow and grey palette.

```
  [01] Unified Loop     [02] UniPortal        [03] Constellation    [04] The Play U
     ( )---( )             ┌──────┐                 *--*                | \   / |
      \   /                │  /\  │                /    \               |  \_/  |
       (_)                 └──────┘               *------*              └───────┘
```

1. **The Unified Loop (U-Loop)**: Two interlocking rings forming a stylized 'U'. The overlapping intersection uses warm yellow to symbolize where community and play meet.
2. **The Portal (UniPortal)**: A soft glassmorphic hexagon featuring a bright yellow core. This design represents a portal to the social games lobby.
3. **The Constellation**: A geometric network of grey and white nodes connected by thin yellow lines. It forms a subtle controller pattern, highlighting community play.
4. **The Play U**: A modern geometric 'U' with dual d-pad markings debossed inside. A simple design that works well as a mobile application icon.
5. **The Guild Crest**: A flat shield shape featuring a split yellow-grey color scheme and an amber star badge in the center. Symbolizes a cozy, safe gaming hub.
6. **The Hexa-Gate**: A hexagonal frame encasing a stylized d-pad controller and community rings.
7. **The Hive**: A cluster of hexagonal cells forming a 'U'. Features yellow accents, representing community gaming.
8. **The Pivot**: Kinetic diagonal blocks that slide together to form a console button.
9. **The Social D-Pad**: Four curved nodes merging into a center point, symbolizing player aggregation.
10. **The Catalyst**: A minimalist grey box split by a yellow slash, representing instant game lobby launching.

---

## 7. Component Architecture & Design System Specification

### 1. Button System
Buttons use subtle neumorphic shadows to feel tactile and interactive:

```
  [ Primary Amber ]        [ Secondary Slate ]      [ Glassmorphic ]
  ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
  │ Play Now   (▶)│        │ Rooms List    │        │ Spectate   (👁)│
  └───────────────┘        └───────────────┘        └───────────────┘
```

* **Primary Button**: Solid `#FFC107` background with `#212529` text. Uses a subtle bottom shadow (`0px 4px 0px #FF8F00`) to create a physical button look. On hover, the button slides down slightly with a smooth transition.
* **Secondary Button**: Solid `#F1F3F5` grey background with `#212529` text. Outlined with a thin border (`1px solid #E9ECEF`).
* **Glassmorphic Button**: Semi-transparent background (`rgba(255, 255, 255, 0.4)`) with a backdrop blur (`backdrop-filter: blur(10px)`). Framed with a thin white border (`1px solid rgba(255, 255, 255, 0.5)`).

### 2. Cards Grid System

#### Game Cards (Active Catalog)
* **Design**: Soft white base card featuring a thin border (`1px solid #E9ECEF`) and rounded corners (`border-radius: 16px`).
* **Hover State**: Slides up slightly on hover (`transform: translateY(-4px)`) and gains a soft drop shadow (`box-shadow: 0 12px 24px rgba(33, 37, 41, 0.06)`).
* **Overlay**: A clean top-right badge showing the status (e.g., active player counts).

#### Coming Soon / Placeholder Cards
```
  ┌─────────────────────────────────┐
  │ [Category]         [Upvotes: 89]│
  │                                 │
  │         Chess Online            │
  │     [Progress: ░░░░░░░░ 35%]    │
  │                                 │
  │    Estimated Release: Q4 2026   │
  └─────────────────────────────────┘
```
* **Design**: Uses a light grey dotted border (`border: 2px dashed #E9ECEF`) with no shadow to indicate it is not yet active.
* **Interactive Elements**: Includes a community upvote widget: *"Vote to prioritize development"*.
* **Progress Meter**: A simple, clean progress bar displaying the current development status.

### 3. Navigation Controls
* **Header Bar**: A semi-transparent glassmorphic banner (`rgba(255, 255, 255, 0.8)`) anchored at the top of the viewport. Uses a thin bottom border (`1px solid rgba(33, 37, 41, 0.08)`) and backdrop blur to stay readable as content scrolls underneath.
* **Navigation Links**: Clean text links with animated bottom borders. The border grows outward from the center when hovered.

### 4. Forms & Interactive Inputs
* **Input Fields**: Soft grey backgrounds (`#F8F9FA`) with bottom borders. When active, the border shifts to a solid amber highlight (`#FFC107`).
* **Validation Feedback**: Invalid entries show a red border (`#C92A2A`) with a gentle shake animation.

### 5. Social & Game Progression Components

#### User Profile Summary
* **Layout**: A split vertical layout featuring:
  * **Top**: A circular avatar outline in amber, displaying user details, joined date, and current bio.
  * **Bottom**: An XP progression ring that tracks experience points to the next level.

#### Leaderboards Podium Component
* **Layout**: A 3-podium column layout for top-ranked players:
  * **1st Place**: Center column in warm amber-yellow, featuring a floating crown icon.
  * **2nd Place**: Left column in slate-grey, featuring a silver medal tag.
  * **3rd Place**: Right column in light grey, featuring a bronze medal tag.

#### Achievement Hexagon Badge
* **Layout**: A modular hexagonal grid cell. Locked achievements are grayed out with a lock icon. Unlocking an achievement opens the card and displays a colorful badge.

---

## 8. UX Principles & Interaction States

To ensure a high-end experience, the platform uses clean states and smooth transitions for all interactive components.

### 1. Motion & Transition Easing
All interface movements use custom cubic-bezier curves for a natural, responsive feel:
* **Elastic Hover Transitions**: `transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);`
* **Fade Transitions**: `transition: opacity 0.2s cubic-bezier(0.25, 1, 0.5, 1);`

### 2. Micro-Interactions
* **Room Join Input**: The input box displays a pulsing checkmark icon once a valid 6-character room code is typed.
* **Ready State Button**: Toggling the "Ready" button trigger a subtle particle animation to build engagement before the match starts.

### 3. Loading, Empty, and Error States

#### Loading States (Skeletons)
* Rather than using generic spinner icons, the platform uses soft pulsing skeletons (`background: linear-gradient(90deg, #F1F3F5 25%, #E9ECEF 50%, #F1F3F5 75%)`) to match page structures.

#### Empty States
* **Layout**: Features a friendly illustration (e.g., an empty card box) with a single, clear call to action: *"Invite Friends to Start a Room"*.

#### Error Resolution States
* If a room connection fails, the interface displays an error banner with a dynamic fallback button: *"Attempt Reconnection"* (with a 5-second countdown timer).

---

## 9. Scalability Recommendations for Front-End Systems

To prepare the platform for growth and future expansions, we suggest the following front-end system structure:

```
[ Design Tokens (Figma/YAML) ]
              │
              ▼
[ Style Dictionary Compilation ]
              │
      ┌───────┴───────┐
      ▼               ▼
[ CSS Variables ]   [ Tailwind Utility Config ]
      │               │
      └───────┬───────┘
              ▼
[ Component Library (Radix / React Aria) ]
```

1. **Design Token Pipelines**: Manage colors, spacing, and typography in a central YAML or Figma file. Use tools like Style Dictionary to build and export assets for CSS, Tailwind, or native apps automatically.
2. **Headless Component Architecture**: Build UI components using headless libraries (like Radix UI or React Aria) to ensure full accessibility and easy styling.
3. **Dynamic Asset Loading**: Host game assets on a global CDN and load them on demand to keep initial page sizes light and fast.
4. **Localization (i18n)**: Group text labels into structured JSON dictionary bundles to simplify future translation efforts.
