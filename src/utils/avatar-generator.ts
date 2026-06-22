// Programmatic 2D Cartoon Neobrutalist Avatar Generator
// Generates 50 unique offline-first vector avatars by combining 10 neobrutalist colors with 5 stylized gamer symbols.

export interface AvatarPreset {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  symbolId: string;
  symbolSvg: string;
}

const COLORS = [
  { name: "Amber", hex: "#ffaa00", textHex: "#161713" },
  { name: "Ruby", hex: "#ff4b4b", textHex: "#ffffff" },
  { name: "Teal", hex: "#00aa88", textHex: "#ffffff" },
  { name: "Sapphire", hex: "#0284c7", textHex: "#ffffff" },
  { name: "Amethyst", hex: "#7c3aed", textHex: "#ffffff" },
  { name: "Rose", hex: "#ff4b91", textHex: "#ffffff" },
  { name: "Lime", hex: "#39ff14", textHex: "#161713" },
  { name: "Cyan", hex: "#00d2ff", textHex: "#161713" },
  { name: "Slate", hex: "#475569", textHex: "#ffffff" },
  { name: "Gold", hex: "#ffea00", textHex: "#161713" },
];

const SYMBOLS = [
  { 
    id: "invader", 
    name: "Invader", 
    svg: `<path d="M-15,-14h6v4h-6zm24,0h6v4h-6zm-20,4h16v4h-16zm-4,4h24v4h-24zm-4,4h32v4h-32zm-32,4h8v4h-8zm12,0h8v4h-8zm12,0h8v4h-8zm-24,4h4v8h-4zm24,0h4v8h-4z" fill="currentColor"/>` 
  },
  { 
    id: "crown", 
    name: "Crown", 
    svg: `<path d="M-20,12 L-20,-8 L-10,2 L0,-12 L10,2 L20,-8 L20,12 Z" fill="currentColor" stroke="#000000" stroke-width="4.5" stroke-linejoin="round"/>` 
  },
  { 
    id: "star", 
    name: "Star", 
    svg: `<path d="M0,-22 L6,-6 L22,-6 L10,4 L14,20 L0,10 L-14,20 L-10,4 L-22,-6 L-6,-6 Z" fill="currentColor" stroke="#000000" stroke-width="4.5" stroke-linejoin="round"/>` 
  },
  { 
    id: "bolt", 
    name: "Volt", 
    svg: `<path d="M5,-20 L-15,0 L-3,0 L-10,20 L15,0 L3,0 Z" fill="currentColor" stroke="#000000" stroke-width="4.5" stroke-linejoin="round"/>` 
  },
  { 
    id: "heart", 
    name: "Heart", 
    svg: `<path d="M0,17 C-20,7 -25,-13 -10,-18 C0,-23 0,-8 0,-8 C0,-8 0,-23 10,-18 C25,-13 20,7 0,17 Z" fill="currentColor" stroke="#000000" stroke-width="4.5" stroke-linejoin="round"/>` 
  },
];

// Generate exactly 50 distinct items (5 symbols * 10 colors = 50 presets)
export const PRELOADED_AVATARS: AvatarPreset[] = (() => {
  const list: AvatarPreset[] = [];
  let index = 1;
  
  for (let s = 0; s < SYMBOLS.length; s++) {
    for (let c = 0; c < COLORS.length; c++) {
      const symbol = SYMBOLS[s];
      const color = COLORS[c];
      list.push({
        id: `preset-${index}`,
        name: `${color.name} ${symbol.name}`,
        bgColor: color.hex,
        textColor: color.textHex,
        symbolId: symbol.id,
        symbolSvg: symbol.svg,
      });
      index++;
    }
  }
  return list;
})();

export function getAvatarSvgContent(preset: AvatarPreset): string {
  // Simple XML structure with halftone dot grid pattern and solid background
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="${preset.bgColor}" stroke="#000000" stroke-width="6"/>
    <pattern id="avatar-grid-${preset.id}" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="1.5" fill="#000000" opacity="0.12" />
    </pattern>
    <rect width="100" height="100" fill="url(#avatar-grid-${preset.id})" />
    <g transform="translate(50, 50) scale(1.35)" color="${preset.textColor}">
      ${preset.symbolSvg}
    </g>
  </svg>`;
}

export function getAvatarDataUri(id: string): string {
  const preset = PRELOADED_AVATARS.find(p => p.id === id);
  if (!preset) return "/avatars/avatar-placeholder.png";
  const svg = getAvatarSvgContent(preset);
  // URL-encode to safely load in src attributes of standard image tags
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function isPresetAvatar(avatarString: string | undefined): boolean {
  if (!avatarString) return false;
  return avatarString.startsWith("preset-");
}

export function resolveAvatarUrl(avatarString: string | undefined): string {
  if (!avatarString) return "/avatars/avatar-placeholder.png";
  if (isPresetAvatar(avatarString)) {
    return getAvatarDataUri(avatarString);
  }
  return avatarString;
}
