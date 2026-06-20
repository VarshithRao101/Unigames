"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session, LoginHistoryEntry, UserRole } from "@/types/auth";

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

const DEFAULT_SESSIONS: Session[] = [
  {
    id: "current-session",
    deviceName: "Windows PC (Chrome)",
    deviceType: "desktop",
    ipAddress: "192.168.1.42",
    location: "San Jose, CA, USA",
    lastActive: "Active Now",
    isCurrent: true,
  },
  {
    id: "session-2",
    deviceName: "iPhone 15 Pro (Safari)",
    deviceType: "mobile",
    ipAddress: "172.56.21.89",
    location: "San Francisco, CA, USA",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "session-3",
    deviceName: "iPad Air (Chrome Mobile)",
    deviceType: "tablet",
    ipAddress: "172.56.22.12",
    location: "Oakland, CA, USA",
    lastActive: "3 days ago",
    isCurrent: false,
  },
];

const DEFAULT_HISTORY: LoginHistoryEntry[] = [
  {
    id: "hist-1",
    timestamp: new Date().toISOString(),
    deviceName: "Windows PC (Chrome)",
    ipAddress: "192.168.1.42",
    location: "San Jose, CA, USA",
    status: "success",
  },
  {
    id: "hist-2",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    deviceName: "iPhone 15 Pro (Safari)",
    ipAddress: "172.56.21.89",
    location: "San Francisco, CA, USA",
    status: "success",
  },
  {
    id: "hist-3",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    deviceName: "MacBook Pro (Firefox)",
    ipAddress: "198.51.100.7",
    location: "New York, NY, USA",
    status: "failed",
  },
];

const DEFAULT_MOCK_USER: User = {
  id: "user-123",
  username: "Valerius",
  email: "valerius@unigames.gg",
  avatarUrl: "/avatars/avatar-1.png",
  bio: "Lead Developer & Pro Gamer. Let's build the future of play.",
  role: "admin",
  isEmailVerified: true,
  isTwoFactorEnabled: false,
  isOnboarded: true,
  onboardingStep: 5,
  createdAt: new Date(Date.now() - 31536000000).toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>(DEFAULT_SESSIONS);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>(DEFAULT_HISTORY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    communityActivity: false,
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

  // Load state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("unigames_user");
    const savedSessions = localStorage.getItem("unigames_sessions");
    const savedHistory = localStorage.getItem("unigames_history");
    const savedNotif = localStorage.getItem("unigames_settings_notif");
    const savedPriv = localStorage.getItem("unigames_settings_priv");
    const savedAppe = localStorage.getItem("unigames_settings_appe");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Setup a default logged in state for demo purposes
      setUser(DEFAULT_MOCK_USER);
      localStorage.setItem("unigames_user", JSON.stringify(DEFAULT_MOCK_USER));
    }

    if (savedSessions) setSessions(JSON.parse(savedSessions));
    else localStorage.setItem("unigames_sessions", JSON.stringify(DEFAULT_SESSIONS));

    if (savedHistory) setLoginHistory(JSON.parse(savedHistory));
    else localStorage.setItem("unigames_history", JSON.stringify(DEFAULT_HISTORY));

    if (savedNotif) setNotificationSettings(JSON.parse(savedNotif));
    if (savedPriv) setPrivacySettings(JSON.parse(savedPriv));
    if (savedAppe) setAppearanceSettings(JSON.parse(savedAppe));

    setIsLoading(false);
  }, []);

  // Synchronize document root theme class list
  useEffect(() => {
    if (typeof window !== "undefined") {
      const doc = document.documentElement;
      doc.classList.remove("light", "dark", "gaming");
      doc.classList.add(appearanceSettings.theme);
    }
  }, [appearanceSettings.theme]);

  const saveUserToLocalStorage = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("unigames_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("unigames_user");
    }
  };

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    setIsLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (email === "admin@unigames.gg" && password === "AdminPass123!") {
      const loggedUser: User = {
        id: "admin-456",
        username: "SystemAdmin",
        email: "admin@unigames.gg",
        avatarUrl: "/avatars/avatar-admin.png",
        bio: "Root Administrator of UniGames.",
        role: "admin",
        isEmailVerified: true,
        isTwoFactorEnabled: true,
        isOnboarded: true,
        onboardingStep: 5,
        createdAt: new Date().toISOString(),
      };
      saveUserToLocalStorage(loggedUser);
      setIsLoading(false);
      return true;
    } else if (password.length >= 8) {
      // General mock user login
      const cleanUsername = email.split("@")[0];
      const loggedUser: User = {
        id: "user-" + Math.floor(Math.random() * 10000),
        username: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        email: email,
        avatarUrl: "/avatars/avatar-2.png",
        bio: "New player to UniGames!",
        role: "user",
        isEmailVerified: false,
        isTwoFactorEnabled: false,
        isOnboarded: false,
        onboardingStep: 1,
        createdAt: new Date().toISOString(),
      };
      saveUserToLocalStorage(loggedUser);
      setIsLoading(false);
      return true;
    } else {
      setError("Invalid credentials. Try admin@unigames.gg / AdminPass123! or any password >= 8 characters.");
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Demo constraints
    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      setIsLoading(false);
      return false;
    }

    const newUser: User = {
      id: "user-" + Math.floor(Math.random() * 10000),
      username,
      email,
      avatarUrl: "/avatars/avatar-placeholder.png",
      role: "user",
      isEmailVerified: false,
      isTwoFactorEnabled: false,
      isOnboarded: false,
      onboardingStep: 1,
      createdAt: new Date().toISOString(),
    };

    saveUserToLocalStorage(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    saveUserToLocalStorage(null);
  };

  const logoutDevice = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem("unigames_sessions", JSON.stringify(updated));
  };

  const logoutAllDevices = () => {
    const current = sessions.find((s) => s.isCurrent) || DEFAULT_SESSIONS[0];
    const updated = [current];
    setSessions(updated);
    localStorage.setItem("unigames_sessions", JSON.stringify(updated));
  };

  const forgotPassword = async (email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }
    return true;
  };

  const resetPassword = async (password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return true;
  };

  const updateOnboardingStep = (step: number, data: Partial<User>) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      ...data,
      onboardingStep: step,
    };
    saveUserToLocalStorage(updatedUser);
  };

  const completeOnboarding = () => {
    if (!user) return;
    const updatedUser = {
      ...user,
      isOnboarded: true,
      onboardingStep: 5,
    };
    saveUserToLocalStorage(updatedUser);
  };

  const updateProfile = (data: { username?: string; bio?: string; avatarUrl?: string }) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      ...data,
    };
    saveUserToLocalStorage(updatedUser);
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  };

  const toggleTwoFactor = async (enabled: boolean) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (user) {
      const updatedUser = { ...user, isTwoFactorEnabled: enabled };
      saveUserToLocalStorage(updatedUser);
    }
    return true;
  };

  const verifyEmail = async (code: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (code === "123456" || code.length === 6) {
      if (user) {
        const updatedUser = { ...user, isEmailVerified: true };
        saveUserToLocalStorage(updatedUser);
      }
      return true;
    }
    return false;
  };

  const requestEmailVerification = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  };

  const verifyAccount = async (docType: string, proofUrl: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (user) {
      // Promoted to contributor if verified during verification flow
      const updatedUser = { ...user, role: "verified" as UserRole };
      saveUserToLocalStorage(updatedUser);
    }
    return true;
  };

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
    // Apply theme helper class to HTML/Body
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
