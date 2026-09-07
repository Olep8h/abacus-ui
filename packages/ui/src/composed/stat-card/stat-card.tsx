"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { animate, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react"

import { cn } from "../../lib/cn"
import { formatPercentDelta } from "../../lib/format"
import { Skeleton } from "../../primitives/skeleton/skeleton"
import { Sparkline } from "./sparkline"

export interface StatCardProps extends Omit<ComponentProps<"section">, "children"> {
  /** What the number is: "Net inflow", "Active cards". Rendered as the card's heading. */
  label: ReactNode
  /** The raw value. Formatting is yours (`format`), so currency and units stay in the app. */
  value: number
  /** Turns the value into text. Defaults to a plain locale number. */
  format?: (value: number) => string
  /** Change versus the comparison period as a ratio: `0.042` renders "+4.2%". */
  delta?: number
  /** Names the comparison period for screen readers and the caption: "vs last 30 days". */
  deltaLabel?: string
  /** When a *lower* number is good (churn, failed payments), flip the colour semantics. */
  invertTrend?: boolean
  /** Recent values for the sparkline. Omit to hide it. */
  sparkline?: readonly number[]
  /** Replace everything with a skeleton of the same size. Sets `aria-busy`. */
  loading?: boolean
}

/** Headline metric with change and trend. Counts up once on mount, then updates instantly. */
export function StatCard({
  label,
  value,
  format = (v) => v.toLocaleString("en-GB"),
  delta,
  deltaLabel = "vs previous period",
  invertTrend = false,
  sparkline,
  loading = false,
  className,
  ...props
}: StatCardProps) {
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(reduceMotion ? value : 0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (loading) return
    if (hasAnimated.current || reduceMotion) {
      hasAnimated.current = true
      setDisplay(value)
      return
    }
    hasAnimated.current = true
    const controls = animate(0, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    })
    return () => controls.stop()
  }, [value, loading, reduceMotion])

  const direction = delta === undefined || delta === 0 ? "flat" : delta > 0 ? "up" : "down"
  const good = direction === "flat" ? null : (direction === "up") !== invertTrend
  const DeltaIcon = direction === "down" ? TrendingDown : TrendingUp

  return (
    <section
      data-slot="stat-card"
      aria-busy={loading || undefined}
      className={cn(
        "flex min-w-0 flex-col gap-200 rounded-md border border-line bg-surface p-400 text-fg",
        className,
      )}
      {...props}
    >
      <h3 className="text-sm font-medium text-fg-secondary">{label}</h3>
      {loading ? (
        <div className="flex flex-col gap-200">
          <Skeleton className="h-control-md w-1600" />
          <Skeleton className="h-control-sm w-2400" />
        </div>
      ) : (
        <div className="flex items-end justify-between gap-300">
          <div className="flex min-w-0 flex-col gap-100">
            <p
              className="truncate text-xl font-semibold tabular-nums"
              aria-live="off"
              title={format(value)}
            >
              {format(display)}
            </p>
            {delta !== undefined ? (
              <p
                className={cn(
                  "flex items-center gap-100 text-sm tabular-nums",
                  good === null
                    ? "text-fg-secondary"
                    : good
                      ? "text-fg-positive"
                      : "text-fg-danger",
                )}
              >
                {direction !== "flat" ? (
                  <DeltaIcon aria-hidden="true" className="size-400" />
                ) : null}
                <span>
                  <span className="sr-only">
                    {direction === "up" ? "Up" : direction === "down" ? "Down" : "Unchanged"}{" "}
                  </span>
                  {formatPercentDelta(delta)}
                </span>
                <span className="text-fg-secondary">{deltaLabel}</span>
              </p>
            ) : null}
          </div>
          {sparkline ? (
            <Sparkline data={sparkline} trend={good === null ? "flat" : good ? "up" : "down"} />
          ) : null}
        </div>
      )}
    </section>
  )
}
