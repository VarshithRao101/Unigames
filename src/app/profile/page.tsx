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
};



// Mock Match History Data
const MOCK_MATCH_HISTORY = [
  { id: "m1", game: "Tic-Tac-Toe", outcome: "won", xp: 120, time: "42 mins ago", mode: "1v1 Duel", opponent: "Luna" },
  { id: "m2", game: "Tic-Tac-Toe", outcome: "lost", xp: 30, time: "2 hours ago", mode: "1v1 Duel", opponent: "Nova" },
  { id: "m3", game: "Tic-Tac-Toe", outcome: "won", xp: 150, time: "1 day ago", mode: "Tournament Final", opponent: "BoardKing" },
  { id: "m4", game: "Tic-Tac-Toe", outcome: "won", xp: 90, time: "2 days ago", mode: "1v1 Duel", opponent: "Nova" },
];

// Mock Achievements / Badges
const ACHIEVEMENT_BADGES = [
  { id: "b1", title: "Gold Champion", desc: "Ascend to Rank #1 on any weekly board", icon: "trophy", color: "bg-amber-500/20 border-amber-500 text-amber-300", unlocked: true },
  { id: "b2", title: "Perfect Align", desc: "Align three markers in under 4 moves", icon: "gamepad", color: "bg-emerald-500/20 border-emerald-500 text-emerald-300", unlocked: true },
  { id: "b3", title: "Block Master", desc: "Successfully block 5 opponent win patterns", icon: "crown", color: "bg-indigo-500/20 border-indigo-500 text-indigo-300", unlocked: true },
  { id: "b4", title: "Tactician Elite", desc: "Reach 50 wins across arcade games", icon: "brain", color: "bg-pink-500/20 border-pink-500 text-pink-300", unlocked: true },
  { id: "b5", title: "Beta Operator", desc: "Active tester during community phases", icon: "shield", color: "bg-cyan-500/20 border-cyan-500 text-cyan-300", unlocked: true },
  { id: "b6", title: "Unstoppable", desc: "Achieve a 10-match winning streak", icon: "flame", color: "bg-red-500/20 border-red-500 text-red-300", unlocked: false },
];

// Mock Friends
const MOCK_FRIENDS = [
  { id: "f1", name: "Luna", status: "online", game: "Tic-Tac-Toe" },
  { id: "f2", name: "Nova", status: "online", game: "Tic-Tac-Toe" },
  { id: "f3", name: "BoardKing", status: "offline", lastActive: "3 hours ago" },
  { id: "f4", name: "XOMaster", status: "offline", lastActive: "1 day ago" },
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

  // Calculate SVG Radar Chart coordinates dynamically
  // Radar metrics: Strategy, Speed, Tactics, Consistency, Adaptability
  const radarStats = useMemo(() => [85, 90, 75, 80, 95], []);
  const radarPoints = useMemo(() => {
    const cx = 100;
    const cy = 105;
    const r = 70;
    return radarStats.map((stat, i) => {
      const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
      const x = cx + r * (stat / 100) * Math.cos(angle);
      const y = cy + r * (stat / 100) * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  }, [radarStats]);

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

  // Fallback helper for displayed values
  const displayedUser = dbUser || user;

  // Level & XP progression values
  const currentXP = displayedUser?.xp || 0;
  const currentLevel = displayedUser?.level || 1;
  const progressPercent = Math.round(((currentXP % 500) / 500) * 100);
  const nextLevel = currentLevel + 1;

  // Stats values
  const gamesPlayed = displayedUser?.stats?.gamesPlayed || 0;
  const victories = displayedUser?.stats?.wins || 0;
  const winStreak = displayedUser?.stats?.winStreak || 0;
  const winRatio = gamesPlayed > 0 ? ((victories / gamesPlayed) * 100).toFixed(1) : "0.0";



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

                <div className="h-px bg-slate-900 border-b border-white/5 w-full my-4" />

                <label className="flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-white">Animations Enabled</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Smooth page and card interactions transition effects</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={appearanceSettings.animationsEnabled}
                    onChange={(e) => updateAppearanceSettings({ animationsEnabled: e.target.checked })}
                    className="h-4.5 w-4.5 accent-brand-orange rounded border-2 border-black"
                  />
                </label>
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
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-1.5 py-0.5 bg-slate-950 border-2 border-black rounded text-[7px] font-black text-brand-orange tracking-widest leading-none">PLAYER LEVEL</span>
                            <span className="text-[9px] font-space font-black text-slate-400">GAMER STATUS</span>
                          </div>
                          <h3 className="text-xl font-black uppercase tracking-tighter">Player Level {currentLevel}</h3>
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

                      {/* Right: SVG Radar Attributes Chart */}
                      <div className="md:col-span-2 flex flex-col items-center justify-center">
                        <div className="relative w-36 h-36 bg-slate-900 border-3 border-black flex items-center justify-center shadow-[inset_3px_3px_0px_#000000] overflow-hidden rounded-[1.5rem]">
                          <svg className="w-full h-full" viewBox="0 0 200 200">
                            {/* Inner web concentric pentagons */}
                            <polygon points="100,65 129,86 118,121 82,121 71,86" fill="none" stroke="#000000" strokeWidth="2.5" />
                            <polygon points="100,50 142,80 126,130 74,130 58,80" fill="none" stroke="#000000" strokeWidth="2.5" />
                            <polygon points="100,35 156,76 135,140 65,140 44,76" fill="none" stroke="#000000" strokeWidth="2.5" />

                            {/* Web axes */}
                            {Array.from({ length: 5 }).map((_, idx) => {
                              const angle = (idx * 2 * Math.PI / 5) - Math.PI / 2;
                              const x = 100 + 70 * Math.cos(angle);
                              const y = 105 + 70 * Math.sin(angle);
                              return (
                                <line key={idx} x1="100" y1="105" x2={x} y2={y} stroke="#000000" strokeWidth="2.5" />
                              );
                            })}

                            {/* Polygon filled stats */}
                            <polygon
                              points={radarPoints}
                              fill="rgba(255, 170, 0, 0.35)"
                              stroke="#000000"
                              strokeWidth="3.5"
                            />

                            {/* Vertices indicator bullets */}
                            {radarPoints.split(" ").map((pt, idx) => {
                              const [x, y] = pt.split(",");
                              return (
                                <circle key={idx} cx={x} cy={y} r="4.5" fill="#ffaa00" stroke="#000000" strokeWidth="2" />
                              );
                            })}
                          </svg>
                          <span className="absolute top-2 text-[6.5px] font-black text-slate-500 uppercase tracking-widest">STR</span>
                          <span className="absolute right-2 top-[35%] text-[6.5px] font-black text-slate-500 uppercase tracking-widest">SPD</span>
                          <span className="absolute right-6 bottom-2 text-[6.5px] font-black text-slate-500 uppercase tracking-widest">TAC</span>
                          <span className="absolute left-6 bottom-2 text-[6.5px] font-black text-slate-500 uppercase tracking-widest">CNS</span>
                          <span className="absolute left-2 top-[35%] text-[6.5px] font-black text-slate-500 uppercase tracking-widest">ADP</span>
                        </div>
                        <p className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest mt-2">PLAYER ATTRIBUTES</p>
                      </div>

                    </div>
                    {/* ACHIEVEMENT BADGES SHOWCASE */}
                    <div className="glass p-3 rounded-xl border-2 border-black shadow-card bg-white/2">
                      <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5 mb-3">
                        <Trophy className="w-3 h-3 text-brand-orange" /> Gamer Badges
                      </h4>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {ACHIEVEMENT_BADGES.map(badge => {
                          const BadgeIcon = BADGE_ICONS[badge.icon] || Trophy;
                          return (
                            <div
                              key={badge.id}
                              className={`flex flex-col items-center text-center p-2 rounded-xl border-2 border-black transition-all group relative cursor-pointer ${badge.unlocked ? badge.color + " hover:scale-105 shadow-[1.5px_1.5px_0px_#000]" : "bg-white/2 border-slate-800 opacity-40 grayscale"}`}
                              onClick={() => {
                                if (badge.unlocked) toast(`Selected Badge: ${badge.title}`, "info");
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
                                {!badge.unlocked && <p className="text-danger font-black uppercase mt-1.5 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Locked</p>}
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
                        {MOCK_MATCH_HISTORY.map(match => (
                          <div
                            key={match.id}
                            className="p-2 bg-slate-900/50 border border-black rounded-lg flex items-center justify-between hover:border-brand-orange/40 transition-all duration-200 shadow-[1px_1px_0px_#000]"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-slate-950 border border-black flex items-center justify-center text-[8px] font-black text-brand-orange">
                                {match.game.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-0">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-white">{match.game}</span>
                                  <span className="text-[6.5px] font-bold text-slate-500 uppercase tracking-widest">{match.mode}</span>
                                </div>
                                <p className="text-[7px] font-bold text-slate-550 uppercase tracking-widest">VS: {match.opponent}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider border border-black inline-block mb-0.5 ${match.outcome === "won" ? "bg-success/20 text-success border-success/40" : "bg-danger/20 text-danger border-danger/40"}`}>
                                {match.outcome === "won" ? "Win" : "Loss"}
                              </span>
                              <p className="text-[7.5px] font-space font-black text-slate-400">+{match.xp} XP</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Squad (Friends) */}
                    <div className="glass p-3 rounded-xl border-2 border-black shadow-card md:col-span-1 bg-white/2">
                      <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5 mb-3">
                        <Users className="w-3 h-3 text-brand-orange" /> Friends List
                      </h4>

                      <div className="space-y-2">
                        {MOCK_FRIENDS.map(friend => (
                          <div
                            key={friend.id}
                            className="flex items-center justify-between group relative"
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <div className="h-6 w-6 rounded-full bg-slate-900 border border-black flex items-center justify-center font-space text-[8px] font-black text-slate-400">
                                  {friend.name.slice(0, 2).toUpperCase()}
                                </div>
                                <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-slate-950 ${friend.status === "online" ? "bg-success" : "bg-slate-700"}`} />
                              </div>
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-tight text-white">{friend.name}</p>
                                <p className="text-[6.5px] font-bold text-slate-500 uppercase tracking-widest">
                                  {friend.status === "online" ? `In: ${friend.game}` : "offline"}
                                </p>
                              </div>
                            </div>

                            {friend.status === "online" && (
                              <button
                                onClick={() => handleInviteFriend(friend.name)}
                                className="h-6 px-2 rounded bg-brand-orange hover:bg-brand-orange/90 text-slate-950 font-black uppercase text-[7px] tracking-wider border border-black shadow-[1px_1px_0px_#000] cursor-pointer transition-all"
                              >
                                Invite
                              </button>
                            )}

                            {/* Offline last active details */}
                            {friend.status === "offline" && (
                              <div className="absolute bottom-full mb-1 right-0 p-1.5 rounded-lg bg-slate-950 border border-black text-[7.5px] font-bold text-slate-400 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                                Last seen: {friend.lastActive}
                              </div>
                            )}
                          </div>
                        ))}
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
