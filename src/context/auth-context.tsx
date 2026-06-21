"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session, LoginHistoryEntry, UserRole } from "@/types/auth";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  communityActivity: boolean;
  gameInvites: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private";
  showOnlineStatus: boolean;
  showGameActivity: boolean;
}

interface AppearanceSettings {
  theme: "dark" | "light" | "gaming";
  highContrast: boolean;
  animationsEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  sessions: Session[];
  loginHistory: LoginHistoryEntry[];
  isLoading: boolean;
  error: string | null;
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  appearanceSettings: AppearanceSettings;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  logoutDevice: (sessionId: string) => void;
  logoutAllDevices: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
  updateOnboardingStep: (step: number, data: Partial<User & { categories: string[]; interests: string[] }>) => void;
  completeOnboarding: () => void;
  updateProfile: (data: { username?: string; bio?: string; avatarUrl?: string }) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  toggleTwoFactor: (enabled: boolean) => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  requestEmailVerification: () => Promise<boolean>;
  verifyAccount: (docType: string, proofUrl: string) => Promise<boolean>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateAppearanceSettings: (settings: Partial<AppearanceSettings>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Defaults for stubbed structures
const DEFAULT_SESSIONS: Session[] = [
  {
    id: "current-session",
    deviceName: "Current Device",
    deviceType: "desktop",
    ipAddress: "127.0.0.1",
    location: "Unknown",
    lastActive: "Active Now",
    isCurrent: true,
  },
];

const DEFAULT_HISTORY: LoginHistoryEntry[] = [];

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: nextSession, status, update } = useSession();
  const [sessions, setSessions] = useState<Session[]>(DEFAULT_SESSIONS);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>(DEFAULT_HISTORY);
  const [error, setError] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    communityActivity: true,
    gameInvites: true,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: "public",
    showOnlineStatus: true,
    showGameActivity: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: "dark",
    highContrast: false,
    animationsEnabled: true,
  });

  // Map NextAuth session.user to our custom User interface
  const user: User | null = nextSession?.user
    ? {
        id: nextSession.user.id || "",
        username: (nextSession.user as any).username || nextSession.user.name || "Gamer",
        email: nextSession.user.email || "",
        avatarUrl: nextSession.user.image || "/avatars/avatar-placeholder.png",
        bio: (nextSession.user as any).bio || "Welcome to my UniGames profile!",
        role: ((nextSession.user as any).role as UserRole) || "user",
        isEmailVerified: true,
        isTwoFactorEnabled: false,
        isOnboarded: true,
        onboardingStep: 5,
        createdAt: new Date().toISOString(),
      }
    : null;

  const isLoading = status === "loading";

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedNotif = localStorage.getItem("unigames_settings_notif");
    const savedPriv = localStorage.getItem("unigames_settings_priv");
    const savedAppe = localStorage.getItem("unigames_settings_appe");

    if (savedNotif) setNotificationSettings(JSON.parse(savedNotif));
    if (savedPriv) setPrivacySettings(JSON.parse(savedPriv));
    if (savedAppe) setAppearanceSettings(JSON.parse(savedAppe));
  }, []);

  // Synchronize document theme class list
  useEffect(() => {
    if (typeof window !== "undefined") {
      const doc = document.documentElement;
      doc.classList.remove("light", "dark", "gaming");
      doc.classList.add(appearanceSettings.theme);
    }
  }, [appearanceSettings.theme]);

  // Google OAuth Login
  const login = async (email: string, password?: string) => {
    setError(null);
    try {
      await signIn("google");
      return true;
    } catch (err: any) {
      setError(err?.message || "Failed to sign in with Google");
      return false;
    }
  };

  // Google OAuth Signup (same flow)
  const signup = async (username: string, email: string, password?: string) => {
    return login(email);
  };

  const logout = () => {
    signOut();
  };

  // Stubs for devices & onboarding to preserve legacy page compilation
  const logoutDevice = (sessionId: string) => {};
  const logoutAllDevices = () => {};
  const forgotPassword = async (email: string) => true;
  const resetPassword = async (password: string) => true;
  const updateOnboardingStep = (step: number, data: Partial<User>) => {};
  const completeOnboarding = () => {};

  // Update profile updates the session info
  const updateProfile = async (data: { username?: string; bio?: string; avatarUrl?: string }) => {
    try {
      // Trigger a PATCH request to our backend profile endpoint (Phase 2.1)
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          bio: data.bio,
          avatar: data.avatarUrl,
        }),
      });

      if (res.ok) {
        // Trigger a NextAuth session update to refresh client state
        update({
          username: data.username,
          image: data.avatarUrl,
        });
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => true;
  const toggleTwoFactor = async (enabled: boolean) => true;
  const verifyEmail = async (code: string) => true;
  const requestEmailVerification = async () => true;
  const verifyAccount = async (docType: string, proofUrl: string) => true;

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    const updated = { ...notificationSettings, ...settings };
    setNotificationSettings(updated);
    localStorage.setItem("unigames_settings_notif", JSON.stringify(updated));
  };

  const updatePrivacySettings = (settings: Partial<PrivacySettings>) => {
    const updated = { ...privacySettings, ...settings };
    setPrivacySettings(updated);
    localStorage.setItem("unigames_settings_priv", JSON.stringify(updated));
  };

  const updateAppearanceSettings = (settings: Partial<AppearanceSettings>) => {
    const updated = { ...appearanceSettings, ...settings };
    setAppearanceSettings(updated);
    localStorage.setItem("unigames_settings_appe", JSON.stringify(updated));
    if (typeof window !== "undefined") {
      const doc = document.documentElement;
      doc.classList.remove("light", "dark", "gaming");
      doc.classList.add(updated.theme);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessions,
        loginHistory,
        isLoading,
        error,
        notificationSettings,
        privacySettings,
        appearanceSettings,
        login,
        signup,
        logout,
        logoutDevice,
        logoutAllDevices,
        forgotPassword,
        resetPassword,
        updateOnboardingStep,
        completeOnboarding,
        updateProfile,
        changePassword,
        toggleTwoFactor,
        verifyEmail,
        requestEmailVerification,
        verifyAccount,
        updateNotificationSettings,
        updatePrivacySettings,
        updateAppearanceSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
