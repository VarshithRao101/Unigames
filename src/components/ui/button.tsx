import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "danger" | "ghost" | "link" | "outline";
  size?: "sm" | "md" | "lg" | "xl" | "xs";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-2xl border font-outfit text-[11px] font-extrabold uppercase tracking-[0.2em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-slate-dark disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      primary:
        "border-brand-orange/40 bg-brand-orange text-slate-dark shadow-neon-orange hover:bg-brand-orange/90 hover:shadow-premium active:translate-y-px",
      secondary:
        "border-grey-border bg-grey-surface/90 text-white hover:border-brand-orange/35 hover:text-white",
      glass:
        "border-white/10 bg-white/5 text-white backdrop-blur-md hover:border-white/20 hover:bg-white/8",
      danger:
        "border-danger/40 bg-danger/12 text-danger hover:bg-danger/18",
      ghost:
        "border-transparent bg-transparent text-slate-400 hover:border-grey-border hover:bg-white/5 hover:text-white",
      outline:
        "border-white/10 bg-transparent text-white hover:bg-white/5 hover:border-white/20",
      link:
        "border-transparent bg-transparent px-0 text-brand-orange hover:text-white !rounded-none",
    };

    const sizes = {
      xs: "h-8 px-3 text-[9px]",
      sm: "h-10 px-4",
      md: "h-11 px-5",
      lg: "h-12 px-6",
      xl: "h-14 px-10 text-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : null}

        {!isLoading && leftIcon ? <span className="inline-flex">{leftIcon}</span> : null}
        <span className="inline-flex items-center justify-center gap-1.5">{children}</span>
        {!isLoading && rightIcon ? <span className="inline-flex">{rightIcon}</span> : null}
      </button>
    );
  }
);

Button.displayName = "Button";
