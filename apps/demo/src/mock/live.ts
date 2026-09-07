import {
  CATEGORIES,
  COUNTERPARTIES,
  DAY,
  mulberry32,
  NOW,
  type Transaction,
  type TransactionStatus,
} from "./transactions"

export interface Tick {
  at: number
  updated: Transaction[]
  inserted?: Transaction
}

const NEXT: Record<TransactionStatus, TransactionStatus> = {
  pending: "settled",
  review: "settled",
  settled: "settled",
  failed: "failed",
}

export function createTicker(rows: readonly Transaction[], seed = 99) {
  const rand = mulberry32(seed)
  let clock = NOW
  let serial = 0
  return function nextTick(): Tick {
    clock += 250 + Math.floor(rand() * 500)
    const updated: Transaction[] = []
    const candidates = rows.filter((r) => r.status === "pending" || r.status === "review")
    const flips = 1 + Math.floor(rand() * 2)
    for (let i = 0; i < flips && candidates.length; i++) {
      const row = candidates[Math.floor(rand() * candidates.length)]
      if (row) updated.push({ ...row, status: rand() < 0.9 ? NEXT[row.status] : "failed" })
    }
    const amountTweak = rows[Math.floor(rand() * Math.min(rows.length, 60))]
    if (amountTweak && rand() < 0.5) {
      const delta = Math.round((rand() - 0.5) * 400 * 100) / 100
      updated.push({ ...amountTweak, amount: Math.round((amountTweak.amount + delta) * 100) / 100 })
    }
    let inserted: Transaction | undefined
    if (rand() < 0.35) {
      const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)] ?? "Fees"
      const magnitude = Math.round((60 + rand() * 4200) * 100) / 100
      inserted = {
        id: `live_${(serial++).toString(36)}`,
        date: clock,
        counterparty: COUNTERPARTIES[Math.floor(rand() * COUNTERPARTIES.length)] ?? "Unknown",
        reference: `INV-${3300 + serial}`,
        category,
        status: "pending",
        amount: category === "Revenue" || rand() < 0.3 ? magnitude : -magnitude,
      }
    }
    return { at: clock, updated, inserted }
  }
}

export function applyTick(rows: readonly Transaction[], tick: Tick): Transaction[] {
  const byId = new Map(tick.updated.map((r) => [r.id, r]))
  const next = rows.map((r) => byId.get(r.id) ?? r)
  if (tick.inserted) next.unshift(tick.inserted)
  return next
}

export const RANGE_DAYS = { "30d": 30, "60d": 60, "90d": 90 } as const
export type RangeKey = keyof typeof RANGE_DAYS

export function rangeStart(range: RangeKey, now = NOW): number {
  return now - RANGE_DAYS[range] * DAY
}
