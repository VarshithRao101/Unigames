"use client";

import { AlertOctagon, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- PART 8.1: EMPTY STATE ---
export function EmptyState({
  title = "No Data Found",
  description = "There are currently no items available in this category.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white border border-dashed border-grey-border rounded-3xl p-10 text-center max-w-md mx-auto my-6 shadow-sm">
      <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h3 className="font-outfit font-extrabold text-xl text-slate-dark">
        {title}
      </h3>
      <p className="text-xs text-slate-muted font-medium mt-2 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-6 text-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// --- PART 8.2: NETWORK ERROR STATE ---
export function NetworkErrorState({
  title = "Connection Lost",
  description = "We are unable to reach the lobby services. Check your connection.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-50/50 border border-red-200 rounded-3xl p-10 text-center max-w-md mx-auto my-6 shadow-sm">
      <AlertOctagon className="w-12 h-12 text-red-600 mx-auto mb-4" />
      <h3 className="font-outfit font-extrabold text-xl text-red-700">
        {title}
      </h3>
      <p className="text-xs text-slate-muted font-medium mt-2 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="mt-6 text-xs hover:bg-white text-slate-dark"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
}
