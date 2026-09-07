import {
  DAY,
  NOW,
  type Transaction,
  type TransactionCategory,
  type TransactionStatus,
} from "./transactions"
import { RANGE_DAYS, rangeStart, type RangeKey } from "./live"

export interface Filters {
  q: string
  status: TransactionStatus | "all"
  category: TransactionCategory | "all"
  range: RangeKey
}

export function filterTransactions(
  rows: readonly Transaction[],
  f: Filters,
  now = NOW,
  { withRange = true } = {},
): Transaction[] {
  const start = withRange ? rangeStart(f.range, now) : -Infinity
  const q = f.q.trim().toLowerCase()
  return rows.filter(
    (r) =>
      r.date >= start &&
      (f.status === "all" || r.status === f.status) &&
      (f.category === "all" || r.category === f.category) &&
      (q === "" ||
        r.counterparty.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q)),
  )
}

export interface Stat {
  value: number
  delta: number | undefined
  sparkline: number[]
}

function windowStats(rows: readonly Transaction[], start: number, end: number) {
  const inWindow = rows.filter((r) => r.date >= start && r.date < end && r.status !== "failed")
  const net = inWindow.reduce((s, r) => s + r.amount, 0)
  const spend = inWindow.filter((r) => r.amount < 0).reduce((s, r) => s - r.amount, 0)
  const failed = rows.filter((r) => r.date >= start && r.date < end && r.status === "failed").length
  const counterparties = new Set(inWindow.map((r) => r.counterparty)).size
  return { net, spend, failed, counterparties }
}

function ratio(current: number, previous: number): number | undefined {
  if (previous === 0 || Math.abs(previous) < Math.abs(current) * 0.05) return undefined
  return (current - previous) / Math.abs(previous)
}

function buckets(
  rows: readonly Transaction[],
  start: number,
  end: number,
  count: number,
  pickValue: (r: Transaction) => number,
): number[] {
  const width = (end - start) / count
  const sums = new Array<number>(count).fill(0)
  for (const r of rows) {
    if (r.date < start || r.date >= end) continue
    const i = Math.min(count - 1, Math.floor((r.date - start) / width))
    sums[i] = (sums[i] ?? 0) + pickValue(r)
  }
  return sums
}

export function deriveStats(rows: readonly Transaction[], range: RangeKey, now = NOW) {
  const days = RANGE_DAYS[range]
  const start = now - days * DAY
  const prevStart = start - days * DAY
  const cur = windowStats(rows, start, now)
  const prev = windowStats(rows, prevStart, start)
  const points = 12
  return {
    net: {
      value: cur.net,
      delta: ratio(cur.net, prev.net),
      sparkline: buckets(rows, start, now, points, (r) => (r.status === "failed" ? 0 : r.amount)),
    },
    spend: {
      value: cur.spend,
      delta: ratio(cur.spend, prev.spend),
      sparkline: buckets(rows, start, now, points, (r) =>
        r.amount < 0 && r.status !== "failed" ? -r.amount : 0,
      ),
    },
    failed: {
      value: cur.failed,
      delta: ratio(cur.failed, prev.failed),
      sparkline: buckets(rows, start, now, points, (r) => (r.status === "failed" ? 1 : 0)),
    },
    counterparties: {
      value: cur.counterparties,
      delta: ratio(cur.counterparties, prev.counterparties),
      sparkline: [],
    },
  } satisfies Record<string, Stat>
}

export interface DailyPoint {
  t: number
  inflow: number
  outflow: number
  [series: string]: number
}

export function deriveDailySeries(
  rows: readonly Transaction[],
  range: RangeKey,
  now = NOW,
): DailyPoint[] {
  const days = RANGE_DAYS[range]
  const start = now - days * DAY
  const series: DailyPoint[] = Array.from({ length: days }, (_, i) => ({
    t: start + i * DAY,
    inflow: 0,
    outflow: 0,
  }))
  for (const r of rows) {
    if (r.date < start || r.date >= now + DAY || r.status === "failed") continue
    const i = Math.min(days - 1, Math.max(0, Math.floor((r.date - start) / DAY)))
    const point = series[i]
    if (!point) continue
    if (r.amount >= 0) point.inflow += r.amount
    else point.outflow -= r.amount
  }
  return series.map((p) => ({ ...p, inflow: Math.round(p.inflow), outflow: Math.round(p.outflow) }))
}

export function describeSeries(points: readonly DailyPoint[], range: RangeKey): string {
  if (points.length === 0) return "No data in the selected range."
  const first = points[0]!
  const last = points[points.length - 1]!
  const peak = points.reduce((best, p) => (p.inflow > best.inflow ? p : best), first)
  const fmt = (t: number) =>
    new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
  const money = (v: number) => `€${Math.round(v / 100) / 10}K`
  return `Daily inflow and outflow over the last ${RANGE_DAYS[range]} days, ${fmt(first.t)} to ${fmt(last.t)}. Inflow moves from ${money(first.inflow)} to ${money(last.inflow)}, peaking at ${money(peak.inflow)} on ${fmt(peak.t)}.`
}
