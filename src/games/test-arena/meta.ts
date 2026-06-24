import { GameMetadata, GameRules, GameSettings } from "../types";

export const TEST_ARENA_META: GameMetadata = {
  id: "test-arena",
  slug: "test-arena",
  name: "UniGames Test Arena",
  description: "A fully integrated testing arena used to validate game registry, container components, match context, and reward loops.",
  thumbnail: "SANDBOX",
  category: "Testing",
  status: "released",
  version: "1.0.0",
  minPlayers: 2,
  maxPlayers: 2,
  supportsRooms: true,
  supportsSpectators: true,
  rulesList: [
    "Run verification tests.",
    "Validate match starts and completions.",
    "Verify dynamic achievements and leaderboard positions."
  ],
  developerTeam: {
    developerName: "Lounge QA Team",
    teamName: "Core Platform",
    contributors: ["Alice W.", "Varshith R."],
    version: "1.0.0",
    releaseNotes: [
      "Initial reference sandbox build.",
      "Integrated end-to-end event hooks."
    ]
  }
};

export const TEST_ARENA_RULES: GameRules = {
  turnBased: false,
  realTime: true,
  teamBased: false,
  minPlayers: 2,
  maxPlayers: 2,
  rulesDescription: TEST_ARENA_META.rulesList
};

export const TEST_ARENA_SETTINGS: GameSettings = {
  configs: [
    {
      id: "ranked",
      name: "Ranked Test Arena",
      type: "boolean",
      defaultValue: true
    }
  ]
};
