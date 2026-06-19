import { cn } from "@/utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-slate-900/60 dark:bg-slate-900/40 border border-slate-800/40",
        className
      )}
      {...props}
    />
  );
}
