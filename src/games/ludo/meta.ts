import { GameMetadata, GameRules, GameSettings } from "../types";

export const LUDO_META: GameMetadata = {
  id: "ludo",
  slug: "ludo",
  name: "Ludo Arena",
  description: "Experience Ludo with premium neobrutalist animations, custom Web Audio synthesis, 3D rotating dice physics, and strategic AI players.",
  thumbnail: "🎲",
  category: "Board Games",
  status: "released",
  version: "1.0.0",
  minPlayers: 2,
  maxPlayers: 4,
  supportsRooms: true,
  supportsSpectators: true,
  rulesList: [
    "Minimum 2 and maximum 4 players can play.",
    "A roll of 6 releases a token from HOME to the starting cell.",
    "Alternate rolling the 3D dice. Click a token to move it.",
    "Landing on a safe cell (star) protects your token.",
    "Landing on an opponent's token outside a safe cell captures it, sending it back to HOME and awarding a bonus roll.",
    "Having 2 or more of your own tokens on a cell forms a blockade (opponents cannot land on it).",
    "Reaching the central HOME finished spot awards a bonus roll.",
    "The first player to race all 4 tokens to the center wins."
  ],
  developerTeam: {
    developerName: "Strategy Guild",
    teamName: "Board Game Division",
    contributors: ["Alice W.", "Varshith R."],
    version: "1.0.0",
    releaseNotes: [
      "Initial implementation of neobrutalist 3D Ludo.",
      "Integrated strategic bot reasoning.",
      "Configured synthesized retro sound module."
    ]
  }
};

export const LUDO_RULES: GameRules = {
  turnBased: true,
  realTime: false,
  teamBased: false,
  minPlayers: 2,
  maxPlayers: 4,
  rulesDescription: LUDO_META.rulesList
};

export const LUDO_SETTINGS: GameSettings = {
  configs: [
    {
      id: "ranked",
      name: "Ranked Match",
      type: "boolean",
      defaultValue: false
    },
    {
      id: "turnTimer",
      name: "Turn Timer (seconds)",
      type: "number",
      defaultValue: 30,
      min: 15,
      max: 90
    }
  ]
};
