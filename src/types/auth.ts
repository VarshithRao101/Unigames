export type UserRole = "user" | "verified" | "contributor" | "founder" | "moderator" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  isOnboarded: boolean;
  onboardingStep: number;
  createdAt: string;
}

export interface Session {
  id: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet";
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  deviceName: string;
  ipAddress: string;
  location: string;
  status: "success" | "failed";
}

export interface AuthState {
  user: User | null;
  sessions: Session[];
  loginHistory: LoginHistoryEntry[];
  isLoading: boolean;
  error: string | null;
}
