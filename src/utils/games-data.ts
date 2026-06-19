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
    id: "g1",
    slug: "chess",
    name: "Chess Arena",
    category: "Board Games",
    multiplayerType: "2-Player VS",
    status: "released",
    progressPercent: 100,
    developerName: "Garry C.",
    tags: ["classic", "strategy", "brain"],
    description: "The classic game of chess. Test your strategic thinking against players worldwide. Outwit, outplay, and claim their King.",
    rules: [
      "Each player starts with 16 pieces: one King, one Queen, two Rooks, two Bishops, two Knights, and eight Pawns.",
      "The game is won when a player puts the opponent's King in checkmate.",
      "Stalemate and draw agreements can end the game without a winner."
    ],
    features: ["Custom skins", "ELO ranking system", "Spectator mode", "Local passes"],
    votes: 420
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
  },
  {
    id: "g3",
    slug: "ludo",
    name: "Ludo Club",
    category: "Board Games",
    multiplayerType: "4-Player FFA",
    status: "beta",
    progressPercent: 85,
    releaseWindow: "July 2026",
    developerName: "DevWizard",
    tags: ["friends", "dice", "fun"],
    description: "Race your four tokens from start to finish according to dice rolls. Form alliances or send your friends back to the start.",
    rules: [
      "Each player has 4 tokens in their base. Roll a 6 to launch a token onto the track.",
      "Tokens move clockwise around the track based on dice rolls.",
      "Landing on an opponent's token sends it back to their base."
    ],
    features: ["4-Player voice lounge", "Interactive custom dice skins", "Double-roll checks"],
    votes: 289
  },
  {
    id: "g4",
    slug: "reversi",
    name: "Reversi Deluxe",
    category: "Strategy",
    multiplayerType: "2-Player VS",
    status: "alpha",
    progressPercent: 65,
    releaseWindow: "August 2026",
    developerName: "Varshith",
    tags: ["strategy", "turns", "retro"],
    description: "Flip your opponent's discs to claim dominance on the board. The player with the most colored pieces wins the board.",
    rules: [
      "Discs are placed on an 8x8 grid. Trap opponent pieces between your own discs to flip them.",
      "A legal move must trap at least one opponent disc.",
      "The game ends when neither player can make a legal move."
    ],
    features: ["Turn-timer config", "Match history logs", "Undo analysis tool"],
    votes: 194
  },
  {
    id: "g5",
    slug: "checkers",
    name: "Checkers Classic",
    category: "Board Games",
    multiplayerType: "2-Player VS",
    status: "development",
    progressPercent: 45,
    releaseWindow: "Q4 2026",
    developerName: "Bob S.",
    tags: ["classic", "board"],
    description: "Jump over your opponent's checkers to capture them and reach the final row to crown your pieces.",
    rules: [
      "Pieces move diagonally forward. Captures are made by jumping over an adjacent piece.",
      "Checkers that reach the furthest row are crowned as Kings.",
      "Kings can move and jump diagonally backwards and forwards."
    ],
    features: ["Crowned visual skins", "Dynamic board custom rules"],
    votes: 142
  },
  {
    id: "g6",
    slug: "backgammon",
    name: "Backgammon Pro",
    category: "Board Games",
    multiplayerType: "2-Player VS",
    status: "planning",
    progressPercent: 15,
    releaseWindow: "Q1 2027",
    developerName: "Unassigned",
    tags: ["dice", "classic"],
    description: "The ancient board game of strategy and probability. Move all 15 checkers off the board before your opponent.",
    rules: [
      "Roll dice to determine checker movements.",
      "Hit opponent single checkers to send them to the center bar.",
      "Bear off your checkers once all are in your home board."
    ],
    votes: 95
  },
  // Generate 44 more mock games to reach 50+ Games
  ...Array.from({ length: 44 }).map((_, idx) => {
    const idNum = idx + 7;
    const categories: Game["category"][] = [
      "Strategy",
      "Board Games",
      "Arcade",
      "Card Games",
      "Puzzle Games",
      "Educational Games",
      "Multiplayer",
      "Single Player"
    ];
    const statuses: Game["status"][] = ["development", "planning", "coming_soon"];
    const mpTypes = ["2-Player VS", "4-Player FFA", "1-Player VS AI", "Co-op Lounge"];
    
    const category = categories[idx % categories.length];
    const status = statuses[idx % statuses.length];
    const mpType = mpTypes[idx % mpTypes.length];
    const votesNum = Math.floor(Math.random() * 120) + 5;
    const progress = status === "development" ? Math.floor(Math.random() * 40) + 10 : 0;
    
    const names = [
      "Sudoku Master", "Solitaire Lounge", "Tetris Classic", "Hearts FFA", "Spades Club",
      "Word Arena", "Trivia Quiz", "Mancala Hub", "Dominoes Pro", "Battleship Arena",
      "Snakes & Ladders Classic", "Carrom Club", "Pool Lounge", "Othello Deluxe", "Mahjong Social",
      "Chinese Checkers", "Monopoly Lounge", "Rummy Classic", "Bridge Pro", "Cribbage Lounge",
      "Poker Arena", "Blackjack VIP", "Uno Party", "Scrabble Social", "Boggle Classic",
      "Risk Strategy", "Catan Lounge", "Ticket To Ride", "Carcassonne Deluxe", "Pandemic Co-op",
      "Codebreaker Puzzle", "Mine Sweeper Classic", "Snake Arena", "Pacman Retro", "Galaga Pro",
      "Space Invaders Hub", "Pong Classic", "Memory Matchup", "Math Duel", "Word Search",
      "Crossword Lounge", "Maze Runner Pro", "Brick Breaker Classic", "Pinball Lounge"
    ];

    const name = names[idx % names.length] + ` (v${idNum})`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    return {
      id: `g${idNum}`,
      slug,
      name,
      category,
      multiplayerType: mpType,
      status,
      progressPercent: progress,
      releaseWindow: status === "coming_soon" ? `Q${(idx % 4) + 1} 2027` : "TBD",
      developerName: idx % 2 === 0 ? "Lounge Crew" : "Unassigned",
      tags: ["retro", "interactive", category.toLowerCase().split(" ")[0]],
      description: `A premium digital representation of ${name} built for social lounges, supporting quick invite lobbies and persistent profiles.`,
      rules: [
        "Take turns and follow standard classic rules.",
        "Win matches to earn XP points towards global leaderboards."
      ],
      votes: votesNum
    };
  })
];
