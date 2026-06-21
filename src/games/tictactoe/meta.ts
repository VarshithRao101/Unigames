import { GameMetadata, GameRules, GameSettings } from "../types";

export const TICTACTOE_META: GameMetadata = {
  id: "tictactoe",
  slug: "tictactoe",
  name: "Tic-Tac-Toe Arena",
  description: "A fast-paced arena for the classic game of noughts and crosses. Perfect for quick matches and breaks.",
  thumbnail: "🎲",
  category: "Arcade",
  status: "released",
  version: "1.0.0",
  minPlayers: 2,
  maxPlayers: 2,
  supportsRooms: true,
  supportsSpectators: true,
  rulesList: [
    "Players take turns placing their marker (X or O) in an empty square on the 3x3 grid.",
    "The first player to align 3 markers horizontally, vertically, or diagonally wins.",
    "If all squares are filled and no player has 3 in a row, the match is a draw."
  ],
  developerTeam: {
    developerName: "Alice W.",
    teamName: "Casual Wizards",
    contributors: ["Alice W.", "Varshith R."],
    version: "1.0.0",
    releaseNotes: [
      "Initial reference implementation released.",
      "Integrated platform match context sync."
    ]
  }
};

export const TICTACTOE_RULES: GameRules = {
  turnBased: true,
  realTime: false,
  teamBased: false,
  minPlayers: 2,
  maxPlayers: 2,
  rulesDescription: TICTACTOE_META.rulesList
};

export const TICTACTOE_SETTINGS: GameSettings = {
  configs: [
    {
      id: "ranked",
      name: "Ranked Mode",
      type: "boolean",
      defaultValue: false
    },
    {
      id: "turnTimer",
      name: "Turn Timer (seconds)",
      type: "number",
      defaultValue: 30,
      min: 10,
      max: 120
    }
  ]
};
