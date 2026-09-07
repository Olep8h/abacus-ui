import { scaleLinear } from "d3-scale"
import { useId } from "react"

import { cn } from "../../lib/cn"

export interface SparklineProps {
  /** Ordered values; at least two points make a line. */
  data: readonly number[]
  /** Colour intent of the line. */
  trend?: "up" | "down" | "flat"
  width?: number
  height?: number
  className?: string
}

/** Decorative trend line: two `d3-scale` linear scales and a hand-built path. */
export function Sparkline({
  data,
  trend = "flat",
  width = 96,
  height = 32,
  className,
}: SparklineProps) {
  const gradientId = useId()
  if (data.length < 2) return null

  const pad = 2
  const x = scaleLinear()
    .domain([0, data.length - 1])
    .range([pad, width - pad])
  const [min, max] = data.reduce(
    ([lo, hi], v) => [Math.min(lo, v), Math.max(hi, v)],
    [Infinity, -Infinity],
  )
  const y = scaleLinear()
    .domain(min === max ? [min - 1, max + 1] : [min, max])
    .range([height - pad, pad])

  const line = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ")
  const area = `${line} L${x(data.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`
  const last = data[data.length - 1] ?? 0

  const stroke =
    trend === "up"
      ? "stroke-fg-positive"
      : trend === "down"
        ? "stroke-fg-danger"
        : "stroke-fg-tertiary"
  const fill =
    trend === "up" ? "text-fg-positive" : trend === "down" ? "text-fg-danger" : "text-fg-tertiary"

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0 overflow-visible", fill, className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={stroke}
      />
      <circle cx={x(data.length - 1)} cy={y(last)} r="2" className="fill-current" />
    </svg>
  )
}
