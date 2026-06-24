import { GameMetadata, GameRules, GameSettings } from "../types";

export const TICTACTOE_META: GameMetadata = {
  id: "tictactoe",
  slug: "tictactoe",
  name: "Tic-Tac-Toe Arena",
  description: "A fast-paced arena for the classic game of noughts and crosses. Perfect for quick matches and breaks.",
  thumbnail: "GRID",
  category: "Arcade",
  status: "released",
  version: "1.0.0",
  minPlayers: 2,
  maxPlayers: 2,
  supportsRooms: true,
  supportsSpectators: true,
  rulesList: [
    "The game is played on a 3×3 grid. Player 1 is X and Player 2 is O.",
    "Players alternate turns placing their marker (X or O) in any empty square.",
    "The first player to align 3 of their markers — horizontally, vertically, or diagonally — wins the round and earns 1 point.",
    "If all 9 squares are filled with no 3-in-a-row, the round ends in a DRAW. No points are awarded to either player.",
    "After each round ends (win or draw), both players can choose to Replay or Finish the Match.",
    "On replay, the player who went SECOND in the previous round goes FIRST in the next round — turns alternate fairly.",
    "The overall match winner is whoever has the higher score when 'Finish Match' is clicked. If scores are equal, the match ends as a draw.",
    "Spectators can watch but cannot place markers or use Replay/Finish controls.",
    "Quit Game counts as a forfeit — the opponent is declared the match winner."
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
