"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import {
  User,
  Calendar,
  Trophy,
  Activity,
  Users,
  Check,
  Edit3,
  Save,
  Bell,
  Shield,
  Eye,
  LogOut,
  Mail,
  Gamepad2,
  Crown,
  Flame,
  Star,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  Laptop,
  Smartphone,
  Tablet,
  Key,
  ShieldCheck,
  Zap,
  Globe,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useTheme } from "@/context/theme-context";
import { resolveAvatarUrl, PRELOADED_AVATARS } from "@/utils/avatar-generator";

// Map badge keys to Lucide React icons to replace raw emojis
const BADGE_ICONS: Record<string, React.ComponentType<any>> = {
  trophy: Trophy,
  gamepad: Gamepad2,
  crown: Crown,
  brain: Brain,
  shield: Shield,
  flame: Flame,
  star: Star,
};

// Gamer Level-wise Titles helper
function getGamerStatusAndLevel(wins: number) {
  const level = Math.floor(wins / 10) + 1;
  const progressPercent = (wins % 10) * 10;
  
  let status = "Recruit";
  if (level === 1) status = "Recruit";
  else if (level === 2) status = "Squire";
  else if (level === 3) status = "Newbie";
  else if (level === 4) status = "Contender";
  else if (level === 5) status = "Skirmisher";
  else if (level === 6) status = "Fighter";
  else if (level === 7) status = "Duelist";
  else if (level === 8) status = "Warrior";
  else if (level === 9) status = "Veteran";
  else if (level === 10) status = "Elite";
  else if (level === 11) status = "Master";
  else if (level === 12) status = "Champion";
  else if (level === 13) status = "Grandmaster";
  else if (level === 14) status = "Warlord";
  else if (level === 15) status = "Hero";
  else if (level === 16) status = "Vanquisher";
  else if (level === 17) status = "Legend";
  else if (wins >= 650) {
    status = "Supreme Sovereign";
  } else {
    // Generate titles dynamically for other tiers
    const tiers = ["Specialist", "Gladiator", "Executioner", "Sentinel", "Avenger", "Conqueror", "Titan", "Immortal", "Ascended", "Demigod", "Deity"];
    const tierIndex = Math.min(tiers.length - 1, Math.floor((level - 18) / 5));
    const subTier = ((level - 18) % 5) + 1;
    status = `${tiers[tierIndex]} Tier ${subTier}`;
  }

  // Cap levels up to 1000
  const finalLevel = Math.min(1000, level);
  if (finalLevel === 1000) {
    status = "Antigravity God";
  }

  return { level: finalLevel, progressPercent, status };
}

// Relative time helper
function formatRelativeTime(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    return "Recently";
  }
}

// Dynamically awarded game-wise badges
const BADGES_LIST = [
  { id: "bl_1", title: "Novice", desc: "Win 1 Tic-Tac-Toe game", winsNeeded: 1, gameSlug: "tictactoe", icon: "shield", color: "bg-slate-500/20 border-slate-500 text-slate-300" },
  { id: "bl_2", title: "Newbie", desc: "Win 20 Tic-Tac-Toe games", winsNeeded: 20, gameSlug: "tictactoe", icon: "gamepad", color: "bg-emerald-500/20 border-emerald-500 text-emerald-300" },
  { id: "bl_3", title: "Fighter", desc: "Win 50 Tic-Tac-Toe games", winsNeeded: 50, gameSlug: "tictactoe", icon: "flame", color: "bg-orange-500/20 border-orange-500 text-orange-300" },
  { id: "bl_4", title: "Veteran", desc: "Win 80 Tic-Tac-Toe games", winsNeeded: 80, gameSlug: "tictactoe", icon: "trophy", color: "bg-amber-500/20 border-amber-500 text-amber-300" },
  { id: "bl_5", title: "Master", desc: "Win 100 Tic-Tac-Toe games", winsNeeded: 100, gameSlug: "tictactoe", icon: "brain", color: "bg-indigo-500/20 border-indigo-500 text-indigo-300" },
  { id: "bl_6", title: "Warlord", desc: "Win 130 Tic-Tac-Toe games", winsNeeded: 130, gameSlug: "tictactoe", icon: "crown", color: "bg-pink-500/20 border-pink-500 text-pink-300" },
  { id: "bl_7", title: "Legend", desc: "Win 160 Tic-Tac-Toe games", winsNeeded: 160, gameSlug: "tictactoe", icon: "star", color: "bg-red-500/20 border-red-500 text-red-300" },
  { id: "bl_8", title: "Sovereign", desc: "Win 650 Tic-Tac-Toe games", winsNeeded: 650, gameSlug: "tictactoe", icon: "crown", color: "bg-cyan-500/20 border-cyan-500 text-cyan-300" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme: activeTheme, setTheme: setActiveTheme } = useTheme();
  const {
    user,
    sessions,
    loginHistory,
    logout,
    logoutDevice,
    logoutAllDevices,
    updateProfile,
    notificationSettings,
    privacySettings,
    appearanceSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updateAppearanceSettings,
    changePassword,
    toggleTwoFactor,
    verifyAccount
  } = useAuth();
  // Mode Switchers state
  const [activeTab, setActiveTab] = useState<"combat" | "settings">("combat");

  // Editable fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState(user?.username || "");
  const [tempBio, setTempBio] = useState(user?.bio || "");
  const [selectedAvatarPreset, setSelectedAvatarPreset] = useState(user?.avatarUrl || "preset-1");

  // Security tab states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationDocType, setVerificationDocType] = useState("github");
  const [verificationProofUrl, setVerificationProofUrl] = useState("");

  // Live database user state
  const [dbUser, setDbUser] = useState<any>(null);
  const [isLoadingDbUser, setIsLoadingDbUser] = useState(true);

  // Live lists states
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);

  const displayedUser = dbUser || user;

  // Format game wins stats for Bar Graph
  const gameStatsData = useMemo(() => {
    const statsObj = displayedUser?.stats?.gameStats || {};
    const list = Object.entries(statsObj).map(([key, data]: [string, any]) => {
      let displayName = key;
      if (key === "tictactoe" || key === "tic-tac-toe") displayName = "Tic-Tac-Toe";
      else if (key === "test-arena" || key === "sandbox") displayName = "Sandbox Arena";
      else {
        displayName = key.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }
      return {
        game: displayName,
        wins: data.wins || 0,
        played: data.played || 0,
      };
    });
    // Add default zero state for Tic-Tac-Toe if not played yet to ensure there's at least one bar
    if (!list.some(item => item.game === "Tic-Tac-Toe")) {
      list.push({ game: "Tic-Tac-Toe", wins: 0, played: 0 });
    }
    return list.sort((a, b) => b.wins - a.wins);
  }, [displayedUser]);

  const fetchDbUser = async () => {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setDbUser(result.data);
          setTempUsername(result.data.username || "");
          setTempBio(result.data.bio || "");
          if (result.data.avatar) {
            setSelectedAvatarPreset(result.data.avatar);
          }
        }
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    } finally {
      setIsLoadingDbUser(false);
    }
  };

  useEffect(() => {
    if (user) {
      setTempUsername(user.username || "");
      setTempBio(user.bio || "");
      setSelectedAvatarPreset(user.avatarUrl || "preset-1");
      fetchDbUser();

      // Fetch match history from database in real time
      fetch("/api/matches")
        .then(res => res.json())
        .then(json => {
          if (json.success && Array.isArray(json.data)) {
            setMatchHistory(json.data);
          }
        })
        .catch(err => console.error("Error loading match history:", err))
        .finally(() => setIsLoadingMatches(false));

      // Fetch friends list from database in real time
      fetch("/api/friends")
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setFriends(json.data.friends || []);
          }
        })
        .catch(err => console.error("Error loading friends:", err))
        .finally(() => setIsLoadingFriends(false));
    }
  }, [user]);

  // If not logged in and session finished loading, redirect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        toast("Access restricted. Please sign in to view profiles.", "error");
        router.push("/");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [user, router, toast]);

  // Stats values
  const gamesPlayed = displayedUser?.stats?.gamesPlayed || 0;
  const victories = displayedUser?.stats?.wins || 0;
  const winStreak = displayedUser?.stats?.winStreak || 0;
  const winRatio = gamesPlayed > 0 ? ((victories / gamesPlayed) * 100).toFixed(1) : "0.0";

  // Level & XP progression values derived dynamically from victories
  const currentXP = displayedUser?.xp || 0;
  const { level: computedLevel, progressPercent, status: gamerStatus } = useMemo(() => {
    return getGamerStatusAndLevel(victories);
  }, [victories]);
  const nextLevel = computedLevel + 1;



  // Handle Profile Update
  const handleSaveProfile = async () => {
    const trimmed = tempUsername.trim();
    if (!trimmed) {
      toast("Username cannot be empty", "error");
      return;
    }
    if (trimmed.length < 3) {
      toast("Username must be at least 3 characters", "error");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      toast("Username can only contain letters, numbers, and underscores", "error");
      return;
    }

    await updateProfile({
      username: trimmed,
      bio: tempBio,
      avatarUrl: selectedAvatarPreset
    });
    setIsEditingProfile(false);
    toast("Profile updated successfully", "success");
    await fetchDbUser();
  };

  // Change Password Action
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast("Please fill in all password fields", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      toast("Password must be at least 8 characters", "error");
      return;
    }
    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      toast("Password key credentials updated", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast("Failed to update credentials. Check old password.", "error");
    }
  };

  // Toggle 2FA Action
  const handleTwoFactorToggle = async (checked: boolean) => {
    const success = await toggleTwoFactor(checked);
    if (success) {
      toast(`Two-Factor Authentication ${checked ? "activated" : "deactivated"}`, "success");
    }
  };

  // Request Identity Verification
  const handleAccountVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationProofUrl.trim()) {
      toast("Please provide a valid proof link", "warning");
      return;
    }
    const success = await verifyAccount(verificationDocType, verificationProofUrl);
    if (success) {
      toast("Verification file queued for administrator inspection", "success");
      setVerificationProofUrl("");
    }
  };

  // Handle Session Revocations
  const handleRevokeSession = (sessionId: string) => {
    logoutDevice(sessionId);
    toast("Device security authorization revoked", "success");
  };

  const handleRevokeAllSessions = () => {
    logoutAllDevices();
    toast("All other terminal sessions terminated", "info");
  };

  // Handle Logout Action
  const handleLogout = () => {
    logout();
    toast("Secure terminal connection terminated", "info");
    router.push("/");
  };

  // Mock Invite to Lobby
  const handleInviteFriend = (friendName: string) => {
    toast(`Combat link invite dispatched to ${friendName}`, "success");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-50 font-outfit">
        <Loader label="Loading Profile" />
      </div>
    );
  }

  return (
    <div className="bg-transparent text-white min-h-screen relative overflow-hidden">
      <Navbar />

      {/* Floating Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-brand-orange rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-brand-neon rounded-full filter blur-[120px] animate-pulse" />
      </div>

      {/* Floating 2D Cartoon Decors */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[25%] w-16 h-16 z-0 pointer-events-none opacity-[0.03] hidden xl:block"
      >
        <img src="/images/cartoon_gamepad.png" alt="Gamepad" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -4, 4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[8%] top-[45%] w-16 h-16 z-0 pointer-events-none opacity-[0.03] hidden xl:block"
      >
        <img src="/images/cartoon_trophy.png" alt="Trophy" className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]" />
      </motion.div>

      <main suppressHydrationWarning className="pt-20 pb-12 px-5 container mx-auto max-w-6xl relative z-10">
        <div className="grid gap-4 lg:grid-cols-3">

          {/* ── LEFT COLUMN: PROFILE CARD & SUB-TABS ── */}
          <div className="space-y-3 lg:col-span-1">
            {/* PROFILE CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-4 rounded-2xl border-2 border-black shadow-card flex flex-col items-center text-center relative overflow-hidden bg-white/2"
            >
              {/* Role badge */}
              <span className="absolute top-4 right-4 px-2.5 py-1 rounded-lg border-2 border-black text-[8px] font-black uppercase tracking-wider bg-brand-orange text-slate-950 shadow-[1.5px_1.5px_0px_#000]">
                {displayedUser.role}
              </span>

              {/* Dynamic Neobrutalist Avatar */}
              <div className="relative mb-4 mt-2">
                <img
                  src={resolveAvatarUrl(selectedAvatarPreset || "preset-1")}
                  alt={displayedUser.username}
                  className="w-16 h-16 flex-shrink-0 aspect-square rounded-full border-3 border-black object-cover bg-slate-900 shadow-[3px_3px_0px_#000]"
                />
                <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 bg-success rounded-full border-2 border-black animate-pulse" />
              </div>

              {/* 50 Preset Avatar Grid when editing */}
              {isEditingProfile && (
                <div className="w-full mb-4 p-3 border-2 border-black bg-slate-900/60 dark:bg-slate-950/60 rounded-xl shadow-[inset_2px_2px_0px_rgba(0,0,0,0.3)]">
                  <p className="text-[8px] font-black text-brand-orange uppercase tracking-widest mb-2 text-center select-none">
                    Select Avatar Skin ({PRELOADED_AVATARS.length} Options)
                  </p>
                  <div className="grid grid-cols-5 gap-2.5 max-h-48 overflow-y-auto pr-1.5 scrollbar-thin py-1">
                    {PRELOADED_AVATARS.map((preset) => {
                      const isSelected = selectedAvatarPreset === preset.id;
                      const avatarUrl = resolveAvatarUrl(preset.id);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedAvatarPreset(preset.id)}
                          className={`aspect-square rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden flex items-center justify-center bg-white shadow-[1.5px_1.5px_0px_#000] active:translate-y-px active:shadow-none ${isSelected
                              ? "border-brand-orange scale-105 shadow-[2.5px_2.5px_0px_#000000]"
                              : "border-black hover:border-brand-orange/45"
                            }`}
                          title={preset.name}
                        >
                          <img
                            src={avatarUrl}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Editable Name & Bio */}
              {isEditingProfile ? (
                <div className="w-full space-y-2 mb-3">
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="w-full h-9 bg-slate-900 border-2 border-black rounded-lg px-3 text-center text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-orange"
                    placeholder="USERNAME"
                  />
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    className="w-full h-16 bg-slate-900 border-2 border-black rounded-lg p-2.5 text-center text-[10px] font-bold text-slate-400 focus:outline-none focus:border-brand-orange resize-none"
                    placeholder="Casually competitive..."
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleSaveProfile} className="h-8 px-3 rounded-lg bg-brand-orange hover:bg-brand-dark text-slate-950 border-2 border-black font-black uppercase text-[8px] tracking-wider">
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                    <Button onClick={() => { setIsEditingProfile(false); setTempUsername(displayedUser.username); setTempBio(displayedUser.bio || ""); }} className="h-8 px-3 rounded-lg bg-slate-700 hover:bg-slate-650 text-white border-2 border-black font-black uppercase text-[8px] tracking-wider">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full mb-2">
                  <h2 className="text-lg font-black uppercase tracking-tighter text-white mb-1 flex items-center justify-center gap-2">
                    {displayedUser.username}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-xs mx-auto italic mb-4">
                    "{displayedUser.bio || "Casually competitive..."}"
                  </p>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="btn-neo w-full h-9 rounded-lg font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer mb-3 animate-none hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                </div>
              )}

              {/* Log out */}
              <Button onClick={handleLogout} className="w-full h-9 bg-white hover:bg-brand-orange text-slate-950 font-black uppercase text-[9px] tracking-widest border-2 border-black rounded-lg transition-all">
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sever Terminal
              </Button>
            </motion.div>

            {/* APPEARANCE MODULES CARD */}
            <div className="glass p-4 rounded-2xl border-2 border-black shadow-card bg-white/2">
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-4 border-b border-black pb-3">
                <Eye className="w-3.5 h-3.5 text-brand-orange" /> Appearance Modules
              </h4>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Interface Theme Mode</span>
                  <div className="grid grid-cols-2 gap-2">
                    {["dark", "light"].map(thm => (
                      <button
                        key={thm}
                        onClick={() => {
                          setActiveTheme(thm as any);
                          updateAppearanceSettings({ theme: thm as any });
                        }}
                        className={`h-9 rounded-lg text-[7px] font-black uppercase tracking-wider transition-all border-2 border-black ${activeTheme === thm ? "bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]" : "bg-white/5 text-slate-400 hover:border-brand-orange/30"}`}
                      >
                        {thm}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="glass p-1.5 rounded-xl border-2 border-black shadow-card flex flex-col gap-1.5 bg-white/2">
              <button
                onClick={() => setActiveTab("combat")}
                className={`w-full h-9 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border-2 border-black flex items-center justify-between px-3 ${activeTab === "combat" ? "bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]" : "bg-white/5 text-slate-400 hover:border-brand-orange/30"}`}
              >
                <span>Combat Files</span>
                <Gamepad2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full h-9 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border-2 border-black flex items-center justify-between px-3 ${activeTab === "settings" ? "bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]" : "bg-white/5 text-slate-400 hover:border-brand-orange/30"}`}
              >
                <span>Terminal Settings</span>
                <Shield className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: DYNAMIC CONTENT PANELS ── */}
          <div className="space-y-4 lg:col-span-2">

            {/* TAB 1: COMBAT FILES */}
            <AnimatePresence mode="wait">
              {activeTab === "combat" && (
                <motion.div
                  key="combat-panel"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  {/* LEVEL & RADAR CHART HEADER PANEL */}
                  <div className="glass p-4 rounded-2xl border-2 border-black shadow-card bg-white/2">
                    <div className="grid gap-4 md:grid-cols-5 items-center">

                      {/* Left: Stats & Level Details */}
                      <div className="md:col-span-3 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-slate-950 border-2 border-black rounded text-[7px] font-black text-brand-orange tracking-widest leading-none">PLAYER LEVEL</span>
                            <span className="px-1.5 py-0.5 bg-brand-orange border-2 border-black rounded text-[7px] font-black text-slate-950 tracking-widest leading-none uppercase">STATUS: {gamerStatus}</span>
                          </div>
                          <h3 className="text-xl font-black uppercase tracking-tighter">Player Level {computedLevel}</h3>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{currentXP.toLocaleString()} Total XP Earned</p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-brand-orange">
                            <span>LEVEL PROGRESS</span>
                            <span>{progressPercent}% TO LVL {nextLevel}</span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-950 border-2 border-black rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className="h-full bg-brand-orange shadow-[0_0_8px_rgba(255,193,7,0.4)]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className="text-center p-2 bg-slate-900/50 border border-black rounded-lg shadow-[2px_2px_0px_#000]">
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Victories</p>
                            <p className="text-sm font-space font-black text-white">{victories}</p>
                          </div>
                          <div className="text-center p-2 bg-slate-900/50 border border-black rounded-lg shadow-[2px_2px_0px_#000]">
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Win Ratio</p>
                            <p className="text-sm font-space font-black text-brand-orange">{winRatio}%</p>
                          </div>
                          <div className="text-center p-2 bg-slate-900/50 border border-black rounded-lg shadow-[2px_2px_0px_#000]">
                            <p className="text-[7px] font-black text-slate-550 uppercase tracking-widest mb-0.5">Win Streak</p>
                            <p className="text-sm font-space font-black text-white flex items-center justify-center gap-1 leading-none">
                              {winStreak} <Flame className="w-3.5 h-3.5 text-brand-orange fill-current" />
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Neobrutalist Game Win Dominance Bar Graph */}
                      <div className="md:col-span-2 flex flex-col justify-center">
                        <div className="bg-slate-900 border-3 border-black p-4 shadow-[inset_3px_3px_0px_#000000] rounded-[1.5rem] space-y-3.5 min-h-[144px]">
                          <p className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest text-center mb-1">Game Win Dominance</p>
                          {gameStatsData.map((item, index) => {
                            const maxWins = Math.max(...gameStatsData.map(g => g.wins), 1);
                            const percent = Math.max(10, Math.min(100, (item.wins / maxWins) * 100));
                            return (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-300">
                                  <span>{item.game}</span>
                                  <span className="text-brand-orange">{item.wins} Wins</span>
                                </div>
                                <div className="h-4 w-full bg-slate-950 border-2 border-black rounded-lg overflow-hidden flex items-center pr-1.5 shadow-[1.5px_1.5px_0px_#000]">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 1.0, delay: index * 0.1 }}
                                    className="h-full bg-brand-orange border-r-2 border-black"
                                    style={{ backgroundColor: index === 0 ? '#ffaa00' : '#d97706' }}
                                  />
                                  <span className="text-[7.5px] font-black text-slate-500 ml-auto pl-1">
                                    {item.played} PLY
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest mt-2.5 text-center">MASTER TIER DOMINANCE</p>
                      </div>

                    </div>

                    {/* Real-time Player Attributes Panel */}
                    <div className="glass p-3 rounded-xl border-2 border-black bg-white/2">
                      <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5 mb-3">
                        <Zap className="w-3 h-3 text-brand-orange" /> Player Attributes
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {[
                          { label: "STR", name: "Strength", value: Math.min(99, 45 + victories * 2) },
                          { label: "SPD", name: "Speed", value: Math.min(99, 50 + winStreak * 5) },
                          { label: "TAC", name: "Tactics", value: Math.min(99, Math.round(parseFloat(winRatio) || 50)) },
                          { label: "CNS", name: "Consistency", value: Math.min(99, 40 + Math.round((victories / Math.max(1, gamesPlayed)) * 40) + winStreak * 2) },
                          { label: "ADP", name: "Adaptability", value: Math.min(99, 60 + Object.keys(displayedUser?.stats?.gameStats || {}).length * 15) },
                        ].map((attr, idx) => (
                          <div key={idx} className="p-2 bg-slate-900 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] text-center flex flex-col justify-between">
                            <div>
                              <p className="text-[9px] font-space font-black text-brand-orange">{attr.label}</p>
                              <p className="text-[6.5px] font-bold text-slate-500 uppercase tracking-widest">{attr.name}</p>
                            </div>
                            <div className="mt-1.5">
                              <p className="text-sm font-space font-black text-white">{attr.value}</p>
                              <div className="h-1.5 w-full bg-slate-950 border border-black rounded-full overflow-hidden mt-1 shadow-[0.5px_0.5px_0px_#000]">
                                <div className="h-full bg-brand-orange" style={{ width: `${attr.value}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* GAMER BADGES SHOWCASE */}
                    <div className="glass p-3 rounded-xl border-2 border-black shadow-card bg-white/2">
                      <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5 mb-3">
                        <Trophy className="w-3 h-3 text-brand-orange" /> Gamer Badges
                      </h4>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
                        {BADGES_LIST.map(badge => {
                          const BadgeIcon = BADGE_ICONS[badge.icon] || Trophy;
                          const wins = displayedUser?.stats?.gameStats?.[badge.gameSlug]?.wins || 0;
                          const unlocked = wins >= badge.winsNeeded;
                          return (
                            <div
                              key={badge.id}
                              className={`flex flex-col items-center text-center p-2 rounded-xl border-2 border-black transition-all group relative cursor-pointer ${unlocked ? badge.color + " hover:scale-105 shadow-[1.5px_1.5px_0px_#000]" : "bg-white/2 border-slate-800 opacity-40 grayscale"}`}
                              onClick={() => {
                                if (unlocked) toast(`Selected Badge: ${badge.title}`, "info");
                                else toast(`Locked Badge: ${badge.title} (${badge.desc})`, "warning");
                              }}
                            >
                              <div className="mb-1 filter drop-shadow-[1px_1px_0px_#000]">
                                <BadgeIcon className="w-5 h-5 stroke-[1.8]" />
                              </div>
                              <span className="text-[7px] font-black uppercase tracking-wider text-white truncate max-w-full">{badge.title}</span>

                              {/* Tooltip detail */}
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 p-2.5 rounded-xl bg-slate-950 border-2 border-black text-[8.5px] font-bold text-slate-300 leading-normal pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl">
                                <p className="font-black text-brand-orange uppercase mb-1">{badge.title}</p>
                                <p className="text-slate-400">{badge.desc}</p>
                                <p className="text-slate-500 mt-1.5 font-bold">Progress: {wins}/{badge.winsNeeded} Wins</p>
                                {!unlocked && <p className="text-danger font-black uppercase mt-1.5 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Locked</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>


                  {/* BOTTOM SECTORS: MATCH HISTORY & SQUAD */}
                  <div className="grid gap-3 md:grid-cols-3">

                    {/* Matches log */}
                    <div className="glass p-3 rounded-xl border-2 border-black shadow-card md:col-span-2 bg-white/2">
                      <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5 mb-3">
                        <Activity className="w-3 h-3 text-brand-orange" /> Combat History Logs
                      </h4>

                      <div className="space-y-1.5">
                        {isLoadingMatches ? (
                          <div className="text-center py-6 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            Syncing database match records...
                          </div>
                        ) : matchHistory.length > 0 ? (
                          matchHistory.map(match => {
                            const opponent = match.players.find((p: any) => p.userId !== (displayedUser._id?.toString() || displayedUser.id)) || { username: "Opponent" };
                            const currentPlayer = match.players.find((p: any) => p.userId === (displayedUser._id?.toString() || displayedUser.id)) || {};
                            
                            let outcome: "won" | "lost" | "draw" = "lost";
                            if (match.winnerId === null) {
                              outcome = "draw";
                            } else if (match.winnerId === (displayedUser._id?.toString() || displayedUser.id)) {
                              outcome = "won";
                            }

                            const gameName = match.gameSlug === "tictactoe" || match.gameSlug === "tic-tac-toe" ? "Tic-Tac-Toe" : match.gameSlug;

                            return (
                              <div
                                key={match._id}
                                className="p-2 bg-slate-900/50 border border-black rounded-lg flex items-center justify-between hover:border-brand-orange/40 transition-all duration-200 shadow-[1px_1px_0px_#000]"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded bg-slate-950 border border-black flex items-center justify-center text-[8px] font-black text-brand-orange">
                                    {gameName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-0">
                                      <span className="text-[9px] font-black uppercase tracking-wider text-white">{gameName}</span>
                                      <span className="text-[6.5px] font-bold text-slate-500 uppercase tracking-widest">1v1 Match</span>
                                    </div>
                                    <p className="text-[7px] font-bold text-slate-550 uppercase tracking-widest">VS: {opponent.username}</p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider border border-black inline-block mb-0.5 ${outcome === "won" ? "bg-success/20 text-success border-success/40" : outcome === "draw" ? "bg-slate-700 text-slate-300 border-slate-600" : "bg-danger/20 text-danger border-danger/40"}`}>
                                    {outcome === "won" ? "Win" : outcome === "draw" ? "Draw" : "Loss"}
                                  </span>
                                  <p className="text-[7.5px] font-space font-black text-slate-400">+{currentPlayer.xpEarned || 0} XP</p>
                                  <p className="text-[6px] text-slate-600 mt-0.5 font-bold uppercase">{formatRelativeTime(match.completedAt)}</p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-slate-900 rounded-lg bg-slate-950/20">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">No match records logged</p>
                            <p className="text-[8px] text-slate-600 mt-1 font-bold">Initiate matchmaking to record stats.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Squad (Friends) */}
                    <div className="glass p-3 rounded-xl border-2 border-black shadow-card md:col-span-1 bg-white/2">
                      <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5 mb-3">
                        <Users className="w-3 h-3 text-brand-orange" /> Friends List
                      </h4>

                      <div className="space-y-2">
                        {isLoadingFriends ? (
                          <div className="text-center py-4 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            Retrieving squad...
                          </div>
                        ) : friends.length > 0 ? (
                          friends.map(friend => (
                            <div
                              key={friend._id || friend.id}
                              className="flex items-center justify-between group relative"
                            >
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <div className="h-6 w-6 rounded-full bg-slate-900 border border-black flex items-center justify-center font-space text-[8px] font-black text-slate-400">
                                    {friend.username.slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-slate-950 bg-success" />
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-tight text-white">{friend.username}</p>
                                  <p className="text-[6.5px] font-bold text-slate-500 uppercase tracking-widest">
                                    Online · Idle
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleInviteFriend(friend.username)}
                                className="h-6 px-2 rounded bg-brand-orange hover:bg-brand-orange/90 text-slate-950 font-black uppercase text-[7px] tracking-wider border border-black shadow-[1px_1px_0px_#000] cursor-pointer transition-all"
                              >
                                Invite
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 border-2 border-dashed border-slate-900 rounded-lg bg-slate-950/20 space-y-2">
                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">No friends added</p>
                            <Link href="/community#chat" className="block">
                              <Button className="btn-neo h-7 w-full text-[7.5px] rounded font-black tracking-widest uppercase">
                                Find Squad
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB 2: TERMINAL SETTINGS */}
            <AnimatePresence mode="wait">
              {activeTab === "settings" && (
                <motion.div
                  key="settings-panel"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  <div className="grid gap-4 md:grid-cols-2">

                    {/* Private Details & Credentials */}
                    <div className="glass p-4 rounded-2xl border-2 border-black shadow-card bg-white/2 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-4 border-b border-black pb-3">
                          <User className="w-3.5 h-3.5 text-brand-orange" /> Private Details & credentials
                        </h4>

                        <div className="flex flex-col gap-2.5 text-[9px] font-black text-slate-450 uppercase tracking-widest bg-slate-900/50 border-2 border-black rounded-xl p-3 mb-4 shadow-[2px_2px_0px_#000]">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-550">Email Address</span>
                            <span className="text-white truncate max-w-[190px]">{displayedUser.email}</span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-550">Date Established</span>
                            <span className="text-white">{new Date(displayedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-550">Security Clearance</span>
                            <span className="text-brand-orange font-bold">Standard</span>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handlePasswordChange} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Current Password</label>
                          <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full h-9 bg-slate-900 border-2 border-black rounded-lg px-3 text-[10px] font-bold text-white focus:outline-none focus:border-brand-orange"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full h-9 bg-slate-900 border-2 border-black rounded-lg px-3 text-[10px] font-bold text-white focus:outline-none focus:border-brand-orange"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Confirm Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-9 bg-slate-900 border-2 border-black rounded-lg px-3 text-[10px] font-bold text-white focus:outline-none focus:border-brand-orange"
                            placeholder="••••••••"
                          />
                        </div>
                        <Button type="submit" className="w-full h-9 bg-white hover:bg-brand-orange text-slate-950 font-black uppercase text-[9px] tracking-widest border-2 border-black rounded-lg transition-all">
                          Update Password Credentials
                        </Button>
                      </form>
                    </div>

                    {/* System Preference Registry */}
                    <div className="space-y-4">
                      {/* Notifications settings */}
                      <div className="glass p-4 rounded-2xl border-2 border-black shadow-card bg-white/2">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-4 border-b border-black pb-3">
                          <Bell className="w-3.5 h-3.5 text-brand-orange" /> Notification Preferences
                        </h4>

                        <div className="space-y-4">
                          <label className="flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-white">Email Subscriptions</p>
                              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Receive news and matchmaking reports</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications}
                              onChange={(e) => updateNotificationSettings({ emailNotifications: e.target.checked })}
                              className="h-4.5 w-4.5 accent-brand-orange rounded border-2 border-black"
                            />
                          </label>
                          <label className="flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-white">Push Alerts</p>
                              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Active matchmaking invites notifications</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notificationSettings.pushNotifications}
                              onChange={(e) => updateNotificationSettings({ pushNotifications: e.target.checked })}
                              className="h-4.5 w-4.5 accent-brand-orange rounded border-2 border-black"
                            />
                          </label>
                          <label className="flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-white">Lobby Invites</p>
                              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Allow invitations from other players</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notificationSettings.gameInvites}
                              onChange={(e) => updateNotificationSettings({ gameInvites: e.target.checked })}
                              className="h-4.5 w-4.5 accent-brand-orange rounded border-2 border-black"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Privacy registry */}
                      <div className="glass p-4 rounded-2xl border-2 border-black shadow-card bg-white/2">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-4 border-b border-black pb-3">
                          <Shield className="w-3.5 h-3.5 text-brand-orange" /> Privacy Settings
                        </h4>

                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Profile Visibility</span>
                            <div className="grid grid-cols-3 gap-2">
                              {["public", "friends", "private"].map(vis => (
                                <button
                                  key={vis}
                                  onClick={() => updatePrivacySettings({ profileVisibility: vis as any })}
                                  className={`h-9 rounded-lg text-[7px] font-black uppercase tracking-wider transition-all border-2 border-black ${privacySettings.profileVisibility === vis ? "bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]" : "bg-white/5 text-slate-400 hover:border-brand-orange/30"}`}
                                >
                                  {vis}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="h-px bg-slate-900 border-b border-white/5 w-full my-4" />

                          <label className="flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-white">Broadcast Online Status</p>
                              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Let friends detect when you are online</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={privacySettings.showOnlineStatus}
                              onChange={(e) => updatePrivacySettings({ showOnlineStatus: e.target.checked })}
                              className="h-4.5 w-4.5 accent-brand-orange rounded border-2 border-black"
                            />
                          </label>

                          <label className="flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-white">Broadcast Game Feed</p>
                              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Permit match outcome streaming to leaderboards</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={privacySettings.showGameActivity}
                              onChange={(e) => updatePrivacySettings({ showGameActivity: e.target.checked })}
                              className="h-4.5 w-4.5 accent-brand-orange rounded border-2 border-black"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE TERMINAL SESSION LIST */}
                  <div className="glass p-4 rounded-2xl border-2 border-black shadow-card bg-white/2">
                    <div className="flex items-center justify-between mb-4 border-b border-black pb-3">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                        <Laptop className="w-3.5 h-3.5 text-brand-orange" /> Active Sessions
                      </h4>
                      {sessions.length > 1 && (
                        <button
                          onClick={handleRevokeAllSessions}
                          className="px-2.5 h-8 bg-danger/15 hover:bg-danger text-danger hover:text-white rounded-lg border-2 border-black font-black uppercase text-[8px] tracking-widest transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#000]"
                        >
                          Revoke All Others
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      {sessions.map(session => (
                        <div
                          key={session.id}
                          className={`p-3 bg-slate-900/50 border-2 rounded-xl flex flex-col justify-between h-32 shadow-[2px_2px_0px_#000] ${session.isCurrent ? "border-brand-orange" : "border-black"}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-xl bg-slate-950 border border-black flex items-center justify-center text-brand-orange shadow-[1px_1px_0px_#000]">
                                {session.deviceType === "mobile" ? <Smartphone className="w-4 h-4" /> : session.deviceType === "tablet" ? <Tablet className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-wide text-white truncate max-w-[130px]">{session.deviceName}</p>
                                <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{session.location}</p>
                              </div>
                            </div>
                            {session.isCurrent && (
                              <span className="px-1.5 py-0.5 bg-success/15 border border-success/35 rounded text-[7px] font-black uppercase tracking-widest text-success leading-none animate-pulse">active</span>
                            )}
                          </div>

                          <div className="flex items-end justify-between border-t border-black pt-3 mt-3">
                            <div>
                              <p className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest">IP ADDRESS</p>
                              <p className="text-[9.5px] font-space font-black text-slate-400">{session.ipAddress}</p>
                            </div>
                            {!session.isCurrent && (
                              <button
                                onClick={() => handleRevokeSession(session.id)}
                                className="px-2 h-7 bg-white hover:bg-brand-orange text-slate-950 rounded-lg border-2 border-black font-black uppercase text-[8px] tracking-wider transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#000]"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECURITY SIGNALS LOG (LOGIN HISTORY) */}
                  <div className="glass p-4 rounded-2xl border-2 border-black shadow-card bg-white/2">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-4">
                      <Clock className="w-3.5 h-3.5 text-brand-orange" /> Login History
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[500px]">
                        <thead>
                          <tr className="border-b-2 border-black text-[8px] font-black uppercase tracking-widest text-slate-550">
                            <th className="pb-3.5">Timestamp</th>
                            <th className="pb-3.5">Device Identity</th>
                            <th className="pb-3.5">IP Address</th>
                            <th className="pb-3.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/45">
                          {loginHistory.map(hist => (
                            <tr key={hist.id} className="text-[10px] text-slate-400 font-bold">
                              <td className="py-3 uppercase">{new Date(hist.timestamp).toLocaleString()}</td>
                              <td className="py-3 uppercase text-white font-black">{hist.deviceName} ({hist.location})</td>
                              <td className="py-3 font-space font-black text-brand-orange">{hist.ipAddress}</td>
                              <td className="py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-black shadow-[1px_1px_0px_#000] ${hist.status === "success" ? "bg-success/15 text-success border-success/30" : "bg-danger/15 text-danger border-danger/30"}`}>
                                  {hist.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
