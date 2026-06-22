import { Game } from "@/types/game";

export const GAMES_DATABASE: Game[] = [
  {
    id: "test-arena",
    slug: "test-arena",
    name: "UniGames Test Arena",
    category: "Testing",
    multiplayerType: "2-Player VS",
    status: "released",
    progressPercent: 100,
    developerName: "Core Platform",
    tags: ["testing", "sandbox", "qa"],
    description: "A fully integrated testing arena used to validate game registry, container components, match context, and reward loops.",
    rules: [
      "Run verification tests.",
      "Validate match starts and completions.",
      "Verify dynamic achievements and leaderboard positions."
    ],
    features: ["XP rewards", "Spectator count check", "Leaderboard submission validation", "Framer motion animations"],
    votes: 999
  },
  {
    id: "g2",
    slug: "tictactoe",
    name: "Tic-Tac-Toe Arena",
    category: "Arcade",
    multiplayerType: "2-Player VS",
    status: "released",
    progressPercent: 100,
    developerName: "Alice W.",
    tags: ["classic", "quick", "casual"],
    description: "A fast-paced arena for the classic game of noughts and crosses. Perfect for quick matches and breaks.",
    rules: [
      "Players take turns placing their marker (X or O) in an empty square on the 3x3 grid.",
      "The first player to align 3 markers horizontally, vertically, or diagonally wins.",
      "If all squares are filled and no player has 3 in a row, the match is a draw."
    ],
    features: ["Interactive chat stickers", "Fast matchmaking", "Win streak tracking"],
    votes: 310
  }
];
