"use client";

import { useState } from "react";
import { Bell, UserPlus, Play, Trophy, Megaphone, Check, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface NotificationItem {
  id: string;
  type: "friend_request" | "room_invite" | "match_result" | "announcement";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export function NotificationDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      type: "friend_request",
      title: "Friend Request",
      message: "Alice sent you a friend invitation.",
      time: "2m ago",
      isRead: false,
    },
    {
      id: "n2",
      type: "room_invite",
      title: "Room Invitation",
      message: "DevWizard invited you to join Chess Room #AX49Z.",
      time: "15m ago",
      isRead: false,
    },
    {
      id: "n3",
      type: "match_result",
      title: "Match Victory!",
      message: "You won Tic-Tac-Toe VS Bob. (+150 XP)",
      time: "1h ago",
      isRead: true,
    },
    {
      id: "n4",
      type: "announcement",
      title: "System Update",
      message: "Ludo Club Playtests are now open.",
      time: "1d ago",
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markSingleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "friend_request":
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case "room_invite":
        return <Play className="w-4 h-4 text-brand-dark" />;
      case "match_result":
        return <Trophy className="w-4 h-4 text-success" />;
      case "announcement":
        return <Megaphone className="w-4 h-4 text-purple-600" />;
    }
  };

  const getBgColor = (type: NotificationItem["type"]) => {
    switch (type) {
      case "friend_request":
        return "bg-blue-50 border-blue-200";
      case "room_invite":
        return "bg-amber-50 border-brand-amber/20";
      case "match_result":
        return "bg-green-50 border-green-200";
      case "announcement":
        return "bg-purple-50 border-purple-200";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible click handler backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-grey-border rounded-3xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-grey-border flex items-center justify-between">
              <div>
                <h4 className="font-outfit font-bold text-base text-slate-dark flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-brand-amber fill-current" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-brand-amber text-slate-dark text-[9px] font-bold font-outfit px-2 py-0.5 rounded-full border border-brand-dark/15">
                      {unreadCount} NEW
                    </span>
                  )}
                </h4>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-dark hover:bg-grey-surface rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification List Panel */}
            <div className="max-h-[350px] overflow-y-auto p-4 flex flex-col gap-2.5">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`flex gap-3.5 p-3 rounded-2xl border transition-colors relative group ${
                      item.isRead ? "bg-white border-grey-border" : "bg-amber-50/20 border-brand-amber/15"
                    }`}
                  >
                    {/* Visual icon */}
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${getBgColor(item.type)}`}>
                      {getIcon(item.type)}
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex justify-between items-baseline gap-1">
                        <p className="font-outfit text-xs font-bold text-slate-dark leading-snug">
                          {item.title}
                        </p>
                        <span className="text-[9px] font-bold text-slate-300 font-outfit uppercase shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-muted font-medium mt-1 leading-normal">
                        {item.message}
                      </p>
                    </div>

                    {/* Mark as read button overlay */}
                    {!item.isRead && (
                      <button
                        onClick={(e) => markSingleRead(item.id, e)}
                        className="absolute right-3 top-3 p-1.5 bg-grey-light hover:bg-brand-light text-slate-400 hover:text-brand-dark rounded-lg cursor-pointer transition-colors shadow-sm"
                        title="Mark as Read"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-muted">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs font-outfit font-bold text-slate-dark">All Caught Up!</p>
                  <p className="text-[10px] font-semibold mt-1">You have zero unread alerts in queue.</p>
                </div>
              )}
            </div>

            {/* Footer options */}
            {notifications.length > 0 && (
              <div className="px-5 py-3.5 border-t border-grey-border bg-grey-light/35 flex items-center justify-between text-[10px] font-bold font-outfit text-slate-muted tracking-wider">
                <button
                  onClick={markAllRead}
                  className="hover:text-brand-dark flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> MARK ALL AS READ
                </button>
                <button
                  onClick={clearAll}
                  className="hover:text-red-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> CLEAR ALL
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
