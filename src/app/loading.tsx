import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RouteLoader() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col gap-6 text-white pt-24 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Banner Skeleton */}
      <Skeleton className="h-44 sm:h-56 w-full rounded-3xl" />

      {/* Main layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left main grid */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>

        {/* Right side activity timeline skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
