import { GameMetadata, GameRules, GameSettings } from "../types";

export const CHESS_META: GameMetadata = {
  id: "chess",
  slug: "chess",
  name: "Chess Arena",
  description: "Engage in the timeless classic of strategy and tactical execution. Face off against players or hone your skills against NeuroBot.",
  thumbnail: "♟",
  category: "Strategy",
  status: "released",
  version: "1.0.0",
  minPlayers: 2,
  maxPlayers: 2,
  supportsRooms: true,
  supportsSpectators: true,
  rulesList: [
    "White moves first, players alternate turns.",
    "Pieces are moved according to standard international rules.",
    "Checkmate is the primary win condition.",
    "Draws are declared automatically if stalemate, 50-move rule, three-fold repetition, or insufficient material is reached.",
    "After each match ends, you can choose to Replay or Finish the Match.",
    "On replay, colors swap so players alternate playing White and Black.",
    "Spectators can watch matches live but cannot interact with pieces.",
    "Quitting or resigning forfeits the game, declaring the opponent the winner."
  ],
  developerTeam: {
    developerName: "Alice W.",
    teamName: "Strategy Guild",
    contributors: ["Alice W.", "Varshith R."],
    version: "1.0.0",
    releaseNotes: [
      "Initial reference implementation released.",
      "Added minimax-based AI practice mode.",
      "Integrated dynamic 2D neo-brutalist theme."
    ]
  }
};

export const CHESS_RULES: GameRules = {
  turnBased: true,
  realTime: false,
  teamBased: false,
  minPlayers: 2,
  maxPlayers: 2,
  rulesDescription: CHESS_META.rulesList
};

export const CHESS_SETTINGS: GameSettings = {
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
      defaultValue: 60,
      min: 15,
      max: 300
    }
  ]
};
