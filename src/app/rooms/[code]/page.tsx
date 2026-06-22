"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Sidebar } from "@/components/common/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Copy, Users, Send, AlertCircle, Crown, LogOut, Trophy, Play, Check, Plus, Eye, BookOpen, Clock, 
  HelpCircle, RefreshCw, X, ShieldAlert, Award, Zap, Share2, Gamepad2
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { getPusherClient } from "@/lib/pusher";

const getGameIcon = (id: string) => {
  switch (id) {
    case "test-arena":
      return <ShieldAlert className="w-6 h-6 text-brand-orange" />;
    case "tictactoe":
      return <Gamepad2 className="w-6 h-6 text-brand-orange" />;
    default:
      return <Gamepad2 className="w-6 h-6 text-brand-orange" />;
  }
};
import { motion, AnimatePresence } from "framer-motion";
import { GameContainer } from "@/games/container";
import { PlatformAdComponent, PopupAd } from "@/monetization/ad-components";
import { ROOMS_AVAILABLE } from "@/data/platform";
import { loadCreatedRooms } from "@/utils/mock-room-store";

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
    name: "Test Arena",
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
  tictactoe: {
    id: "tictactoe",
    name: "Tic-Tac-Toe",
    maxPlayers: 2,
    rules: "Command the classic board in high-speed, 2-player rounds.",
    description: "A fast room for quick wins, simple turns, and instant replay.",
    objectives: "Make a line of three to win.",
    duration: "Fast Rounds",
    winConditions: "Instant line of 3, or draw if full.",
    thumb: "❌",
    tips: [
      "Try to secure the center cell on your first move if possible.",
      "Always block your opponent if they have two in a row.",
      "Look for double attack opportunities to guarantee a win."
    ]
  },
};

const BOT_NAMES = [
  "AlphaBot", "CyberSlayer", "DeepLogic", "QuantumRider", "ByteSmasher", "GizmoMaster"
];

const ONLINE_FRIENDS = [
  { id: "f1", name: "XOMaster", status: "Online", avatar: "X" },
  { id: "f2", name: "BoardKing", status: "Playing", avatar: "B" },
  { id: "f3", name: "GridRunner", status: "Online", avatar: "G" },
  { id: "f4", name: "Tactician", status: "Offline", avatar: "T" },
  { id: "f5", name: "Nova", status: "Online", avatar: "N" },
];

export default function LobbyRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const resolvedParams = use(params);
  const roomCode = resolvedParams.code.toUpperCase();

  // Load game config from localStorage or default to tictactoe
  const [gameId, setGameId] = useState<string>("tictactoe");
  const [roomName, setRoomName] = useState<string>("Battle Room");
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [region, setRegion] = useState<string>("Mumbai Hub");

  // Room states
  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<{ id: string; name: string; avatar: string }[]>([
    { id: "spec1", name: "SpectatorMax", avatar: "M" },
    { id: "spec2", name: "LurkerPro", avatar: "L" },
  ]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string; isSystem?: boolean }[]>([
    { sender: "System", text: "Match room ready. Share the code to invite players.", time: "12:00", isSystem: true },
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

  const game = GAME_CONFIGS[gameId] || GAME_CONFIGS.tictactoe;
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize and sync room data with Pusher presence / private channel
  useEffect(() => {
    if (!user) return;
    const currentUserId = user.id;

    let active = true;
    let pusherChannel: any = null;

    async function initRoom() {
      try {
        const res = await fetch(`/api/rooms/${roomCode}`);
        if (!res.ok) {
          throw new Error("Lobby room not found or expired");
        }
        const json = await res.json();
        if (!json.success || !json.data) {
          throw new Error("Lobby room not found");
        }

        let currentRoom = json.data;

        // Auto-join if user is not currently in the room
        const userInRoom = currentRoom.players.some((p: any) => p.userId === currentUserId);
        if (!userInRoom) {
          const joinRes = await fetch(`/api/rooms/${roomCode}/join`, {
            method: "POST",
          });
          const joinJson = await joinRes.json();
          if (!joinJson.success || !joinJson.data) {
            throw new Error(joinJson.error?.message || "Failed to join room");
          }
          currentRoom = joinJson.data;
        }

        if (!active) return;

        setGameId(currentRoom.gameSlug);
        setRoomName(currentRoom.name);
        setIsPrivate(currentRoom.settings.isPrivate);
        setRegion(currentRoom.region || "Mumbai Hub");

        // Creator check using host flag
        const hostPlayer = currentRoom.players.find((p: any) => p.isHost);
        const isCreator = hostPlayer?.userId === currentUserId;
        if (currentRoom.settings.isPrivate && !isCreator && !userInRoom) {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }

        // Map backend players list to frontend structure
        const mappedPlayers = currentRoom.players.map((p: any) => ({
          id: p.userId,
          name: p.username,
          isHost: p.isHost,
          isReady: p.isReady,
          avatar: p.avatar || p.username.charAt(0),
          isAI: false,
          color: p.isHost ? "#FFC107" : "#1971C2",
        }));
        setPlayers(mappedPlayers);

        // Subscribe to Pusher Room channel
        const pusher = getPusherClient();
        pusherChannel = pusher.subscribe(`private-room-${roomCode}`);

        // Listeners for real-time room sync
        pusherChannel.bind("player-joined", (newPlayer: any) => {
          setPlayers((prev) => {
            if (prev.some((p) => p.id === newPlayer.userId)) return prev;
            return [
              ...prev,
              {
                id: newPlayer.userId,
                name: newPlayer.username,
                isHost: newPlayer.isHost,
                isReady: newPlayer.isReady,
                avatar: newPlayer.avatar || newPlayer.username.charAt(0),
                isAI: false,
                color: "#1971C2",
              },
            ];
          });
          setChatMessages((prev) => [
            ...prev,
            { sender: "System", text: `${newPlayer.username} entered the room.`, time: "Now", isSystem: true }
          ]);
        });

        pusherChannel.bind("player-left", (data: { userId: string; newHostId?: string }) => {
          setPlayers((prev) => {
            const filtered = prev.filter((p) => p.id !== data.userId);
            if (data.newHostId) {
              return filtered.map((p) => p.id === data.newHostId ? { ...p, isHost: true, isReady: true } : p);
            }
            return filtered;
          });
          setChatMessages((prev) => [
            ...prev,
            { sender: "System", text: `A player left the room.`, time: "Now", isSystem: true }
          ]);
        });

        pusherChannel.bind("player-ready", (data: { userId: string; isReady: boolean }) => {
          setPlayers((prev) =>
            prev.map((p) => (p.id === data.userId ? { ...p, isReady: data.isReady } : p))
          );
        });

        pusherChannel.bind("match-started", (data: { matchId: string; gameSlug: string }) => {
          // Tunnel redirection to gameplay screen!
          router.push(`/play/${data.gameSlug}?match=${data.matchId}`);
        });

      } catch (err: any) {
        console.error("Lobby room initialization error:", err);
        if (active) {
          toast(err.message || "Failed to establish link with lobby room", "error");
          router.push("/rooms");
        }
      }
    }

    initRoom();

    return () => {
      active = false;
      if (pusherChannel) {
        const pusher = getPusherClient();
        pusher.unsubscribe(`private-room-${roomCode}`);
      }
    };
  }, [roomCode, user, router, toast]);

  // Handle password entry
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/rooms/${roomCode}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      const requiredPasscode = json.data?.settings?.passcode || "1234";

      if (passwordInput === requiredPasscode) {
        setIsLocked(false);
        setPasswordError("");
        setChatMessages((prev) => [
          ...prev,
          { sender: "System", text: "You have unlocked and joined the private lobby room.", time: "Now", isSystem: true }
        ]);
      } else {
        setPasswordError("Incorrect Passcode. Access Denied.");
      }
    } catch (err) {
      setPasswordError("Failed to verify room credentials");
    }
  };

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Loading Screen simulation logic (unused but kept for layout type safety)
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

  // Countdown timer logic (unused but kept for type safety)
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
      if (players.length >= game.maxPlayers) {
        alert("The game slots are currently full! Remove a bot or wait for a slot.");
        return;
      }
      setIsSpectatingOnly(false);
      setSpectators(prev => prev.filter(s => s.name !== (user?.username || "You")));
      setPlayers(prev => [...prev, { id: user?.id || "p1", name: user?.username || "You", isHost: false, isReady: false, avatar: (user?.username || "Y").charAt(0), isAI: false, color: "#1971C2" }]);
      setChatMessages(prev => [...prev, { sender: "System", text: "You joined as a player.", time: "Now", isSystem: true }]);
    } else {
      setIsSpectatingOnly(true);
      setPlayers(prev => prev.filter(p => p.id !== user?.id));
      setSpectators(prev => [...prev, { id: user?.id || "spec-you", name: user?.username || "You", avatar: (user?.username || "Y").charAt(0) }]);
      setChatMessages(prev => [...prev, { sender: "System", text: "You switched to Spectator Mode.", time: "Now", isSystem: true }]);
    }
  };

  // Lobby slot logic
  const handleAddAI = () => {
    if (players.length >= game.maxPlayers) return;
    const botIndex = Math.floor(Math.random() * BOT_NAMES.length);
    const botName = BOT_NAMES[botIndex] + ` [AI]`;
    
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

  // Toggle ready status via PATCH API
  const handleToggleReady = async () => {
    const me = players.find((p) => p.id === user?.id);
    if (!me) return;

    const nextReady = !me.isReady;
    
    setPlayers((prev) =>
      prev.map((p) => (p.id === user?.id ? { ...p, isReady: nextReady } : p))
    );

    try {
      const res = await fetch(`/api/rooms/${roomCode}/ready`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isReady: nextReady }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      toast("Failed to update ready state", "error");
      setPlayers((prev) =>
        prev.map((p) => (p.id === user?.id ? { ...p, isReady: !nextReady } : p))
      );
    }
  };

  // Start match immediately via POST /api/matches (tunnel handoff)
  const handleStartMatch = async () => {
    if (!hasShownStartAd) {
      setIsAdOpen(true);
      return;
    }
    
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode }),
      });
      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error?.message || "Failed to initialize match");
      }
      
      const match = json.data;
      const matchId = match._id;
      // Host immediately redirects (other guests will be redirected by Pusher 'match-started' broadcast)
      router.push(`/play/${match.gameSlug}?match=${matchId}`);
    } catch (err: any) {
      toast(err.message || "Could not launch match arena", "error");
    }
  };

  const handleCloseAd = async () => {
    setIsAdOpen(false);
    setHasShownStartAd(true);
    
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode }),
      });
      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error?.message || "Failed to initialize match");
      }
      
      const match = json.data;
      const matchId = match._id;
      router.push(`/play/${match.gameSlug}?match=${matchId}`);
    } catch (err: any) {
      toast(err.message || "Could not launch match arena", "error");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await fetch(`/api/rooms/${roomCode}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error leaving room:", err);
    } finally {
      router.push("/rooms");
    }
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
            className="flex items-center justify-between p-2.5 bg-[var(--slate-900)] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000]"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full border border-black text-slate-950 font-outfit font-black flex items-center justify-center text-xs shadow-[1px_1px_0px_#000000]"
                style={{ backgroundColor: player.color || "#FFC107" }}
              >
                {player.avatar}
              </div>
              <div>
                <p className="font-outfit font-extrabold text-xs text-slate-50 flex items-center gap-1">
                  {player.name}
                  {player.isHost && (
                    <span className="text-[7px] font-black uppercase tracking-wider bg-brand-orange/10 border border-black text-brand-orange px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-[0.5px_0.5px_0px_#000000]">
                      <Crown className="w-2 h-2" /> Host
                    </span>
                  )}
                  {player.isAI && (
                    <span className="text-[7px] font-black uppercase tracking-wider bg-green-550/10 border border-black text-green-400 px-1.5 py-0.5 rounded-full shadow-[0.5px_0.5px_0px_#000000]">
                      AI
                    </span>
                  )}
                </p>
                <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Ping: {player.isAI ? "0ms" : "24ms"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[8px] font-black font-outfit uppercase tracking-widest px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000000] ${
                player.isReady 
                  ? "bg-success text-slate-950" 
                  : "bg-slate-700 text-slate-400"
              }`}>
                {player.isReady ? "Ready" : "Waiting"}
              </span>

              {players.length > 1 && !player.isHost && (
                <button
                  onClick={() => handleRemovePlayer(player.id)}
                  className="p-1 rounded border border-black text-slate-500 hover:text-red-400 hover:bg-[#ff4d4d]/10 transition-all cursor-pointer shadow-[1px_1px_0px_#000000] active:translate-y-0.5"
                  title="Remove player"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        );
      } else {
        slots.push(
          <div
            key={`empty-${i}`}
            className="flex items-center justify-between p-2.5 bg-[var(--slate-950)]/40 border-2 border-dashed border-black/40 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-dashed border-black/40 text-slate-700 flex items-center justify-center font-outfit font-extrabold text-xs">
                +
              </div>
              <div>
                <p className="font-outfit font-bold text-xs text-slate-650">Vacant Slot</p>
                <p className="text-[9px] text-slate-800 font-semibold mt-0.5">Waiting for player...</p>
              </div>
            </div>

            <button
              onClick={handleAddAI}
              className="h-7 px-2.5 border border-black text-[8px] font-black bg-white text-slate-950 uppercase tracking-widest shadow-[1.5px_1.5px_0px_#000000] hover:bg-brand-orange hover:text-slate-950 transition-all cursor-pointer active:translate-y-0.5"
            >
              Add Bot
            </button>
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
        <main className="flex-1 pt-24 bg-[var(--slate-950)] text-slate-50 min-h-screen pb-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-[var(--slate-800)] border-[3px] border-black p-6 rounded-3xl space-y-4 text-center shadow-[4px_4px_0px_#000000]"
          >
            <div className="w-12 h-12 bg-brand-orange border-2.5 border-black rounded-xl flex items-center justify-center mx-auto text-slate-950 shadow-[2px_2px_0px_#000000]">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.15em] bg-brand-orange text-slate-950 border border-black px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_#000000] mb-2 inline-block">
                Private Room
              </span>
              <h1 className="font-outfit font-black text-lg uppercase tracking-wide mt-2 text-slate-50">Lobby Code Required</h1>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold leading-relaxed">Room #{roomCode} is passcode protected.</p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="ENTER PASSCODE"
                  maxLength={10}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full h-10 bg-[var(--slate-900)] border-2 border-black rounded-xl px-4 text-center text-xs font-space font-black tracking-[0.4em] text-brand-orange shadow-[2px_2px_0px_#000000] focus:outline-none focus:border-brand-orange focus:shadow-[3px_3px_0px_#000000] transition-all"
                />
                {passwordError && (
                  <p className="text-[9px] text-danger font-black mt-1.5 uppercase tracking-wide">{passwordError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Link href="/rooms" className="flex-1">
                  <button type="button" className="w-full h-9 text-[9px] font-black tracking-widest bg-slate-800 text-slate-300 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] hover:bg-slate-700 active:translate-y-0.5 transition-all cursor-pointer">
                    Cancel
                  </button>
                </Link>
                <button type="submit" className="btn-neo flex-1 h-9 text-[9px] font-black tracking-widest rounded-xl shadow-[2px_2px_0px_#000000]">
                  Unlock Room
                </button>
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

      <main className="flex-1 pt-24 bg-[var(--slate-950)] text-slate-50 min-h-screen pb-20 selection:bg-brand-orange selection:text-slate-950">
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--slate-800)] border-2 border-black p-4 rounded-2xl shadow-[3.5px_3.5px_0px_#000000]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-slate-950 border-2 border-black rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                      {getGameIcon(game.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8.5px] font-black uppercase tracking-[0.15em] bg-brand-orange text-slate-950 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000000]">
                          Room Code: #{roomCode}
                        </span>
                        {isPrivate && (
                          <span className="p-0.5 rounded bg-[var(--slate-900)] border border-black text-brand-orange shadow-[1px_1px_0px_#000000]">
                            <ShieldAlert className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <h1 className="font-outfit font-black text-base uppercase tracking-wide mt-1.5 text-slate-50">
                        {roomName}
                      </h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsInviteOpen(true)}
                      className="h-8.5 px-3.5 border-2 border-black bg-[var(--slate-900)] text-slate-50 hover:text-brand-orange shadow-[2px_2px_0px_#000000] font-black text-[9px] uppercase tracking-widest active:translate-y-0.5 transition-all cursor-pointer rounded-lg flex items-center justify-center"
                    >
                      Invite Friends
                    </button>
                    <button
                      onClick={handleLeaveRoom}
                      className="h-8.5 px-3.5 border-2 border-black bg-[#ff4d4d] text-black font-black text-[9px] uppercase tracking-widest shadow-[2px_2px_0px_#000000] active:translate-y-0.5 hover:bg-[#ff6666] transition-all cursor-pointer rounded-lg flex items-center justify-center"
                    >
                      Leave Room
                    </button>
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
                    <div className="bg-[var(--slate-800)] border-2 border-black p-4 rounded-2xl shadow-[3.5px_3.5px_0px_#000000] space-y-3">
                      <div className="flex justify-between items-center pb-1">
                        <h3 className="font-outfit font-black text-[9px] uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-brand-orange" />
                          Players ({players.length}/{game.maxPlayers})
                        </h3>
                        
                        <button
                          onClick={handleToggleSpectatorMode}
                          className="flex items-center text-[7.5px] font-black uppercase tracking-widest text-brand-orange bg-[var(--slate-900)] border border-black px-2 py-1 rounded-lg shadow-[1.5px_1.5px_0px_#000000] active:translate-y-0.5 hover:text-slate-50 cursor-pointer"
                        >
                          {isSpectatingOnly ? "Join as Player" : "Switch to Spectator"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {renderPlayerSlots()}
                      </div>
                    </div>

                    {/* Game Rules panel */}
                    <div className="bg-[var(--slate-800)] border-2 border-black p-4 rounded-2xl shadow-[3.5px_3.5px_0px_#000000] space-y-4">
                      <h3 className="font-outfit font-black text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-orange" />
                        Rules & Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-0.5">
                          <span className="font-outfit font-bold text-[8.5px] uppercase tracking-widest text-slate-500">Objectives</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">{game.objectives}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-outfit font-bold text-[8.5px] uppercase tracking-widest text-slate-500">Duration</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-brand-orange" />
                            {game.duration}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-outfit font-bold text-[8.5px] uppercase tracking-widest text-slate-500">Win Conditions</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">{game.winConditions}</p>
                        </div>
                      </div>

                      <div className="bg-[var(--slate-900)] p-3 border border-black rounded-xl flex gap-2.5 items-start shadow-[2px_2px_0px_#000000]">
                        <HelpCircle className="w-4.5 h-4.5 text-brand-orange shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-outfit font-extrabold text-[9px] text-slate-200 uppercase tracking-wide">About Game</h4>
                          <p className="text-[9.5px] text-slate-400 mt-0.5 leading-relaxed font-medium">
                            {game.description} The game room is ready for players to join.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column - Chat & Launch Panel */}
                  <div className="lg:col-span-4 space-y-4">
                    
                    {/* Chat Board */}
                    <div className="bg-[var(--slate-800)] border-2 border-black p-4 rounded-2xl shadow-[3.5px_3.5px_0px_#000000] flex flex-col h-[310px]">
                      <h3 className="font-outfit font-black text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                        Room Chat
                      </h3>

                      {/* Messages scroll box */}
                      <div className="flex-1 overflow-y-auto bg-[var(--slate-900)] border-2 border-black rounded-xl p-3 flex flex-col gap-2 mb-3 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]">
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
                                <span className="text-[8.5px] font-bold font-outfit text-slate-500">
                                  {msg.sender}
                                </span>
                                <span className="text-[7.5px] text-slate-650 font-semibold">{msg.time}</span>
                              </div>
                            )}

                            <div
                              className={`text-[10px] font-semibold leading-relaxed rounded-xl p-2 ${
                                msg.isSystem
                                  ? "bg-slate-900/30 text-slate-550 border border-slate-900/40 text-[8.5px] font-mono py-0.5 rounded"
                                  : msg.sender === "You"
                                  ? "bg-brand-orange text-slate-950 border-2 border-black font-extrabold rounded-xl rounded-tr-none shadow-[1.5px_1.5px_0px_#000000]"
                                  : "bg-[var(--slate-950)] text-slate-50 border-2 border-black font-bold rounded-xl rounded-tl-none shadow-[1.5px_1.5px_0px_#000000]"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Input form */}
                      <form onSubmit={handleSendMessage} className="flex gap-1.5">
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Type message..."
                          className="flex-1 bg-[var(--slate-900)] text-[11px] font-bold border-2 border-black rounded-lg px-3 py-1.5 outline-none focus:border-brand-orange placeholder:text-slate-500 text-slate-50 shadow-[1.5px_1.5px_0px_#000000]"
                        />
                        <button type="submit" className="btn-neo h-8 px-3 rounded-lg flex items-center justify-center">
                          <Send className="w-3 h-3 text-slate-950 stroke-[3]" />
                        </button>
                      </form>
                    </div>

                    {/* Launch / Start Panel */}
                    <div className="bg-[var(--slate-800)] border-2 border-black p-4 rounded-2xl shadow-[3.5px_3.5px_0px_#000000] space-y-3">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 font-outfit font-black uppercase tracking-wider">Ready Check</span>
                        <span className="text-brand-orange font-mono font-black">
                          {players.filter(p => p.isReady).length}/{players.length} Ready
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {!isSpectatingOnly && (
                          <button
                            onClick={handleToggleReady}
                            className={`flex-1 h-9.5 uppercase font-black text-[11px] rounded-lg border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer ${
                              players.find((p) => p.id === "p1")?.isReady 
                                ? "bg-slate-800 text-slate-50 hover:bg-slate-700" 
                                : "bg-brand-orange text-slate-950 hover:bg-brand-orange/90"
                            }`}
                          >
                            {players.find((p) => p.id === "p1")?.isReady ? "Cancel Ready" : "Ready Up"}
                          </button>
                        )}

                        {players.find((p) => p.id === "p1")?.isHost && (
                          <button
                            onClick={handleStartMatch}
                            disabled={players.length < 2 || !players.every(p => p.isReady)}
                            className="btn-neo flex-1 h-9.5 text-slate-950 uppercase font-black text-[11px] tracking-wider rounded-lg shadow-[2px_2px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            Start Match
                          </button>
                        )}
                      </div>

                      {players.length < 2 && (
                        <p className="text-[9px] text-slate-400 font-bold text-center flex items-center justify-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-brand-orange" />
                          At least 2 players are required to start.
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
                className="max-w-md mx-auto bg-[var(--slate-800)] border-3 border-black text-slate-50 rounded-3xl p-6 text-center flex flex-col justify-center items-center min-h-[380px] shadow-[4px_4px_0px_#000000] relative overflow-hidden"
              >
                <span className="text-[9px] font-black uppercase tracking-widest bg-brand-orange/15 text-brand-orange border border-black px-3 py-1 rounded shadow-[1.5px_1.5px_0px_#000000] z-10">
                  Starting Game
                </span>
                
                <h1 className="font-outfit font-black text-xl uppercase tracking-wide mt-4 z-10">
                  {game.name} ROOM
                </h1>
                
                <div className="flex items-center gap-6 my-6 z-10">
                  {players.slice(0, 3).map((p) => (
                    <div key={p.id} className="relative flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full border-2 border-black bg-[var(--slate-900)] flex items-center justify-center font-outfit font-black text-base relative shadow-[2px_2px_0px_#000000]">
                        {p.avatar}
                      </div>
                      <span className="text-[9px] font-black text-slate-450 mt-1.5">{p.name}</span>
                    </div>
                  ))}
                  {players.length > 3 && (
                    <div className="w-10 h-10 rounded-full border border-dashed border-black/40 bg-[var(--slate-900)] flex items-center justify-center font-outfit font-bold text-xs text-slate-500">
                      +{players.length - 3}
                    </div>
                  )}
                </div>

                <div className="relative flex items-center justify-center w-24 h-24 my-3 z-10">
                  <div className="w-18 h-18 rounded-full bg-brand-orange border-3 border-black text-slate-950 flex items-center justify-center font-outfit font-black text-3xl shadow-[2.5px_2.5px_0px_#000000]">
                    {countdown}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase mt-3 z-10">
                  Game Starts In A Moment...
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
                className="max-w-md mx-auto bg-[var(--slate-800)] border-3 border-black text-slate-50 rounded-3xl p-6 text-center flex flex-col justify-between items-center min-h-[380px] shadow-[4px_4px_0px_#000000] relative"
              >
                <div className="w-full flex justify-between items-center border-b-2 border-black/40 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-950 border border-black rounded-lg flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                      {getGameIcon(game.id)}
                    </div>
                    <div className="text-left">
                      <h4 className="font-outfit font-black text-xs uppercase tracking-wide">{game.name}</h4>
                      <p className="text-[9px] text-brand-orange font-bold uppercase tracking-widest mt-0.5">Region: {region}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room: #{roomCode}</span>
                </div>

                <div className="my-6 space-y-4 max-w-sm">
                  <div className="p-3 bg-[var(--slate-900)] border border-black rounded-xl shadow-[2px_2px_0px_#000000]">
                    <span className="font-outfit font-black text-[8px] uppercase tracking-widest text-brand-orange flex items-center justify-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Loading Tips & Advice
                    </span>
                    <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-2 italic">
                      "{loadingTip}"
                    </p>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-450 tracking-widest px-1">
                    <span>Loading game...</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-[var(--slate-900)] border border-black rounded-full overflow-hidden shadow-[1.5px_1.5px_0px_#000000]">
                    <motion.div 
                      className="h-full bg-brand-orange"
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

            {/* PART 11 — MATCH RESULTS SCREEN */}
            {gameState === "results" && (
              <motion.div
                key="results-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto space-y-4"
              >
                {/* Result header banner */}
                <div className="bg-[var(--slate-800)] border-3 border-black rounded-3xl p-5 text-center relative overflow-hidden shadow-[4px_4px_0px_#000000] flex flex-col items-center">
                  <div className="w-12 h-12 bg-brand-orange border-2 border-black text-slate-950 rounded-xl flex items-center justify-center mb-3 shadow-[2.5px_2.5px_0px_#000000]">
                    <Trophy className="w-6 h-6 fill-current" />
                  </div>

                  <h1 className="font-outfit font-black text-xl uppercase tracking-wider text-slate-50">
                    Match Completed!
                  </h1>
                  <p className="text-[11px] text-slate-400 font-bold mt-1">Results calculated for Room #{roomCode}.</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-5 border-t-2 border-black/40 pt-4 text-center">
                    <div>
                      <span className="text-[8.5px] font-black text-slate-550 uppercase tracking-widest">XP Awarded</span>
                      <p className="font-outfit font-black text-base text-brand-orange mt-0.5">+150 XP</p>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-black text-slate-550 uppercase tracking-widest">Coins</span>
                      <p className="font-outfit font-black text-base text-brand-orange mt-0.5">+45 Coins</p>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-black text-slate-550 uppercase tracking-widest">Duration</span>
                      <p className="font-outfit font-black text-base text-slate-50 mt-0.5">8m 42s</p>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-black text-slate-550 uppercase tracking-widest">Achievements</span>
                      <p className="font-outfit font-black text-base text-slate-50 mt-0.5">1 Unlocked</p>
                    </div>
                  </div>
                </div>

                {/* Rankings details & Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  
                  {/* Standings table */}
                  <div className="md:col-span-8 bg-[var(--slate-800)] border-2 border-black rounded-2xl p-4 space-y-3 shadow-[3.5px_3.5px_0px_#000000]">
                    <h3 className="font-outfit font-black text-[11px] uppercase tracking-wider text-slate-400">Leaderboard Standings</h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] font-semibold">
                        <thead>
                          <tr className="border-b-2 border-black/40 text-[9px] font-black text-slate-555 uppercase tracking-wider">
                            <th className="pb-2">Rank</th>
                            <th className="pb-2">Player</th>
                            <th className="pb-2 text-center">Role / Side</th>
                            <th className="pb-2 text-right">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/20">
                          {players.map((p, idx) => (
                            <tr key={p.id} className="text-slate-50 hover:bg-black/10">
                              <td className="py-2.5 font-outfit font-black text-brand-orange">#{idx + 1}</td>
                              <td className="py-2.5 flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-slate-950 border border-black flex items-center justify-center font-outfit font-black text-[9px] shadow-[1px_1px_0px_#000000]">
                                  {p.avatar}
                                </div>
                                <span className="font-bold">{p.name}</span>
                              </td>
                              <td className="py-2.5 text-center text-slate-455 font-bold">{idx === 0 ? "Host / White" : "Challenger"}</td>
                              <td className="py-2.5 text-right text-brand-orange font-mono font-black">{idx === 0 ? "1.0 (Win)" : "0.0"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Achievements and stats column */}
                  <div className="md:col-span-4 space-y-4">
                    <div className="bg-[var(--slate-800)] border-2 border-black rounded-2xl p-4 space-y-3 shadow-[3.5px_3.5px_0px_#000000]">
                      <h3 className="font-outfit font-black text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-brand-orange" /> Achievements
                      </h3>

                      <div className="bg-[var(--slate-900)] border-2 border-black p-2.5 rounded-xl flex gap-2.5 items-center shadow-[2px_2px_0px_#000000]">
                        <div className="p-1.5 bg-brand-orange/15 text-brand-orange border border-black rounded-lg shadow-[1px_1px_0px_#000000]">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-outfit font-black text-[9px] text-slate-50 uppercase tracking-wider">Challenger</h4>
                          <p className="text-[8px] font-bold text-slate-550 mt-0.5">Win a custom match room.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[var(--slate-800)] border-2 border-black rounded-2xl p-4 space-y-3 shadow-[3.5px_3.5px_0px_#000000]">
                      <div className="flex gap-2">
                        <button 
                          onClick={handlePlayAgain}
                          className="flex-1 uppercase font-black text-[11px] h-9.5 bg-slate-800 text-slate-350 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000000] cursor-pointer hover:bg-slate-700 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                        >
                          Play Again
                        </button>
                        <Link href="/rooms" className="flex-1">
                          <button 
                            className="btn-neo w-full uppercase font-black text-[11px] h-9.5 text-slate-950 rounded-lg shadow-[2px_2px_0px_#000000]"
                          >
                            Rooms
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Post-game Premium Monetization Ad Placement */}
                  <PlatformAdComponent placement="match_results" className="mt-4 w-full" />

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* PREMIUM INVITATION MODAL */}
      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="max-w-md w-full bg-[var(--slate-800)] border-[4px] border-black text-slate-50 rounded-[2.5rem] p-6 space-y-5 shadow-[8px_8px_0px_#000000] relative"
            >
              <button
                onClick={() => setIsInviteOpen(false)}
                className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full border-2 border-black bg-[#ff4d4d] text-black shadow-[2px_2px_0px_#000000] active:translate-y-0.5 hover:bg-[#ff6666] cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[3.5]" />
              </button>

              <div>
                <h3 className="font-outfit font-black text-base uppercase tracking-wide">Invite Friends</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Share connection links or invite platform friends.</p>
              </div>

              {/* Copy links */}
              <div className="space-y-2">
                <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Room Code</span>
                <div className="flex gap-2">
                  <div className="flex-grow bg-[var(--slate-900)] border-[3px] border-black px-4 py-2.5 rounded-xl text-xs font-mono font-black tracking-widest text-brand-orange flex items-center justify-between shadow-[2px_2px_0px_#000000]">
                    <span>#{roomCode}</span>
                    <span className="text-[9px] text-slate-550 font-sans tracking-normal uppercase font-bold">Expires in 2 hrs</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="btn-neo h-11 px-4 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000000]"
                  >
                    {copied ? <Check className="w-4 h-4 text-slate-950 stroke-[3.5]" /> : <Copy className="w-4 h-4 text-slate-950" />}
                  </button>
                </div>
              </div>

              {/* Online Friends List */}
              <div className="space-y-3 pt-2">
                <span className="font-outfit font-bold text-[9px] uppercase tracking-widest text-slate-500">Online Friends</span>
                
                <div className="max-h-[180px] overflow-y-auto space-y-2 bg-[var(--slate-900)] p-2.5 rounded-xl border-[3px] border-black shadow-[inset_2px_2px_0px_rgba(0,0,0,0.15)]">
                  {ONLINE_FRIENDS.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-black/20 rounded-xl transition-all">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-black flex items-center justify-center font-outfit font-black text-xs text-slate-50 shadow-[1px_1px_0px_#000000]">
                          {friend.avatar}
                        </div>
                        <div>
                          <p className="font-outfit font-black text-xs text-slate-50 leading-none">{friend.name}</p>
                          <span className={`text-[8px] font-bold uppercase tracking-wider ${
                            friend.status === "Online" ? "text-green-400" : friend.status === "Playing" ? "text-brand-orange" : "text-slate-650"
                          }`}>
                            {friend.status}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInviteFriend(friend.id, friend.name)}
                        disabled={friend.status === "Offline" || invitedFriends[friend.id]}
                        className={`h-8 px-3 text-[9px] font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_#000000] cursor-pointer ${
                          invitedFriends[friend.id] 
                            ? "bg-slate-800 text-slate-500 border-2 border-transparent" 
                            : "btn-neo"
                        }`}
                      >
                        {invitedFriends[friend.id] ? "Invited" : "Invite"}
                      </button>
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
