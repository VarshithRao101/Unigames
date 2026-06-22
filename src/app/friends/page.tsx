"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AuthGuard } from "@/components/common/auth-guard";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { 
  Users, UserPlus, Check, X, Search, Shield, 
  Trophy, Flame, Trash2, Heart, Award, ArrowRight, Eye, 
  MessageSquare, Zap, ShieldAlert, Star, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Friend {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  role: string;
  xp: number;
  level: number;
  friendshipId: string;
  stats?: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    winStreak: number;
    maxWinStreak: number;
  };
}

interface PendingRequest {
  id: string;
  sender?: {
    id: string;
    username: string;
    avatar?: string;
    level: number;
  };
  receiver?: {
    id: string;
    username: string;
    avatar?: string;
    level: number;
  };
  createdAt: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"list" | "requests" | "find">("list");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<PendingRequest[]>([]);
  const [outgoing, setOutgoing] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search players tab states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestSentUsernames, setRequestSentUsernames] = useState<Record<string, boolean>>({});

  // View Profile Modal states
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Challenge Loading State
  const [challengingId, setChallengingId] = useState<string | null>(null);

  // Fetch friends and pending requests lists
  const fetchFriendsData = async () => {
    try {
      const res = await fetch("/api/friends");
      if (!res.ok) throw new Error("Failed to load friends list");
      const json = await res.json();
      if (json.success && json.data) {
        setFriends(json.data.friends || []);
        setIncoming(json.data.pending?.incoming || []);
        setOutgoing(json.data.pending?.outgoing || []);
      }
    } catch (err) {
      console.error("Error loading squad deck:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFriendsData();
    }
  }, [user]);

  // Search users API
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim().length < 2) return;

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) throw new Error("Search request failed");
      const json = await res.json();
      if (json.success && json.data) {
        setSearchResults(json.data);
      }
    } catch (err) {
      console.error("Error searching players:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Send Friend Request POST
  const handleSendRequest = async (username: string) => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverUsername: username }),
      });
      const json = await res.json();
      if (json.success) {
        setRequestSentUsernames(prev => ({ ...prev, [username]: true }));
        fetchFriendsData();
      } else {
        alert(json.error?.message || "Failed to dispatch friend request");
      }
    } catch (err) {
      console.error("Error sending request:", err);
    }
  };

  // Accept Friend Request PATCH
  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
      });
      const json = await res.json();
      if (json.success) {
        fetchFriendsData();
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  // Reject Friend Request DELETE
  const handleRejectRequest = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}?action=reject`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchFriendsData();
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  // Remove Friend DELETE
  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm("Are you sure you want to remove this player from your friends list?")) return;

    try {
      const res = await fetch(`/api/friends/${friendshipId}?action=remove`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchFriendsData();
      }
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  // Fetch full details of a user for modal view
  const handleViewProfile = async (friendUserId: string) => {
    setProfileLoading(true);
    setIsModalOpen(true);
    try {
      const res = await fetch(`/api/users/${friendUserId}`);
      if (!res.ok) throw new Error("Could not fetch user details");
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedProfile(json.data);
      }
    } catch (err) {
      console.error("Error retrieving player card:", err);
      setIsModalOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  // Create duel challenge lobby
  const handleChallengeFriend = async (friend: Friend) => {
    setChallengingId(friend._id);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug: "tictactoe",
          maxPlayers: 2,
          settings: {
            isPrivate: true,
            invitedUserId: friend._id
          }
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        // Redirect creator instantly to their custom game lobby
        router.push(`/rooms/${json.data.code}`);
      } else {
        alert(json.error?.message || "Failed to establish matchmaking lobby");
      }
    } catch (err) {
      console.error("Challenge error:", err);
    } finally {
      setChallengingId(null);
    }
  };

  // Helper count badges
  const pendingCount = incoming.length;

  return (
    <AuthGuard>
      <div className="bg-transparent text-white min-h-screen">
        <Navbar />

        <main className="pt-32 pb-20 px-6 container mx-auto max-w-7xl" suppressHydrationWarning>
          {/* Header Section */}
          <section className="mb-8">
            <span className="kicker mb-1.5 inline-flex items-center gap-1.5 text-[9px]">
              <Users className="w-3 h-3" /> Squad Network
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black uppercase tracking-tighter text-slate-50">
              The <span className="gradient-text">Squad Deck</span>
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-semibold leading-relaxed max-w-xl">
              Synchronize with competitive allies, coordinate matchups, and issue custom challenge room requests.
            </p>
          </section>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 border-2 border-black rounded-xl p-1.5 mb-6 max-w-md shadow-[2px_2px_0px_#000000]">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 h-9 rounded-lg text-[9.5px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "list"
                  ? "bg-brand-orange text-slate-950 border border-black shadow-[1.5px_1.5px_0px_#000]"
                  : "text-slate-450 border-none hover:text-slate-50"
              }`}
            >
              My Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 h-9 rounded-lg text-[9.5px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "requests"
                  ? "bg-brand-orange text-slate-950 border border-black shadow-[1.5px_1.5px_0px_#000]"
                  : "text-slate-450 border-none hover:text-slate-50"
              }`}
            >
              Requests
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-danger border border-black text-[7px] text-white flex items-center justify-center shadow-[0.5px_0.5px_0px_#000] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("find")}
              className={`flex-1 h-9 rounded-lg text-[9.5px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "find"
                  ? "bg-brand-orange text-slate-950 border border-black shadow-[1.5px_1.5px_0px_#000]"
                  : "text-slate-450 border-none hover:text-slate-50"
              }`}
            >
              Add Friends
            </button>
          </div>

          {/* Loading Screen */}
          {loading ? (
            <div className="glass rounded-3xl p-16 text-center border-2 border-black shadow-card flex flex-col items-center justify-center min-h-[300px]">
              <Loader label="Synchronizing Squads" />
            </div>
          ) : (
            <section className="min-h-[400px]">
              {/* 1. MY FRIENDS TAB */}
              {activeTab === "list" && (
                <div>
                  {friends.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {friends.map((friend) => (
                        <motion.article
                          key={friend._id}
                          className="glass border-2 border-black bg-white dark:bg-slate-900 rounded-2xl shadow-card p-4.5 flex flex-col justify-between"
                          layout
                        >
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              {friend.avatar ? (
                                <img
                                  src={friend.avatar}
                                  alt={friend.username}
                                  className="h-10 w-10 rounded-full border border-black object-cover shadow-[1px_1px_0px_#000]"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-slate-950 border border-black flex items-center justify-center font-black text-slate-50 text-sm shadow-[1px_1px_0px_#000]">
                                  {friend.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h3 className="text-xs font-black uppercase text-slate-950 dark:text-white truncate">
                                    {friend.username}
                                  </h3>
                                  <span className="px-1.5 py-0.5 bg-brand-orange/15 border border-black rounded text-[6.5px] font-black text-brand-orange uppercase leading-none shadow-[0.5px_0.5px_0px_#000]">
                                    LVL {friend.level}
                                  </span>
                                </div>
                                <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                  Online · Idle
                                </p>
                              </div>
                            </div>

                            {/* View Profile Action */}
                            <button
                              onClick={() => handleViewProfile(friend._id)}
                              className="w-7 h-7 rounded-lg border-2 border-black bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center shadow-[1px_1px_0px_#000] cursor-pointer"
                              title="View stats"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950 border border-black rounded-xl mb-4 text-[8px] font-black uppercase tracking-widest text-slate-400">
                            <div>
                              <p className="text-[7px] text-slate-500 mb-0.5">Games Played</p>
                              <p className="text-white font-space text-[10px]">{friend.stats?.gamesPlayed || 0}</p>
                            </div>
                            <div>
                              <p className="text-[7px] text-slate-500 mb-0.5">Total Wins</p>
                              <p className="text-brand-orange font-space text-[10px]">{friend.stats?.wins || 0}</p>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              disabled={challengingId !== null}
                              onClick={() => handleChallengeFriend(friend)}
                              className="btn-neo flex-1 h-8 rounded-lg font-black uppercase text-[8.5px] tracking-wider cursor-pointer flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_#000] disabled:opacity-50"
                            >
                              {challengingId === friend._id ? (
                                <Zap className="w-3.5 h-3.5 animate-bounce" />
                              ) : (
                                <Zap className="w-3.5 h-3.5" />
                              )}
                              Challenge
                            </button>
                            <button
                              onClick={() => handleRemoveFriend(friend.friendshipId)}
                              className="h-8 px-2.5 rounded-lg bg-red-650/10 hover:bg-red-650/20 text-red-500 border-2 border-black font-black uppercase text-[8.5px] cursor-pointer flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]"
                              title="Remove friend"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  ) : (
                    <div className="glass rounded-xl p-12 text-center border-2 border-black shadow-card">
                      <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
                      <h3 className="text-sm font-black uppercase tracking-tighter mb-1">Your deck is empty</h3>
                      <p className="text-[10px] text-slate-400 font-bold max-w-sm mx-auto mb-4">
                        Search players or accept pending invites to populate your allies lobby.
                      </p>
                      <button 
                        onClick={() => setActiveTab("find")}
                        className="btn-neo h-8 px-6 rounded-lg font-black uppercase text-[9px] tracking-widest cursor-pointer"
                      >
                        Find Allies
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. PENDING REQUESTS TAB */}
              {activeTab === "requests" && (
                <div className="space-y-6">
                  {/* Incoming Requests */}
                  <div className="glass border-2 border-black bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-card">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 pb-2.5 border-b border-black flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-brand-orange" /> Incoming Invites ({incoming.length})
                    </h3>

                    {incoming.length > 0 ? (
                      <div className="divide-y-2 divide-black/10 dark:divide-slate-800 space-y-3">
                        {incoming.map((req) => (
                          <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 first:pt-0">
                            <div className="flex items-center gap-3">
                              {req.sender?.avatar ? (
                                <img
                                  src={req.sender.avatar}
                                  alt={req.sender.username}
                                  className="h-8.5 w-8.5 rounded-full border border-black object-cover shadow-[1px_1px_0px_#000]"
                                />
                              ) : (
                                <div className="h-8.5 w-8.5 rounded-full bg-slate-950 border border-black flex items-center justify-center font-black text-slate-50 text-xs shadow-[1px_1px_0px_#000]">
                                  {req.sender?.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-black uppercase text-slate-950 dark:text-white flex items-center gap-1.5">
                                  {req.sender?.username}
                                  <span className="px-1 py-0.5 bg-slate-950 border border-black rounded text-[6px] font-black text-slate-450 tracking-widest leading-none">
                                    LVL {req.sender?.level}
                                  </span>
                                </p>
                                <p className="text-[7.5px] text-slate-400 font-semibold tracking-wider">
                                  Received {new Date(req.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 justify-end sm:justify-start">
                              <button
                                onClick={() => handleAcceptRequest(req.id)}
                                className="btn-neo h-7.5 px-3.5 rounded-md font-black uppercase text-[8px] flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req.id)}
                                className="h-7.5 px-3.5 rounded-md bg-slate-950 border border-black text-slate-400 hover:text-white font-black uppercase text-[8px] flex items-center gap-1 shadow-[1px_1px_0px_#000] cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" /> Ignore
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-bold uppercase py-4">
                        No pending incoming invitations
                      </p>
                    )}
                  </div>

                  {/* Outgoing Requests */}
                  <div className="glass border-2 border-black bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-card">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 pb-2.5 border-b border-black flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-brand-orange" /> Outgoing Dispatches ({outgoing.length})
                    </h3>

                    {outgoing.length > 0 ? (
                      <div className="divide-y-2 divide-black/10 dark:divide-slate-800 space-y-3">
                        {outgoing.map((req) => (
                          <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 first:pt-0">
                            <div className="flex items-center gap-3">
                              {req.receiver?.avatar ? (
                                <img
                                  src={req.receiver.avatar}
                                  alt={req.receiver.username}
                                  className="h-8.5 w-8.5 rounded-full border border-black object-cover shadow-[1px_1px_0px_#000]"
                                />
                              ) : (
                                <div className="h-8.5 w-8.5 rounded-full bg-slate-950 border border-black flex items-center justify-center font-black text-slate-50 text-xs shadow-[1px_1px_0px_#000]">
                                  {req.receiver?.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-black uppercase text-slate-950 dark:text-white flex items-center gap-1.5">
                                  {req.receiver?.username}
                                  <span className="px-1 py-0.5 bg-slate-950 border border-black rounded text-[6px] font-black text-slate-450 tracking-widest leading-none">
                                    LVL {req.receiver?.level}
                                  </span>
                                </p>
                                <p className="text-[7.5px] text-slate-400 font-semibold tracking-wider">
                                  Sent {new Date(req.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div>
                              <span className="px-2.5 py-1 rounded bg-slate-950 border border-black text-[7.5px] font-black text-slate-400 uppercase tracking-widest shadow-[1px_1px_0px_#000]">
                                Pending Approval
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-bold uppercase py-4">
                        No pending outgoing invitations
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 3. ADD FRIENDS TAB */}
              {activeTab === "find" && (
                <div className="space-y-6">
                  {/* Search box */}
                  <div className="glass border-2 border-black bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-card">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <Search className="w-4 h-4 text-brand-orange" /> Find Players
                    </h3>

                    <form onSubmit={handleSearch} className="flex gap-2">
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        type="text"
                        placeholder="ENTER USERNAME..."
                        className="flex-1 max-w-sm h-10 px-4 bg-slate-950 border-2 border-black rounded-xl text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_#000] focus:outline-none focus:border-brand-orange"
                      />
                      <button
                        type="submit"
                        disabled={searchQuery.trim().length < 2 || searchLoading}
                        className="btn-neo h-10 px-6 rounded-xl text-[9.5px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50"
                      >
                        <Search className="w-3.5 h-3.5" /> Search
                      </button>
                    </form>
                  </div>

                  {/* Search results list */}
                  <div className="glass border-2 border-black bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-card">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 pb-2.5 border-b border-black flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-brand-orange" /> Search Results
                    </h3>

                    {searchLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center">
                        <Loader label="Searching Databases" className="w-56" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="divide-y-2 divide-black/10 dark:divide-slate-800 space-y-3">
                        {searchResults.map((player) => {
                          const isAlreadyRequestSent = requestSentUsernames[player.username] || 
                            outgoing.some(out => out.receiver?.username === player.username);
                          const isAlreadyFriend = friends.some(fr => fr.username === player.username);

                          return (
                            <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 first:pt-0">
                              <div className="flex items-center gap-3">
                                {player.avatar ? (
                                  <img
                                    src={player.avatar}
                                    alt={player.username}
                                    className="h-8.5 w-8.5 rounded-full border border-black object-cover shadow-[1px_1px_0px_#000]"
                                  />
                                ) : (
                                  <div className="h-8.5 w-8.5 rounded-full bg-slate-950 border border-black flex items-center justify-center font-black text-slate-50 text-xs shadow-[1px_1px_0px_#000]">
                                    {player.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-black uppercase text-slate-950 dark:text-white flex items-center gap-1.5">
                                    {player.username}
                                    <span className="px-1 py-0.5 bg-slate-950 border border-black rounded text-[6px] font-black text-slate-450 tracking-widest leading-none">
                                      LVL {player.level}
                                    </span>
                                  </p>
                                  <p className="text-[8px] text-slate-400 font-bold max-w-xs truncate leading-normal">
                                    {player.bio || "No profile bio initialized."}
                                  </p>
                                </div>
                              </div>

                              <div>
                                {isAlreadyFriend ? (
                                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-black text-[7.5px] font-black text-brand-orange uppercase tracking-widest shadow-[1px_1px_0px_#000] inline-block">
                                    Already Friends
                                  </span>
                                ) : isAlreadyRequestSent ? (
                                  <span className="px-2.5 py-1 rounded bg-slate-950 border border-black text-[7.5px] font-black text-slate-400 uppercase tracking-widest shadow-[1px_1px_0px_#000] inline-block">
                                    Invite Dispatched
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSendRequest(player.username)}
                                    className="btn-neo h-8 px-4 rounded-lg font-black uppercase text-[8.5px] flex items-center gap-1"
                                  >
                                    <UserPlus className="w-3.5 h-3.5" /> Invite Player
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-bold uppercase py-4">
                        {queryInputDescription(searchQuery)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </main>

        {/* View Profile Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 border-[3.5px] border-black p-6 rounded-[2.25rem] shadow-[6px_6px_0px_#000000] relative space-y-6 text-slate-900 dark:text-white"
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedProfile(null);
                  }}
                  className="absolute right-4.5 top-4.5 w-7 h-7 border-2 border-black bg-slate-950 hover:bg-slate-900 text-slate-450 hover:text-white rounded-lg flex items-center justify-center shadow-[1px_1px_0px_#000] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {profileLoading || !selectedProfile ? (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <Loader label="Querying Player Card" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* User Intro */}
                    <div className="flex items-center gap-4">
                      {selectedProfile.avatar ? (
                        <img
                          src={selectedProfile.avatar}
                          alt={selectedProfile.username}
                          className="h-14 w-14 rounded-full border-2.5 border-black object-cover shadow-[2px_2px_0px_#000]"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-slate-950 border-2.5 border-black flex items-center justify-center font-black text-slate-50 text-xl shadow-[2px_2px_0px_#000]">
                          {selectedProfile.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                            {selectedProfile.username}
                          </h2>
                          <span className="px-2 py-0.5 bg-brand-orange border border-black rounded text-[7.5px] font-black text-slate-950 uppercase tracking-widest shadow-[0.5px_0.5px_0px_#000] leading-none">
                            LVL {selectedProfile.level}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          Role: {selectedProfile.role || "Player"}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {selectedProfile.bio && (
                      <div className="p-3 bg-slate-950 border border-black rounded-2xl text-[10px] text-slate-300 font-medium leading-relaxed shadow-[1.5px_1.5px_0px_#000]">
                        {selectedProfile.bio}
                      </div>
                    )}

                    {/* Stats Scorecard */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 pb-1.5 border-b border-black flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-brand-orange" /> Combat score metrics
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <div className="p-3 bg-slate-950 border border-black rounded-xl shadow-[1.5px_1.5px_0px_#000]">
                          <p className="text-[7.5px] text-slate-500 mb-0.5">Games Played</p>
                          <p className="text-white font-space text-[12px]">{selectedProfile.stats?.gamesPlayed || 0}</p>
                        </div>
                        <div className="p-3 bg-slate-950 border border-black rounded-xl shadow-[1.5px_1.5px_0px_#000]">
                          <p className="text-[7.5px] text-slate-500 mb-0.5">Victories</p>
                          <p className="text-success font-space text-[12px]">{selectedProfile.stats?.wins || 0}</p>
                        </div>
                        <div className="p-3 bg-slate-950 border border-black rounded-xl shadow-[1.5px_1.5px_0px_#000]">
                          <p className="text-[7.5px] text-slate-500 mb-0.5">Defeats</p>
                          <p className="text-danger font-space text-[12px]">{selectedProfile.stats?.losses || 0}</p>
                        </div>
                        <div className="p-3 bg-slate-950 border border-black rounded-xl shadow-[1.5px_1.5px_0px_#000]">
                          <p className="text-[7.5px] text-slate-500 mb-0.5">Win Streak</p>
                          <p className="text-brand-orange font-space text-[12px] flex items-center gap-1">
                            <Flame className="w-3 h-3 text-brand-orange fill-current" /> {selectedProfile.stats?.winStreak || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Achievements */}
                    {selectedProfile.achievements && selectedProfile.achievements.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 pb-1.5 border-b border-black flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-brand-orange" /> Unlocked achievements
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.achievements.map((ach: any) => (
                            <span 
                              key={ach.id}
                              className="px-2 py-1 rounded bg-slate-950 border border-black text-[7px] font-black text-white uppercase tracking-widest shadow-[1px_1px_0px_#000] flex items-center gap-1"
                            >
                              <Star className="w-2.5 h-2.5 text-brand-orange fill-current" />
                              {ach.id.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </AuthGuard>
  );
}

function queryInputDescription(query: string) {
  if (query.trim().length === 0) {
    return "Enter a player's username to search database collections.";
  }
  if (query.trim().length < 2) {
    return "Query must be at least 2 characters.";
  }
  return "No matches found.";
}
