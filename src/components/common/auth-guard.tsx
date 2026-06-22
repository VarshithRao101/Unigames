"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { signIn } from "next-auth/react";
import { Loader } from "@/components/ui/loader";

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
        router.replace("/profile");
      }
      return;
    }

    if (!user) {
      router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-50">
        <Loader label="Loading Session" />
      </div>
    );
  }

  // Prevent flash of content when rendering protected route while user is invalid
  if (guestOnly && user) return null;
  if (!guestOnly && !user) return null;
  if (!guestOnly && user && allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
