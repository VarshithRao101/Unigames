"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("user" | "verified" | "contributor" | "founder" | "moderator" | "admin")[];
  guestOnly?: boolean;
}

export function AuthGuard({ children, allowedRoles, guestOnly = false }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (guestOnly) {
      if (user) {
        if (!user.isOnboarded) {
          router.replace("/onboarding");
        } else {
          router.replace("/profile");
        }
      }
      return;
    }

    if (!user) {
      // Not logged in -> redirect to login with ref redirect
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!user.isOnboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const hasRole = allowedRoles.includes(user.role);
      if (!hasRole) {
        router.replace("/unauthorized");
      }
    }
  }, [user, isLoading, router, pathname, allowedRoles, guestOnly]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-brand-amber/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-brand-amber border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-bold font-outfit uppercase tracking-widest text-slate-400">
          Loading Session...
        </p>
      </div>
    );
  }

  // Prevent flash of content when rendering protected route while user is invalid
  if (guestOnly && user) return null;
  if (!guestOnly && !user) return null;
  if (!guestOnly && user && !user.isOnboarded && pathname !== "/onboarding") return null;
  if (!guestOnly && user && allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
