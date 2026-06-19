"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/utils/cn";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  fallbackEmoji?: string;
  wrapperClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallbackEmoji = "🎮",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden w-full h-full flex items-center justify-center", wrapperClassName)}>
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-inherit" />
      )}

      {hasError ? (
        <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 text-slate-500 w-full h-full rounded-inherit text-4xl">
          {fallbackEmoji}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt || "UniGames Asset Image"}
          className={cn(
            "transition-all duration-500 ease-out object-cover rounded-inherit",
            isLoading ? "scale-105 blur-md" : "scale-100 blur-0",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          {...props}
        />
      )}
    </div>
  );
}
