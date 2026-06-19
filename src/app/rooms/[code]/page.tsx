"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Sidebar } from "@/components/common/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Copy, Users, Send, CheckCircle2, AlertCircle, ArrowLeft, Gamepad, Sparkles, 
  Share2, Crown, LogOut, Trophy, Play, Check, Plus, User, Eye, BookOpen, Clock, 
  HelpCircle, RefreshCw, X, ShieldAlert, Award, ChevronRight, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GameContainer } from "@/games/container";
import { PlatformAdComponent, PopupAd } from "@/monetization/ad-components";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  avatar: string;
  isAI: boolean;
  color?: string;
}

interface GameConfig {
  id: string;
  name: string;
  maxPlayers: number;
  rules: string;
  description: string;
  objectives: string;
  duration: string;
  winConditions: string;
  thumb: string;
  tips: string[];
}

const GAME_CONFIGS: Record<string, GameConfig> = {
  "test-arena": {
    id: "test-arena",
    name: "UniGames Test Arena",
    maxPlayers: 2,
    rules: "Simulate gameplay results, XP payouts, achievements, and spectator checks.",
    description: "A training sandbox to simulate match results, test reward payouts, and review spectator sync functions.",
    objectives: "Trigger match results using simulators.",
    duration: "Real-time interactive",
    winConditions: "Simulate Winner A or Winner B action buttons.",
    thumb: "🛡️",
    tips: [
      "Select a winner button to simulate reward calculations.",
      "Verify live spectator counts update dynamically.",
      "Check achievements and standings updates."
    ]
  },
  chess: {
    id: "chess",
    name: "Chess Online",
    maxPlayers: 2,
    rules: "Standard checkmate win conditions. 10m timer.",
    description: "A classic strategy game for 2 players. Control your pieces, protect your king, and checkmate the opponent.",
    objectives: "Capture the opponent's king or run down their clock.",
    duration: "10 Minutes per player",
    winConditions: "Checkmate, Opponent Resignation, or Timeout.",
    thumb: "♟️",
    tips: [
      "Control the center of the board early in the match.",
      "Knights on the rim are dim; keep them active towards the center.",
      "Castle early to safeguard your king and activate your rooks.",
    ],
  },
  ludo: {
    id: "ludo",
    name: "Ludo Club",
    maxPlayers: 4,
    rules: "Navigate 4 tokens to the home pocket. 4-player FFA.",
    description: "Classic strategy board game for up to 4 players. Roll the dice, move your tokens, and make it home first.",
    objectives: "Get all 4 of your colored tokens into the home pocket.",
    duration: "15-20 Minutes",
    winConditions: "First player to get all tokens home wins.",
    thumb: "🎲",
    tips: [
      "Prioritize releasing all your tokens from the base.",
      "Block opponents by forming barriers with two of your tokens on the same spot.",
      "Watch out for incoming opponent tokens behind you before making high-risk moves.",
    ],
  },
  snakes: {
    id: "snakes",
    name: "Snake & Ladder Arena",
    maxPlayers: 6,
    rules: "Climb ladders, avoid snakes, reach square 100.",
    description: "Traditional board game of luck and strategy. Climb up ladders and avoid sliding down snake tails.",
    objectives: "Navigate your piece from square 1 to 100.",
    duration: "10-15 Minutes",
    winConditions: "First player to reach exactly square 100.",
    thumb: "🐍",
    tips: [
      "Keep an eye on critical ladder bases at lower positions.",
      "Stay calm; even if you hit a snake near square 99, a quick ladder can bring you back.",
      "Calculate potential dice roll values to land exactly on square 100.",
    ],
  },
};

const BOT_NAMES = [
  "AlphaBot", "CyberSlayer", "DeepLogic", "QuantumRider", "ByteSmasher", "GizmoMaster"
];

const ONLINE_FRIENDS = [
  { id: "f1", name: "GarryChess", status: "Online", avatar: "G" },
  { id: "f2", name: "BoardKing", status: "Playing", avatar: "B" },
  { id: "f3", name: "DiceRoll", status: "Online", avatar: "D" },
  { id: "f4", name: "QueenGambit", status: "Offline", avatar: "Q" },
  { id: "f5", name: "NeoLudo", status: "Online", avatar: "N" },
];

export default function LobbyRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomCode = resolvedParams.code.toUpperCase();

  // Load game config from localStorage or default to chess
  const [gameId, setGameId] = useState<string>("chess");
  const [roomName, setRoomName] = useState<string>("Arena Showdown");
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  // Room states
  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<{ id: string; name: string; avatar: string }[]>([
    { id: "spec1", name: "SpectatorMax", avatar: "M" },
    { id: "spec2", name: "LurkerPro", avatar: "L" },
  ]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string; isSystem?: boolean }[]>([
    { sender: "System", text: "Match lobby ready. Share the code to invite players.", time: "12:00", isSystem: true },
  ]);
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Game states flow
  const [gameState, setGameState] = useState<"lobby" | "countdown" | "loading" | "playing" | "results">("lobby");
  const [countdown, setCountdown] = useState<number>(5);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingTip, setLoadingTip] = useState<string>("");
  
  // Gameplay simulation states
  const [simulatedRound, setSimulatedRound] = useState<number>(1);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [spectatorCount, setSpectatorCount] = useState<number>(2);
  const [isSpectatingOnly, setIsSpectatingOnly] = useState<boolean>(false);

  // Modal UI state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState<Record<string, boolean>>({});

  // Ad interstitial locks
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [hasShownStartAd, setHasShownStartAd] = useState(false);

  const game = GAME_CONFIGS[gameId] || GAME_CONFIGS.chess;
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize data
  useEffect(() => {
    const cachedGameId = localStorage.getItem(`room_game_${roomCode}`);
    if (cachedGameId && GAME_CONFIGS[cachedGameId]) {
      setGameId(cachedGameId);
    }
    
    // Simulate private password requirement randomly if roomCode starts with "P" or setup state
    if (roomCode.startsWith("P") || roomCode.length % 2 === 0) {
      setIsPrivate(true);
      setIsLocked(true);
    }

    // Initialize players list based on game capacity
    const initialPlayers: Player[] = [
      { id: "p1", name: "You (Varshith)", isHost: true, isReady: false, avatar: "V", isAI: false, color: "#FFC107" },
      { id: "p2", name: "AliceW", isHost: false, isReady: true, avatar: "A", isAI: false, color: "#1971C2" },
    ];
    setPlayers(initialPlayers);
    setLoadingTip(GAME_CONFIGS[cachedGameId || "chess"]?.tips[0] || GAME_CONFIGS.chess.tips[0]);
  }, [roomCode]);

  // Handle password entry
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "1234" || passwordInput === "unigames") {
      setIsLocked(false);
      setPasswordError("");
      setChatMessages((prev) => [
        ...prev,
        { sender: "System", text: "You have unlocked and joined the private lobby.", time: "Now", isSystem: true }
      ]);
    } else {
      setPasswordError("Incorrect Access Code. (Try '1234')");
    }
  };

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Loading Screen simulation logic
  useEffect(() => {
    if (gameState !== "loading") return;
    
    const tipInterval = setInterval(() => {
      const tips = game.tips;
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setLoadingTip(randomTip);
    }, 3000);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(tipInterval);
          // Transition to gameplay
          setGameState("playing");
          triggerGameplaySimulation();
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [gameState, game]);

  // Countdown timer logic
  useEffect(() => {
    if (gameState !== "countdown") return;
    if (countdown === 0) {
      setGameState("loading");
      setLoadingProgress(0);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, gameState]);

  // Switch between Player and Spectator Mode
  const handleToggleSpectatorMode = () => {
    if (isSpectatingOnly) {
      // Return to player
      if (players.length >= game.maxPlayers) {
        alert("The game slots are currently full! Remove a bot or wait for a slot.");
        return;
      }
      setIsSpectatingOnly(false);
      // Remove from spectators and add to players
      setSpectators(prev => prev.filter(s => s.name !== "You (Varshith)"));
      setPlayers(prev => [...prev, { id: "p1", name: "You (Varshith)", isHost: true, isReady: false, avatar: "V", isAI: false, color: "#FFC107" }]);
      setChatMessages(prev => [...prev, { sender: "System", text: "You joined as a player.", time: "Now", isSystem: true }]);
    } else {
      // Join spectators
      setIsSpectatingOnly(true);
      setPlayers(prev => prev.filter(p => p.id !== "p1"));
      setSpectators(prev => [...prev, { id: "spec-you", name: "You (Varshith)", avatar: "V" }]);
      setChatMessages(prev => [...prev, { sender: "System", text: "You switched to Spectator Mode.", time: "Now", isSystem: true }]);
    }
  };

  // Lobby slot logic
  const handleAddAI = () => {
    if (players.length >= game.maxPlayers) return;
    const botIndex = Math.floor(Math.random() * BOT_NAMES.length);
    const botName = BOT_NAMES[botIndex] + ` [AI]`;
    
    // Check if bot already exists in lobby
    if (players.some(p => p.name === botName)) return;

    const newBot: Player = {
      id: `bot-${Date.now()}`,
      name: botName,
      isHost: false,
      isReady: true,
      avatar: "AI",
      isAI: true,
      color: ["#2B8A3E", "#E67E22", "#C92A2A", "#1971C2"][Math.floor(Math.random() * 4)],
    };

    setPlayers(prev => [...prev, newBot]);
    setChatMessages(prev => [
      ...prev,
      { sender: "System", text: `${botName} entered the room.`, time: "Now", isSystem: true }
    ]);
  };

  const handleRemovePlayer = (id: string) => {
    const targetPlayer = players.find(p => p.id === id);
    if (!targetPlayer) return;

    setPlayers(prev => prev.filter(p => p.id !== id));
    setChatMessages(prev => [
      ...prev,
      { sender: "System", text: `${targetPlayer.name} left the room.`, time: "Now", isSystem: true }
    ]);
  };

  // Toggle ready status
  const handleToggleReady = () => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === "p1" ? { ...p, isReady: !p.isReady } : p))
    );
  };

  // Start lobby countdown
  const handleStartMatch = () => {
    if (!hasShownStartAd) {
      setIsAdOpen(true);
      return;
    }
    setCountdown(5);
    setGameState("countdown");
    setChatMessages((prev) => [
      ...prev,
      { sender: "System", text: "Match host triggered launch countdown.", time: "Now", isSystem: true }
    ]);
  };

  const handleCloseAd = () => {
    setIsAdOpen(false);
    setHasShownStartAd(true);
    setCountdown(5);
    setGameState("countdown");
    setChatMessages((prev) => [
      ...prev,
      { sender: "System", text: "Match host triggered launch countdown.", time: "Now", isSystem: true }
    ]);
  };

  // Invite Friends to list
  const handleInviteFriend = (friendId: string, name: string) => {
    setInvitedFriends(prev => ({ ...prev, [friendId]: true }));
    setChatMessages(prev => [
      ...prev,
      { sender: "System", text: `Invitation sent to ${name}.`, time: "Now", isSystem: true }
    ]);
    
    // Simulate friend joining after 3 seconds
    setTimeout(() => {
      setPlayers(prev => {
        if (prev.length >= game.maxPlayers) return prev;
        if (prev.some(p => p.name === name)) return prev;
        return [...prev, {
          id: `friend-${friendId}`,
          name: name,
          isHost: false,
          isReady: false,
          avatar: name.charAt(0),
          isAI: false,
          color: "#E67E22",
        }];
      });
      setChatMessages(prev => [
        ...prev,
        { sender: "System", text: `${name} accepted your invitation and joined the room.`, time: "Now", isSystem: true }
      ]);
    }, 3000);
  };

  // Copy Link helper
  const handleCopyLink = () => {
    const url = `${window.location.origin}/rooms/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chat message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      sender: "You",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Bot response
    setTimeout(() => {
      const activePlayers = players.filter(p => !p.isHost && !p.isAI);
      if (activePlayers.length > 0) {
        const randomPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
        const botMessages = [
          "Let's play! I've been practicing.",
          "Ready when you are!",
          "This game is going to be epic.",
          "Add some AI players to fill up slots if you want!",
        ];
        setChatMessages((prev) => [
          ...prev,
          {
            sender: randomPlayer.name,
            text: botMessages[Math.floor(Math.random() * botMessages.length)],
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    }, 1500);
  };

  // Gameplay simulation loop
  const triggerGameplaySimulation = () => {
    setSimulatedRound(1);
    setSpectatorCount(4);
    const logs = [
      "Match simulation started.",
      `All slots configured for ${game.name}.`,
      "Initial game board rendered on Canvas API.",
    ];
    setGameLog(logs);

    let round = 1;
    const interval = setInterval(() => {
      round += 1;
      setSimulatedRound(round);
      setSpectatorCount((prev) => prev + Math.floor(Math.random() * 3) - 1);

      // Select random players for action logs
      const names = players.map(p => p.name);
      if (names.length === 0) return;
      const primaryPlayer = names[Math.floor(Math.random() * names.length)];
      const actionLogs = [
        `${primaryPlayer} made a defensive move.`,
        `${primaryPlayer} advanced tokens on the board.`,
        `${primaryPlayer} rolled double multiplier values.`,
        "Match state updated for all players.",
        `Live spectator list refreshed. Room latency is stable.`,
      ];
      
      setGameLog(prev => [...prev.slice(-8), actionLogs[Math.floor(Math.random() * actionLogs.length)]]);

      if (round >= 8) {
        clearInterval(interval);
      }
    }, 2500);
  };

  // End gameplay match and show results
  const handleEndMatch = () => {
    setGameState("results");
  };

  // Play Again reset
  const handlePlayAgain = () => {
    setGameState("lobby");
    setCountdown(5);
    setPlayers(prev => prev.map(p => ({ ...p, isReady: p.isHost ? false : true })));
    setChatMessages(prev => [
      ...prev,
      { sender: "System", text: "Match completed. Returning to lobby.", time: "Now", isSystem: true }
    ]);
  };

  // Render Slots based on game capacity
  const renderPlayerSlots = () => {
    const slots = [];
    const max = game.maxPlayers;

    for (let i = 0; i < max; i++) {
      const player = players[i];

      if (player) {
        slots.push(
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl transition-all hover:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full text-slate-950 font-outfit font-black flex items-center justify-center text-sm shadow-md"
                style={{ backgroundColor: player.color || "#FFC107" }}
              >
                {player.avatar}
              </div>
              <div>
                <p className="font-outfit font-extrabold text-sm text-white flex items-center gap-1.5">
                  {player.name}
                  {player.isHost && (
                    <span className="text-[8px] font-black uppercase tracking-wider bg-brand-amber/10 border border-brand-amber/30 text-brand-amber px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> Host
                    </span>
                  )}
                  {player.isAI && (
                    <span className="text-[8px] font-black uppercase tracking-wider bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full">
                      AI Bot
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Ping: {player.isAI ? "0ms" : "24ms"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-extrabold font-outfit uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                player.isReady 
                  ? "bg-success/10 border-success/30 text-green-400" 
                  : "bg-slate-950 border-slate-800 text-slate-500"
              }`}>
                {player.isReady ? "Ready" : "Waiting"}
              </span>

              {players.length > 1 && !player.isHost && (
                <button
                  onClick={() => handleRemovePlayer(player.id)}
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
                  title="Remove player"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        );
      } else {
        slots.push(
          <div
            key={`empty-${i}`}
            className="flex items-center justify-between p-4 bg-slate-950 border border-dashed border-slate-900 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-dashed border-slate-800 text-slate-700 flex items-center justify-center font-outfit font-extrabold text-xs">
                +
              </div>
              <div>
                <p className="font-outfit font-bold text-xs text-slate-600">Vacant Slot</p>
                <p className="text-[10px] text-slate-800 font-semibold mt-0.5">Waiting for player...</p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleAddAI}
              leftIcon={<Plus className="w-3 h-3 text-slate-500" />}
              className="h-8 px-3 border border-slate-900 text-[9px] hover:text-brand-amber font-extrabold tracking-wider"
            >
              Add Bot
            </Button>
          </div>
        );
      }
    }
    return slots;
  };

  // PRIVATE ROOM LOCK PAGE
  if (isLocked) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <main className="flex-1 pt-24 bg-slate-950 text-white min-h-screen pb-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-slate-900/60 border border-slate-900 p-8 rounded-3xl space-y-6 text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-brand-amber/10 border border-brand-amber/25 rounded-2xl flex items-center justify-center mx-auto text-brand-amber">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-brand-amber/10 text-brand-amber border border-brand-amber/20 px-2.5 py-1 rounded-full">
                Locked Lobby
              </span>
              <h1 className="font-outfit font-black text-2xl uppercase tracking-wide mt-3">Private Room Access</h1>
              <p className="text-xs text-slate-400 mt-1">Lobby Room #{roomCode} requires a passcode authorization validation key to join.</p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter 4-Digit Passcode"
                  maxLength={10}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-brand-amber rounded-xl px-4 py-3 text-xs text-center font-mono font-extrabold uppercase tracking-widest outline-none transition-all placeholder:font-sans placeholder:tracking-normal placeholder:font-medium text-white"
                />
                {passwordError && (
                  <p className="text-[10px] text-danger font-semibold mt-2">{passwordError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Link href="/rooms" className="flex-1">
                  <Button variant="secondary" className="w-full h-11 uppercase font-bold text-xs">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" variant="primary" className="flex-1 h-11 uppercase font-bold text-xs">
                  Unlock Room
                </Button>
              </div>
            </form>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="flex-1 pt-24 bg-slate-950 text-white min-h-screen pb-20 selection:bg-brand-amber selection:text-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          
          <AnimatePresence mode="wait">
            {gameState === "lobby" && (
              <motion.div
                key="lobby-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Header Lobby Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-slate-900/60 border border-slate-900 p-6 rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-3xl">
                      {game.thumb}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-brand-amber/10 border border-brand-amber/35 text-brand-amber px-2.5 py-0.5 rounded-full">
                          Lobby #{roomCode}
                        </span>
                        {isPrivate && (
                          <span className="p-1 rounded bg-slate-950 border border-slate-800 text-brand-amber">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <h1 className="font-outfit font-black text-xl uppercase tracking-wide mt-1">
                        {roomName}
                      </h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsInviteOpen(true)}
                      leftIcon={<Share2 className="w-4 h-4 text-brand-amber" />}
                      className="h-10 border-slate-800 font-extrabold text-[10px] uppercase tracking-wider text-slate-300"
                    >
                      Invite Friends
                    </Button>
                    <Link href="/rooms">
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<LogOut className="w-4 h-4" />}
                        className="h-10 font-extrabold text-[10px] uppercase tracking-wider"
                      >
                        Leave
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="w-full">
                  <PlatformAdComponent placement="match_results" />
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column - Slots & Rules */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Players slots system */}
                    <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Users className="w-4 h-4 text-brand-amber" />
                          Multiplayer Match Slots ({players.length}/{game.maxPlayers})
                        </h3>
                        
                        <button
                          onClick={handleToggleSpectatorMode}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand-amber hover:underline hover:text-brand-light transition-all bg-brand-amber/5 border border-brand-amber/20 px-3 py-1 rounded-xl"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {isSpectatingOnly ? "Join as Player" : "Switch to Spectator"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderPlayerSlots()}
                      </div>
                    </div>

                    {/* Game Rules panel */}
                    <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-5">
                      <h3 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-brand-amber" />
                        Dynamic Game Rules & Configuration
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Match Objectives</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{game.objectives}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Duration Limit</span>
                          <p className="text-xs text-slate-300 leading-relaxed flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand-amber" />
                            {game.duration}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Win Conditions</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{game.winConditions}</p>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl flex gap-3.5 items-start">
                        <HelpCircle className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-outfit font-extrabold text-[10px] text-slate-200 uppercase tracking-wide">Lobby Status</h4>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                            {game.description} The game room is fully configured for real-time play.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column - Coordination Chat & Launch Panel */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Chat Board */}
                    <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-3xl flex flex-col h-[350px]">
                      <h3 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400 mb-3">
                        Lobby Room Chat
                      </h3>

                      {/* Messages scroll box */}
                      <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3 mb-4">
                        {chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col max-w-[90%] ${
                              msg.isSystem
                                ? "self-center text-center max-w-full w-full"
                                : msg.sender === "You"
                                ? "self-end items-end"
                                : "self-start"
                            }`}
                          >
                            {!msg.isSystem && (
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-[9px] font-bold font-outfit text-slate-500">
                                  {msg.sender}
                                </span>
                                <span className="text-[8px] text-slate-600 font-semibold">{msg.time}</span>
                              </div>
                            )}

                            <div
                              className={`text-[11px] font-medium leading-relaxed rounded-2xl p-2.5 ${
                                msg.isSystem
                                  ? "bg-slate-900/30 text-slate-500 border border-slate-900/40 text-[9px] font-mono py-1 rounded-lg"
                                  : msg.sender === "You"
                                  ? "bg-brand-amber text-slate-950 rounded-tr-none font-bold"
                                  : "bg-slate-900 text-white rounded-tl-none border border-slate-800"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Input form */}
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Broadcast message..."
                          className="flex-1 bg-slate-950 text-xs font-semibold border border-slate-900 focus:border-brand-amber rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-slate-600 text-white"
                        />
                        <Button variant="primary" type="submit" className="h-9 px-3.5">
                          <Send className="w-3.5 h-3.5 text-slate-950" />
                        </Button>
                      </form>
                    </div>

                    {/* Launch / Start Panel */}
                    <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-outfit font-black uppercase tracking-wider">Ready Up Check</span>
                        <span className="text-brand-amber font-mono font-bold">
                          {players.filter(p => p.isReady).length}/{players.length} Ready
                        </span>
                      </div>

                      <div className="flex gap-3">
                        {!isSpectatingOnly && (
                          <Button
                            variant={players.find((p) => p.id === "p1")?.isReady ? "secondary" : "primary"}
                            size="md"
                            onClick={handleToggleReady}
                            className="flex-1 uppercase font-bold text-xs"
                          >
                            {players.find((p) => p.id === "p1")?.isReady ? "Cancel Ready" : "Ready Up"}
                          </Button>
                        )}

                        {players.find((p) => p.id === "p1")?.isHost && (
                          <Button
                            variant="primary"
                            size="md"
                            onClick={handleStartMatch}
                            disabled={players.length < 2 || !players.every(p => p.isReady)}
                            className="flex-1 bg-brand-amber text-slate-950 hover:bg-brand-light uppercase font-bold text-xs tracking-wider"
                          >
                            Start Match
                          </Button>
                        )}
                      </div>

                      {players.length < 2 && (
                        <p className="text-[10px] text-slate-500 font-bold text-center flex items-center justify-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-brand-amber" />
                          A minimum of 2 players are required to start.
                        </p>
                      )}
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* PART 8 — MATCH READY SCREEN COUNTDOWN */}
            {gameState === "countdown" && (
              <motion.div
                key="countdown-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 text-white rounded-3xl p-12 text-center flex flex-col justify-center items-center min-h-[550px] shadow-2xl relative overflow-hidden"
              >
                {/* Background lighting */}
                <div className="absolute inset-0 bg-radial-gradient from-brand-amber/10 via-transparent to-transparent pointer-events-none" />

                <span className="text-[10px] font-black uppercase tracking-widest bg-brand-amber/10 text-brand-amber border border-brand-amber/35 px-4 py-1.5 rounded-full z-10">
                  Preparing Match Arena
                </span>
                
                <h1 className="font-outfit font-black text-3xl uppercase tracking-wide mt-6 z-10">
                  {game.name} LOBBY
                </h1>
                
                <div className="flex items-center gap-8 my-10 z-10">
                  {players.slice(0, 3).map((p, index) => (
                    <div key={p.id} className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border-4 border-brand-amber/80 bg-slate-950 flex items-center justify-center font-outfit font-black text-lg relative animate-pulse">
                        {p.avatar}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-2 font-mono">{p.name}</span>
                    </div>
                  ))}
                  {players.length > 3 && (
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 bg-slate-950 flex items-center justify-center font-outfit font-bold text-xs text-slate-500">
                      +{players.length - 3}
                    </div>
                  )}
                </div>

                <div className="relative flex items-center justify-center w-36 h-36 my-6 z-10">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 rounded-full bg-brand-amber/10 border border-brand-amber/30"
                  />
                  <div className="w-24 h-24 rounded-full bg-brand-amber text-slate-950 flex items-center justify-center font-outfit font-black text-5xl shadow-lg">
                    {countdown}
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase mt-4 z-10">
                  Match Starts In A Moment...
                </p>
              </motion.div>
            )}

            {/* PART 9 — GAME LOADING SCREEN */}
            {gameState === "loading" && (
              <motion.div
                key="loading-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 text-white rounded-3xl p-12 text-center flex flex-col justify-between items-center min-h-[550px] shadow-2xl relative"
              >
                <div className="w-full flex justify-between items-center border-b border-slate-800/80 pb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{game.thumb}</span>
                    <div className="text-left">
                      <h4 className="font-outfit font-black text-sm uppercase tracking-wide">{game.name}</h4>
                      <p className="text-[10px] text-brand-amber font-mono font-bold">Region: Mumbai</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500">Lobby Code: #{roomCode}</span>
                </div>

                <div className="my-10 space-y-6 max-w-lg">
                  <div className="p-3 bg-brand-amber/5 border border-brand-amber/15 rounded-2xl">
                    <span className="font-outfit font-black text-[9px] uppercase tracking-widest text-brand-amber flex items-center justify-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Loading Tips & Advice
                    </span>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed mt-2 italic">
                      "{loadingTip}"
                    </p>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-extrabold px-1">
                    <span>Loading game arena...</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <motion.div 
                      className="h-full bg-brand-amber"
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* DYNAMIC MODULE GAME CONTAINER */}
            {gameState === "playing" && (
              <motion.div
                key="playing-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <GameContainer
                  gameIdOrSlug={gameId}
                  roomCode={roomCode}
                  onFinish={(winnerId, rankings, xp) => {
                    setGameState("results");
                  }}
                  onBack={() => {
                    setGameState("lobby");
                  }}
                />
              </motion.div>
            )}

            {/* PART 11 — MATCH RESULTS PAGE */}
            {gameState === "results" && (
              <motion.div
                key="results-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Result header banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl flex flex-col items-center">
                  <div className="absolute inset-0 bg-radial-gradient from-success/15 via-transparent to-transparent pointer-events-none" />

                  <div className="w-16 h-16 bg-brand-amber text-slate-950 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Trophy className="w-8 h-8 fill-current" />
                  </div>

                  <h1 className="font-outfit font-black text-3xl uppercase tracking-wider text-white">
                    VICTORY MATCH COMPLETED!
                  </h1>
                  <p className="text-xs text-slate-400 font-bold mt-1">Match results calculated for Lobby Room #{roomCode}.</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full mt-8 max-w-2xl border-t border-slate-800/80 pt-6 text-center">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">XP Awarded</span>
                      <p className="font-outfit font-black text-lg text-brand-amber mt-0.5">+150 XP</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Platform Coins</span>
                      <p className="font-outfit font-black text-lg text-brand-amber mt-0.5">+45 Coins</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Match Duration</span>
                      <p className="font-outfit font-black text-lg text-white mt-0.5">8m 42s</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Achievements</span>
                      <p className="font-outfit font-black text-lg text-white mt-0.5">1 Unlocked</p>
                    </div>
                  </div>
                </div>

                {/* Rankings details & Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  
                  {/* Standings table */}
                  <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <h3 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400">Match Leaderboard Standings</h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-medium">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="pb-3">Rank</th>
                            <th className="pb-3">Player</th>
                            <th className="pb-3 text-center">Role / Side</th>
                            <th className="pb-3 text-right">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {players.map((p, idx) => (
                            <tr key={p.id} className="text-white hover:bg-slate-950/40">
                              <td className="py-3 font-outfit font-black text-brand-amber">#{idx + 1}</td>
                              <td className="py-3 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-outfit font-bold text-[10px]">
                                  {p.avatar}
                                </div>
                                <span className="font-bold">{p.name}</span>
                              </td>
                              <td className="py-3 text-center text-slate-400 font-bold">{idx === 0 ? "Host / White" : "Challenger"}</td>
                              <td className="py-3 text-right text-brand-amber font-mono font-black">{idx === 0 ? "1.0 (Win)" : "0.0"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Achievements and stats column */}
                  <div className="md:col-span-4 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                      <h3 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-brand-amber" /> Achievements Unlocked
                      </h3>

                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl flex gap-3 items-center">
                        <div className="p-2.5 bg-brand-amber/10 text-brand-amber border border-brand-amber/20 rounded-xl">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-outfit font-black text-[10px] text-white uppercase tracking-wider">Lounge Challenger</h4>
                          <p className="text-[9px] text-slate-500 mt-0.5">Win a custom match room showdown.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                      <div className="flex gap-3">
                        <Button 
                          variant="secondary" 
                          onClick={handlePlayAgain}
                          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-brand-amber" />}
                          className="flex-1 uppercase font-bold text-xs h-10 border-slate-800 text-slate-300"
                        >
                          Play Again
                        </Button>
                        <Link href="/rooms" className="flex-1">
                          <Button 
                            variant="primary" 
                            className="w-full uppercase font-bold text-xs h-10 text-slate-950"
                          >
                            Browse Rooms
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Post-game Premium Monetization Ad Placement */}
                  <PlatformAdComponent placement="match_results" className="mt-6 w-full" />

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* PREMIUM INVITATION MODAL */}
      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="max-w-md w-full bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setIsInviteOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <h3 className="font-outfit font-black text-base uppercase tracking-wide">Invite Friends to Lobby</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Share connection links or invite active platform friends.</p>
              </div>

              {/* Copy links */}
              <div className="space-y-2">
                <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Direct Invitation Code</span>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest text-brand-amber flex items-center justify-between">
                    <span>#{roomCode}</span>
                    <span className="text-[9px] text-slate-500 font-sans tracking-normal uppercase font-bold">Expires in 2 hrs</span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleCopyLink}
                    className="h-10 px-4"
                  >
                    {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
                  </Button>
                </div>
              </div>

              {/* Online Friends List */}
              <div className="space-y-3 pt-2">
                <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Online Platform Friends</span>
                
                <div className="max-h-[180px] overflow-y-auto space-y-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  {ONLINE_FRIENDS.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-slate-900/60 rounded-xl transition-all">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-outfit font-bold text-xs text-white">
                          {friend.avatar}
                        </div>
                        <div>
                          <p className="font-outfit font-extrabold text-xs text-white leading-none">{friend.name}</p>
                          <span className={`text-[8px] font-bold uppercase tracking-wider ${
                            friend.status === "Online" ? "text-green-400" : friend.status === "Playing" ? "text-brand-amber" : "text-slate-600"
                          }`}>
                            {friend.status}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant={invitedFriends[friend.id] ? "secondary" : "primary"}
                        onClick={() => handleInviteFriend(friend.id, friend.name)}
                        disabled={friend.status === "Offline" || invitedFriends[friend.id]}
                        className="h-8 px-3 text-[9px] font-bold uppercase tracking-wider"
                      >
                        {invitedFriends[friend.id] ? "Invited" : "Invite"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PopupAd isOpen={isAdOpen} onClose={handleCloseAd} />
    </>
  );
}

