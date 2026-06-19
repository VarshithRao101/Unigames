"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

// Map badge keys to Lucide React icons to replace raw emojis
const BADGE_ICONS: Record<string, React.ComponentType<any>> = {
  trophy: Trophy,
  gamepad: Gamepad2,
  crown: Crown,
  brain: Brain,
  shield: Shield,
  flame: Flame,
};

// Preset Avatars with distinct gradient schemes
const AVATAR_PRESETS = [
  { id: "p1", name: "Cyber Knight", gradients: "from-brand-orange to-brand-neon", textColor: "text-slate-950" },
  { id: "p2", name: "Neon Rogue", gradients: "from-pink-500 to-rose-500", textColor: "text-white" },
  { id: "p3", name: "Techno Mage", gradients: "from-cyan-400 to-blue-500", textColor: "text-slate-950" },
  { id: "p4", name: "Pixel Ninja", gradients: "from-emerald-400 to-teal-500", textColor: "text-slate-950" },
  { id: "p5", name: "Retro Founder", gradients: "from-red-500 to-orange-500", textColor: "text-white" },
  { id: "p6", name: "Cosmic Master", gradients: "from-violet-600 to-indigo-600", textColor: "text-white" },
];

// Mock Match History Data
const MOCK_MATCH_HISTORY = [
  { id: "m1", game: "Tic-Tac-Toe", outcome: "won", xp: 120, time: "42 mins ago", mode: "1v1 Duel", opponent: "Luna" },
  { id: "m2", game: "Chess Arena", outcome: "lost", xp: 30, time: "2 hours ago", mode: "Ranked Match", opponent: "Garry" },
  { id: "m3", game: "Tic-Tac-Toe", outcome: "won", xp: 150, time: "1 day ago", mode: "Tournament Final", opponent: "BoardKing" },
  { id: "m4", game: "Ludo Rush", outcome: "won", xp: 90, time: "2 days ago", mode: "4-Player Party", opponent: "Nova" },
];

// Mock Achievements / Badges
const ACHIEVEMENT_BADGES = [
  { id: "b1", title: "Gold Champion", desc: "Ascend to Rank #1 on any weekly board", icon: "trophy", color: "bg-amber-500/20 border-amber-500 text-amber-300", unlocked: true },
  { id: "b2", title: "Snakes Slayer", desc: "Climb 5 ladders in a single race", icon: "gamepad", color: "bg-emerald-500/20 border-emerald-500 text-emerald-300", unlocked: true },
  { id: "b3", title: "Double Check", desc: "Deliver checkmate in under 10 moves", icon: "crown", color: "bg-indigo-500/20 border-indigo-500 text-indigo-300", unlocked: true },
  { id: "b4", title: "Tactician Elite", desc: "Reach 50 wins across board games", icon: "brain", color: "bg-pink-500/20 border-pink-500 text-pink-300", unlocked: true },
  { id: "b5", title: "Beta Operator", desc: "Active tester during community phases", icon: "shield", color: "bg-cyan-500/20 border-cyan-500 text-cyan-300", unlocked: true },
  { id: "b6", title: "Unstoppable", desc: "Achieve a 10-match winning streak", icon: "flame", color: "bg-red-500/20 border-red-500 text-red-300", unlocked: false },
];

// Mock Friends
const MOCK_FRIENDS = [
  { id: "f1", name: "Luna", status: "online", game: "Tic-Tac-Toe" },
  { id: "f2", name: "Garry", status: "online", game: "Chess Arena" },
  { id: "f3", name: "BoardKing", status: "offline", lastActive: "3 hours ago" },
  { id: "f4", name: "Nova", status: "offline", lastActive: "1 day ago" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
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
  const [activeTab, setActiveTab] = useState<"combat" | "security" | "settings">("combat");

  // Editable fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState(user?.username || "");
  const [tempBio, setTempBio] = useState(user?.bio || "");
  const [selectedAvatarPreset, setSelectedAvatarPreset] = useState("p1");

  // Security tab states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationDocType, setVerificationDocType] = useState("github");
  const [verificationProofUrl, setVerificationProofUrl] = useState("");

  // Update inputs if user context loads later
  useEffect(() => {
    if (user) {
      setTempUsername(user.username);
      setTempBio(user.bio || "");
      // Select preset based on username to default
      if (user.username === "Valerius") setSelectedAvatarPreset("p1");
      else if (user.username === "SystemAdmin") setSelectedAvatarPreset("p5");
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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-dark text-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-space text-xs font-black uppercase tracking-widest text-slate-500">Retrieving Uplink...</p>
      </div>
    );
  }

  // Handle Profile Update
  const handleSaveProfile = () => {
    if (!tempUsername.trim()) {
      toast("Username cannot be empty", "error");
      return;
    }
    updateProfile({ username: tempUsername, bio: tempBio });
    setIsEditingProfile(false);
    toast("Tactical profile details synchronized successfully", "success");
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

  const currentPreset = AVATAR_PRESETS.find(p => p.id === selectedAvatarPreset) || AVATAR_PRESETS[0];

  return (
    <div className="bg-slate-dark text-white min-h-screen relative overflow-hidden">
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

      <main suppressHydrationWarning className="pt-32 pb-20 px-6 container mx-auto max-w-7xl relative z-10">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* ── LEFT COLUMN: PROFILE CARD & SUB-TABS ── */}
          <div className="space-y-6 lg:col-span-1">
            {/* PROFILE CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-3xl border-2 border-black shadow-card flex flex-col items-center text-center relative overflow-hidden bg-white/2"
            >
              {/* Role badge */}
              <span className="absolute top-4 right-4 px-2.5 py-1 rounded-lg border-2 border-black text-[8px] font-black uppercase tracking-wider bg-brand-orange text-slate-950 shadow-[1.5px_1.5px_0px_#000]">
                {user.role}
              </span>

              {/* Dynamic Gradient Avatar */}
              <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${currentPreset.gradients} border-4 border-black flex items-center justify-center font-space text-4xl font-black ${currentPreset.textColor} shadow-[4px_4px_0px_#000] relative mb-6 mt-4 transition-all duration-300`}>
                {user.username.slice(0, 2).toUpperCase()}
                <span className="absolute bottom-1 right-1 h-5 w-5 bg-success rounded-full border-4 border-black animate-pulse" />
              </div>

              {/* Preset Avatar Selector when editing */}
              {isEditingProfile && (
                <div className="w-full mb-4">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Preset Cosmetics</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {AVATAR_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedAvatarPreset(preset.id)}
                        className={`w-7 h-7 rounded-full bg-gradient-to-tr ${preset.gradients} border-2 transition-all ${selectedAvatarPreset === preset.id ? "border-white scale-110 shadow-md" : "border-black hover:scale-105"}`}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Editable Name & Bio */}
              {isEditingProfile ? (
                <div className="w-full space-y-3 mb-4">
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="w-full h-11 bg-slate-dark border-2 border-black rounded-xl px-3 text-center text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-orange"
                    placeholder="USERNAME"
                  />
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    className="w-full h-20 bg-slate-dark border-2 border-black rounded-xl p-3 text-center text-xs font-bold text-slate-400 focus:outline-none focus:border-brand-orange resize-none"
                    placeholder="Casually competitive..."
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleSaveProfile} className="h-9 px-4 rounded-lg bg-brand-orange hover:bg-brand-dark text-slate-950 border-2 border-black font-black uppercase text-[9px] tracking-wider">
                      <Save className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                    <Button onClick={() => { setIsEditingProfile(false); setTempUsername(user.username); setTempBio(user.bio || ""); }} className="h-9 px-4 rounded-lg bg-slate-700 hover:bg-slate-650 text-white border-2 border-black font-black uppercase text-[9px] tracking-wider">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 flex items-center justify-center gap-2">
                    {user.username}
                    <button 
                      onClick={() => setIsEditingProfile(true)} 
                      className="text-slate-500 hover:text-brand-orange transition-colors"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed max-w-xs mx-auto italic mb-4">
                    "{user.bio || "Casually competitive..."}"
                  </p>
                  
                  <div className="h-px bg-slate-900 border-b border-white/5 w-full my-4" />

                  <div className="flex flex-col gap-2.5 text-left text-[9.5px] font-black text-slate-550 uppercase tracking-widest px-2">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-brand-orange" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Sync established: {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Log out */}
              <Button onClick={handleLogout} className="w-full h-11 bg-white hover:bg-brand-orange text-slate-950 font-black uppercase text-[10px] tracking-widest border-2 border-black rounded-xl transition-all">
                <LogOut className="w-4 h-4 mr-2" /> Sever Terminal
              </Button>
            </motion.div>

            {/* TAB SELECTOR */}
            <div className="glass p-2 rounded-2xl border-2 border-black shadow-card flex flex-col gap-2 bg-white/2">
              <button
                onClick={() => setActiveTab("combat")}
                className={`w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 border-black flex items-center justify-between px-4 ${activeTab === "combat" ? "bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]" : "bg-white/5 text-slate-400 hover:border-brand-orange/30"}`}
              >
                <span>Combat Files</span>
                <Gamepad2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 border-black flex items-center justify-between px-4 ${activeTab === "security" ? "bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]" : "bg-white/5 text-slate-400 hover:border-brand-orange/30"}`}
              >
                <span>Terminal Security</span>
                <Shield className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 border-black flex items-center justify-between px-4 ${activeTab === "settings" ? "bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]" : "bg-white/5 text-slate-400 hover:border-brand-orange/30"}`}
              >
                <span>System Registry</span>
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: DYNAMIC CONTENT PANELS ── */}
          <div className="space-y-6 lg:col-span-2">
            
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
                  <div className="glass p-6 rounded-3xl border-2 border-black shadow-card bg-white/2">
                    <div className="grid gap-6 md:grid-cols-5 items-center">
                      
                      {/* Left: Stats & Level Details */}
                      <div className="md:col-span-3 space-y-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 bg-slate-950 border-2 border-black rounded text-[8px] font-black text-brand-orange tracking-widest leading-none">SECTOR LEVEL</span>
                            <span className="text-xs font-space font-black text-slate-400">CLASS OPERATOR</span>
                          </div>
                          <h3 className="text-3xl font-black uppercase tracking-tighter">Combat Level 18</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">148,500 Total XP Earned</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-brand-orange">
                            <span>PROGRESSION UPLINK</span>
                            <span>85% TO LVL 19</span>
                          </div>
                          <div className="h-4 w-full bg-slate-950 border-2 border-black rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "85%" }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className="h-full bg-brand-orange shadow-[0_0_8px_rgba(255,193,7,0.4)]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="text-center p-2.5 bg-slate-dark/50 border border-black rounded-xl shadow-[2px_2px_0px_#000]">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Victories</p>
                            <p className="text-xl font-space font-black text-white">92</p>
                          </div>
                          <div className="text-center p-2.5 bg-slate-dark/50 border border-black rounded-xl shadow-[2px_2px_0px_#000]">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Win Ratio</p>
                            <p className="text-xl font-space font-black text-brand-orange">64.7%</p>
                          </div>
                          <div className="text-center p-2.5 bg-slate-dark/50 border border-black rounded-xl shadow-[2px_2px_0px_#000]">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Win Streak</p>
                            <p className="text-xl font-space font-black text-white flex items-center justify-center gap-1.5 leading-none">
                              4 <Flame className="w-4 h-4 text-brand-orange fill-current" />
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: SVG Radar Attributes Chart */}
                      <div className="md:col-span-2 flex flex-col items-center justify-center">
                        <div className="relative w-44 h-44 bg-slate-950/40 rounded-full border-2 border-black flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 200 200">
                            {/* Inner web concentric pentagons */}
                            <polygon points="100,65 129,86 118,121 82,121 71,86" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            <polygon points="100,50 142,80 126,130 74,130 58,80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            <polygon points="100,35 156,76 135,140 65,140 44,76" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                            
                            {/* Web axes */}
                            {Array.from({ length: 5 }).map((_, idx) => {
                              const angle = (idx * 2 * Math.PI / 5) - Math.PI / 2;
                              const x = 100 + 70 * Math.cos(angle);
                              const y = 105 + 70 * Math.sin(angle);
                              return (
                                <line key={idx} x1="100" y1="105" x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                              );
                            })}

                            {/* Polygon filled stats */}
                            <polygon 
                              points={radarPoints} 
                              fill="rgba(255, 107, 0, 0.18)" 
                              stroke="#FFC107" 
                              strokeWidth="2" 
                              className="filter drop-shadow-[0_0_4px_rgba(255,107,0,0.5)]"
                            />

                            {/* Vertices indicator bullets */}
                            {radarPoints.split(" ").map((pt, idx) => {
                              const [x, y] = pt.split(",");
                              return (
                                <circle key={idx} cx={x} cy={y} r="3" fill="#FFC107" stroke="#212529" strokeWidth="1" />
                              );
                            })}
                          </svg>
                          <span className="absolute top-2 text-[6.5px] font-black text-slate-500 uppercase tracking-widest">STR</span>
                          <span className="absolute right-2 top-[35%] text-[6.5px] font-black text-slate-500 uppercase tracking-widest">SPD</span>
                          <span className="absolute right-6 bottom-2 text-[6.5px] font-black text-slate-500 uppercase tracking-widest">TAC</span>
                          <span className="absolute left-6 bottom-2 text-[6.5px] font-black text-slate-500 uppercase tracking-widest">CNS</span>
                          <span className="absolute left-2 top-[35%] text-[6.5px] font-black text-slate-500 uppercase tracking-widest">ADP</span>
                        </div>
                        <p className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest mt-2">TACTICAL ATTRIBUTES GRID</p>
                      </div>

                    </div>
                  </div>

                  {/* ACHIEVEMENT BADGES SHOWCASE */}
                  <div className="glass p-6 rounded-3xl border-2 border-black shadow-card bg-white/2">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-6">
                      <Trophy className="w-4 h-4 text-brand-orange" /> Combat Badges
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {ACHIEVEMENT_BADGES.map(badge => {
                        const BadgeIcon = BADGE_ICONS[badge.icon] || Trophy;
                        return (
                          <div 
                            key={badge.id} 
                            className={`flex flex-col items-center text-center p-3 rounded-2xl border-2 border-black transition-all group relative cursor-pointer ${badge.unlocked ? badge.color + " hover:scale-105 shadow-[2px_2px_0px_#000]" : "bg-white/2 border-slate-800 opacity-40 grayscale"}`}
                            onClick={() => {
                              if (badge.unlocked) toast(`Selected Badge: ${badge.title}`, "info");
                              else toast(`Locked Badge: ${badge.title} (${badge.desc})`, "warning");
                            }}
                          >
                            <div className="text-2xl mb-2 filter drop-shadow-[1px_1px_0px_#000]">
                              <BadgeIcon className="w-6 h-6 stroke-[1.8]" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-white truncate max-w-full">{badge.title}</span>
                            
                            {/* Tooltip detail */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-44 p-3 rounded-2xl bg-slate-950 border-2 border-black text-[9.5px] font-bold text-slate-300 leading-normal pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl">
                              <p className="font-black text-brand-orange uppercase mb-1">{badge.title}</p>
                              <p className="text-slate-400">{badge.desc}</p>
                              {!badge.unlocked && <p className="text-danger font-black uppercase mt-1.5 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Locked</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BOTTOM SECTORS: MATCH HISTORY & SQUAD */}
                  <div className="grid gap-6 md:grid-cols-3">
                    
                    {/* Matches log */}
                    <div className="glass p-6 rounded-3xl border-2 border-black shadow-card md:col-span-2 bg-white/2">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-6">
                        <Activity className="w-4 h-4 text-brand-orange" /> Combat History Logs
                      </h4>
                      
                      <div className="space-y-3">
                        {MOCK_MATCH_HISTORY.map(match => (
                          <div 
                            key={match.id} 
                            className="p-3 bg-slate-dark/50 border-2 border-black rounded-2xl flex items-center justify-between hover:border-brand-orange/40 transition-all duration-250 shadow-[2px_2px_0px_#000]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-950 border-2 border-black flex items-center justify-center text-xs font-black text-brand-orange shadow-[1px_1px_0px_#000]">
                                {match.game.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-white">{match.game}</span>
                                  <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest">{match.mode}</span>
                                </div>
                                <p className="text-[8px] font-bold text-slate-550 uppercase tracking-widest">VS Operator: {match.opponent}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border-2 border-black shadow-[1px_1px_0px_#000] inline-block mb-1 ${match.outcome === "won" ? "bg-success/20 text-success border-success/40" : "bg-danger/20 text-danger border-danger/40"}`}>
                                {match.outcome === "won" ? "Victory" : "Defeat"}
                              </span>
                              <p className="text-[9px] font-space font-black text-slate-400">+{match.xp} XP • {match.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Squad (Friends) */}
                    <div className="glass p-6 rounded-3xl border-2 border-black shadow-card md:col-span-1 bg-white/2">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-6">
                        <Users className="w-4 h-4 text-brand-orange" /> Operational Squad
                      </h4>

                      <div className="space-y-3.5">
                        {MOCK_FRIENDS.map(friend => (
                          <div 
                            key={friend.id}
                            className="flex items-center justify-between group relative"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <div className="h-8 w-8 rounded-full bg-slate-900 border border-black flex items-center justify-center font-space text-[10px] font-black text-slate-400">
                                  {friend.name.slice(0, 2).toUpperCase()}
                                </div>
                                <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-950 ${friend.status === "online" ? "bg-success" : "bg-slate-700"}`} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-tight text-white">{friend.name}</p>
                                <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest">
                                  {friend.status === "online" ? `In: ${friend.game}` : "offline"}
                                </p>
                              </div>
                            </div>

                            {friend.status === "online" && (
                              <button 
                                onClick={() => handleInviteFriend(friend.name)}
                                className="h-7 px-2.5 rounded-md bg-brand-orange hover:bg-brand-orange/90 text-slate-950 font-black uppercase text-[8px] tracking-wider border-2 border-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer active:translate-y-px transition-all"
                              >
                                Invite
                              </button>
                            )}

                            {/* Offline last active details */}
                            {friend.status === "offline" && (
                              <div className="absolute bottom-full mb-1 right-0 p-1.5 rounded-lg bg-slate-950 border-2 border-black text-[8px] font-bold text-slate-400 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                                Last sync: {friend.lastActive}
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

            {/* TAB 2: TERMINAL SECURITY */}
            <AnimatePresence mode="wait">
              {activeTab === "security" && (
                <motion.div
                  key="security-panel"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    
                    {/* Credentials Update */}
                    <div className="glass p-6 rounded-3xl border-2 border-black shadow-card bg-white/2">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-6 border-b border-black pb-4">
                        <Key className="w-4 h-4 text-brand-orange" /> Credentials Update
                      </h4>

                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Current Password</label>
                          <input 
                            type="password" 
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full h-11 bg-slate-dark border-2 border-black rounded-xl px-4 text-xs font-bold text-white focus:outline-none focus:border-brand-orange"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">New Password</label>
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full h-11 bg-slate-dark border-2 border-black rounded-xl px-4 text-xs font-bold text-white focus:outline-none focus:border-brand-orange"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Confirm Password</label>
                          <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-11 bg-slate-dark border-2 border-black rounded-xl px-4 text-xs font-bold text-white focus:outline-none focus:border-brand-orange"
                            placeholder="••••••••"
                          />
                        </div>
                        <Button type="submit" className="w-full h-11 bg-white hover:bg-brand-orange text-slate-950 font-black uppercase text-[10px] tracking-widest border-2 border-black rounded-xl transition-all">
                          Update Password Credentials
                        </Button>
                      </form>
                    </div>

                    {/* Authenticator and verification */}
                    <div className="space-y-6">
                      {/* Two factor */}
                      <div className="glass p-6 rounded-3xl border-2 border-black shadow-card bg-white/2">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-4">
                          <ShieldCheck className="w-4 h-4 text-brand-orange" /> Two-Factor Security
                        </h4>
                        
                        <label className="flex items-center justify-between p-3.5 bg-slate-dark border-2 border-black rounded-2xl cursor-pointer select-none">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white">Enable 2FA Validation</p>
                            <p className="text-[8px] font-bold text-slate-550 uppercase tracking-widest mt-0.5">Validate logins using code confirmation signals</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={user.isTwoFactorEnabled}
                            onChange={(e) => handleTwoFactorToggle(e.target.checked)}
                            className="h-4.5 w-4.5 accent-brand-orange rounded border-2 border-black"
                          />
                        </label>
                      </div>

                      {/* Contributor Verification */}
                      <div className="glass p-6 rounded-3xl border-2 border-black shadow-card bg-white/2">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-4">
                          <Sparkles className="w-4 h-4 text-brand-orange" /> Creator Uplink Verification
                        </h4>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-4">
                          Submit proof of repository contributions to unlock developer credits and special system tags on UniGames.
                        </p>

                        <form onSubmit={handleAccountVerification} className="space-y-3">
                          <div className="flex gap-2">
                            <select 
                              value={verificationDocType}
                              onChange={(e) => setVerificationDocType(e.target.value)}
                              className="bg-slate-dark border-2 border-black rounded-xl px-2 text-[9px] font-black uppercase tracking-wider text-white focus:outline-none focus:border-brand-orange h-11"
                            >
                              <option value="github">GitHub PR</option>
                              <option value="commit">Commit SHA</option>
                              <option value="invite">Collab Code</option>
                            </select>
                            <input 
                              type="text"
                              value={verificationProofUrl}
                              onChange={(e) => setVerificationProofUrl(e.target.value)}
                              placeholder="https://github.com/..."
                              className="flex-1 h-11 bg-slate-dark border-2 border-black rounded-xl px-3 text-xs text-white focus:outline-none focus:border-brand-orange"
                            />
                          </div>
                          <Button type="submit" className="w-full h-11 bg-white hover:bg-brand-orange text-slate-950 font-black uppercase text-[10px] tracking-widest border-2 border-black rounded-xl transition-all">
                            Submit Verification Proof
                          </Button>
                        </form>
                      </div>
                    </div>

                  </div>

                  {/* ACTIVE TERMINAL SESSION LIST */}
                  <div className="glass p-6 rounded-3xl border-2 border-black shadow-card bg-white/2">
                    <div className="flex items-center justify-between mb-6 border-b border-black pb-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-brand-orange" /> Authenticated System Uplinks
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

                    <div className="grid gap-4 md:grid-cols-3">
                      {sessions.map(session => (
                        <div 
                          key={session.id}
                          className={`p-4 bg-slate-dark/50 border-2 rounded-2xl flex flex-col justify-between h-40 shadow-[2px_2px_0px_#000] ${session.isCurrent ? "border-brand-orange" : "border-black"}`}
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
                  <div className="glass p-6 rounded-3xl border-2 border-black shadow-card bg-white/2">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-6">
                      <Clock className="w-4 h-4 text-brand-orange" /> Authentication History Logs
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[500px]">
                        <thead>
                          <tr className="border-b-2 border-black text-[8px] font-black uppercase tracking-widest text-slate-550">
                            <th className="pb-3.5">Timestamp</th>
                            <th className="pb-3.5">Device Identity</th>
                            <th className="pb-3.5">Uplink IP</th>
                            <th className="pb-3.5 text-center">Uplink Status</th>
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

            {/* TAB 3: SYSTEM REGISTRY (SETTINGS) */}
            <AnimatePresence mode="wait">
              {activeTab === "settings" && (
                <motion.div
                  key="settings-panel"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  {/* PREFERENCES PANEL */}
                  <div className="glass p-6 rounded-3xl border-2 border-black shadow-card bg-white/2">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-6 border-b border-black pb-4">
                      <Bell className="w-4 h-4 text-brand-orange" /> Notification Preferences
                    </h4>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-3.5 bg-slate-dark/40 hover:bg-slate-dark/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-white">Email Subscriptions</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Receive news, updates and matchmaking reports in email</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => updateNotificationSettings({ emailNotifications: e.target.checked })}
                          className="h-4.5 w-4.5 accent-brand-orange rounded border-2 border-black" 
                        />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-slate-dark/40 hover:bg-slate-dark/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-white">Push Alerts</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Active matchmaking and lobby invitations notifications</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.pushNotifications}
                          onChange={(e) => updateNotificationSettings({ pushNotifications: e.target.checked })}
                          className="h-4.5 w-4.5 accent-brand-orange rounded border-2 border-black" 
                        />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-slate-dark/40 hover:bg-slate-dark/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-white">Lobby Invites</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Allow invitations from players not in your active squad list</p>
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

                  {/* PRIVACY SETTINGS */}
                  <div className="glass p-6 rounded-3xl border-2 border-black shadow-card bg-white/2">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-6 border-b border-black pb-4">
                      <Shield className="w-4 h-4 text-brand-orange" /> Privacy & Security Registry
                    </h4>

                    <div className="space-y-4.5">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Visibility Frequency</span>
                        <div className="grid grid-cols-3 gap-3">
                          {["public", "friends", "private"].map(vis => (
                            <button
                              key={vis}
                              onClick={() => updatePrivacySettings({ profileVisibility: vis as any })}
                              className={`h-11 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all border-2 border-black ${privacySettings.profileVisibility === vis ? "bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]" : "bg-white/5 text-slate-400 hover:border-brand-orange/30"}`}
                            >
                              {vis}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-slate-900 border-b border-white/5 w-full my-4" />

                      <label className="flex items-center justify-between p-3.5 bg-slate-dark/40 hover:bg-slate-dark/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-white">Broadcast Online Status</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Let squad contacts detect when you are actively on the platform</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={privacySettings.showOnlineStatus}
                          onChange={(e) => updatePrivacySettings({ showOnlineStatus: e.target.checked })}
                          className="h-4.5 w-4.5 accent-brand-orange rounded border-2 border-black" 
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 bg-slate-dark/40 hover:bg-slate-dark/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-white">Broadcast Game Feed</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Permit matches outcome streaming to leaderboards feed</p>
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

                  {/* VISUAL & INTERFACE THEME */}
                  <div className="glass p-6 rounded-3xl border-2 border-black shadow-card bg-white/2">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-6 border-b border-black pb-4">
                      <Eye className="w-4 h-4 text-brand-orange" /> Appearance Modules
                    </h4>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Interface Theme Mode</span>
                        <div className="grid grid-cols-3 gap-3">
                          {["dark", "light", "gaming"].map(thm => (
                            <button
                              key={thm}
                              onClick={() => updateAppearanceSettings({ theme: thm as any })}
                              className={`h-11 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all border-2 border-black ${appearanceSettings.theme === thm ? "bg-brand-orange text-slate-950 shadow-[2px_2px_0px_#000]" : "bg-white/5 text-slate-400 hover:border-brand-orange/30"}`}
                            >
                              {thm} theme
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-slate-900 border-b border-white/5 w-full my-4" />

                      <label className="flex items-center justify-between p-3.5 bg-slate-dark/40 hover:bg-slate-dark/70 border-2 border-black rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-[2px_2px_0px_#000]">
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
