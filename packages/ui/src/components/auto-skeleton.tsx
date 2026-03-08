"use client";

import { Shimmer, ShimmerProps } from "shimmer-from-structure";

export const AutoSkeleton: React.FC<
  Omit<ShimmerProps, "backgroundColor" | "shimmerColor" | "duration">
> = ({ ...props }) => {
  return (
    <Shimmer
      {...props}
      backgroundColor="hsl(var(--muted))"
      shimmerColor="hsl(from hsl(var(--muted)) h s calc(l + 20))"
      duration={2}
      {...props}
    />
  );
};
