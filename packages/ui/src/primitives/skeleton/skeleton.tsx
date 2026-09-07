import type { ComponentProps } from "react"

import { cn } from "../../lib/cn"

export type SkeletonProps = ComponentProps<"div">

/** Decorative placeholder for loading states; the loading region itself must carry `aria-busy`. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-surface-tertiary motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  )
}
