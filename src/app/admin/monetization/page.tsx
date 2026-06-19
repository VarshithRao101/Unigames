"use client";

import React from "react";
import { Navbar } from "@/components/common/navbar";
import { Sidebar } from "@/components/common/sidebar";
import { UserEngagementDashboard } from "@/monetization/dashboard";
import { PlatformAdComponent, PremiumMembershipCTA, CosmeticShopPreview } from "@/monetization/ad-components";
import { Activity, ShieldCheck, DollarSign, Sliders } from "lucide-react";

export default function AdminMonetizationPage() {
  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="flex-grow bg-slate-950 text-white min-h-screen pb-24 pt-24 selection:bg-brand-amber selection:text-slate-950">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-amber/10 rounded-2xl border border-brand-amber/25 text-brand-amber">
                <Sliders className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="font-outfit font-black text-2xl uppercase tracking-wide">Admin Control Console</h1>
                <p className="text-xs text-slate-400">Manage global platform advertisement settings, premium upgrade pricing, and developer telemetry events</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <div className="text-left text-xs font-semibold">
                <span className="text-white block font-bold leading-none">Security Active</span>
                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Console version 1.4.2</span>
              </div>
            </div>
          </div>

          {/* Premium upgrades showcase banners */}
          <PremiumMembershipCTA />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Dashboard Engagement Workspace */}
            <div className="lg:col-span-8 space-y-8">
              <UserEngagementDashboard />
            </div>

            {/* Side tools (Direct Ads configurations, Cosmetics shop specs) */}
            <div className="lg:col-span-4 space-y-6">
              <CosmeticShopPreview />

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h4 className="font-outfit font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-amber" /> Live Sandbox Ad Placements
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  The container below displays a live mock instance of a direct advertisement fallback. (Will not render if pathname safety rule is triggered).
                </p>
                <div className="border border-slate-800 rounded-2xl p-2 bg-slate-950">
                  <PlatformAdComponent placement="footer_sponsored" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </>
  );
}
