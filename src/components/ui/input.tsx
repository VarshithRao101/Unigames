import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helperText, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={id}
            className="mb-2 block pl-1 font-outfit text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400"
          >
            {label}
          </label>
        ) : null}

        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full rounded-2xl border bg-grey-surface/95 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-brand-amber focus:bg-grey-surface",
            error ? "border-danger text-danger focus:border-danger" : "border-grey-border",
            className
          )}
          {...props}
        />

        {helperText ? (
          <span className={cn("mt-2 block pl-1 text-xs", error ? "text-danger" : "text-slate-400")}>
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
