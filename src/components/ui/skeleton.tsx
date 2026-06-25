import { cn } from "@/utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-slate-600/50 border border-black/10 dark:border-white/5",
        className
      )}
      {...props}
    />
  );
}
