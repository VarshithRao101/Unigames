import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-grey-surface border border-grey-border rounded-2xl p-6 shadow-premium transition-all duration-300",
          hoverable && "hover:-translate-y-1 hover:shadow-premium-hover border-brand-amber/30",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-slate-dark/40 backdrop-blur-xl border border-grey-border rounded-2xl p-6 shadow-premium transition-all duration-300",
          hoverable && "hover:-translate-y-1 hover:shadow-premium-hover hover:bg-slate-dark/60 border-brand-amber/30",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";
