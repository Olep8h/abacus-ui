"use client"

import { useId, useMemo, type ComponentProps, type ReactNode } from "react"
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "../../lib/cn"
import { formatCompact } from "../../lib/format"
import { Skeleton } from "../../primitives/skeleton/skeleton"
import { chartAxis, seriesColor } from "./chart-theme"

export interface TimeSeriesPoint {
  /** Epoch milliseconds. */
  t: number
  [series: string]: number
}

export interface TimeSeriesSeries {
  /** Key into each point. */
  key: string
  /** Legend / tooltip label. */
  label: string
}

export interface TimeSeriesChartProps extends Omit<ComponentProps<"figure">, "children"> {
  /** Sorted by `t` ascending. */
  data: readonly TimeSeriesPoint[]
  /** One or more series to plot; colour follows order. */
  series: readonly TimeSeriesSeries[]
  /** One sentence describing the data; becomes the SVG's `<desc>` and the figure caption. Required. */
  summary: string
  /** Short accessible name of the chart, e.g. "Daily flow". */
  title?: string
  /** Formats values for the Y axis and tooltip. */
  formatValue?: (value: number) => string
  /** Formats timestamps for the X axis and tooltip. */
  formatTime?: (t: number) => string
  /** Show the range selector under the chart. */
  brush?: boolean
  /** Pixel height of the plot area. */
  height?: number
  /** Skeleton of the same height; sets `aria-busy`. */
  loading?: boolean
  /** Rendered in place of the plot when `data` is empty. */
  empty?: ReactNode
}

const defaultFormatTime = (t: number) =>
  new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" })

/** Recharts area chart with tokenised colours, an accessible summary and an optional brush. */
export function TimeSeriesChart({
  data,
  series,
  summary,
  title = "Chart",
  formatValue = formatCompact,
  formatTime = defaultFormatTime,
  brush = false,
  height = 240,
  loading = false,
  empty = "No data for this range.",
  className,
  ...props
}: TimeSeriesChartProps) {
  const gradientBase = useId()
  const chartData = useMemo(() => data as TimeSeriesPoint[], [data])

  return (
    <figure
      data-slot="time-series-chart"
      aria-busy={loading || undefined}
      className={cn("flex min-w-0 flex-col gap-200", className)}
      {...props}
    >
      <figcaption className="sr-only">{summary}</figcaption>
      {loading ? (
        <Skeleton style={{ height }} className="w-full" />
      ) : chartData.length === 0 ? (
        <div
          style={{ height }}
          className="grid place-items-center rounded-md border border-dashed border-line-control text-sm text-fg-secondary"
        >
          {empty}
        </div>
      ) : (
        <div style={{ height: brush ? height + 40 : height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              accessibilityLayer
              title={title}
              desc={summary}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                {series.map((s, i) => (
                  <linearGradient
                    key={s.key}
                    id={`${gradientBase}-${i}`}
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={seriesColor(i)} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={seriesColor(i)} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke={chartAxis.grid} strokeDasharray="2 4" />
              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatTime}
                tick={{ fill: chartAxis.tick, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={32}
              />
              <YAxis
                tickFormatter={formatValue}
                tick={{ fill: chartAxis.tick, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <RechartsTooltip
                cursor={{ stroke: chartAxis.cursor, strokeDasharray: "2 4" }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-md border border-line bg-surface px-300 py-200 text-sm text-fg shadow-md">
                      <p className="mb-100 text-xs text-fg-secondary">
                        {formatTime(Number(label))}
                      </p>
                      {payload.map((entry, i) => (
                        <p
                          key={String(entry.dataKey)}
                          className="flex items-center gap-200 tabular-nums"
                        >
                          <span
                            aria-hidden="true"
                            className="size-200 rounded-full"
                            style={{ background: seriesColor(i) }}
                          />
                          <span className="text-fg-secondary">
                            {series.find((s) => s.key === entry.dataKey)?.label ??
                              String(entry.dataKey)}
                          </span>
                          <span className="ml-auto font-medium">
                            {formatValue(Number(entry.value))}
                          </span>
                        </p>
                      ))}
                    </div>
                  ) : null
                }
              />
              {series.map((s, i) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={seriesColor(i)}
                  strokeWidth={2}
                  fill={`url(#${gradientBase}-${i})`}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              ))}
              {brush ? (
                <Brush
                  dataKey="t"
                  height={28}
                  travellerWidth={8}
                  stroke={chartAxis.cursor}
                  fill="var(--sds-color-background-default-secondary)"
                  tickFormatter={formatTime}
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </figure>
  )
}
