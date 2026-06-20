"use client";

import { ReactNode } from "react";
import { Navbar } from "@/components/common/navbar";
import { Sidebar } from "@/components/common/sidebar";
import { Footer } from "@/components/common/footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-brand-orange selection:text-slate-950">
      <Navbar />
      <Sidebar />
      <div className="pt-20">{children}</div>
      <Footer />
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </PublicLayout>
  );
}

export function GameLayout({ children }: { children: ReactNode }) {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </PublicLayout>
  );
}

export function CommunityLayout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
