export type TransactionStatus = "settled" | "pending" | "review" | "failed"
export type TransactionCategory =
  "Payroll" | "Software" | "Travel" | "Marketing" | "Fees" | "Revenue"

export interface Transaction {
  id: string
  date: number
  counterparty: string
  reference: string
  category: TransactionCategory
  status: TransactionStatus
  amount: number
}

export const NOW = Date.UTC(2026, 8, 7, 12, 0, 0)
export const DAY = 86_400_000

export const COUNTERPARTIES = [
  "Nordwind Logistics",
  "Helix Cloud",
  "Marlowe & Co",
  "Aster Payroll",
  "Kestrel Media",
  "Bruma Travel",
  "Quill Software",
  "Solstice Retail",
  "Harbour Insurance",
  "Fennel Foods",
  "Orbit Telecom",
  "Larkspur Studio",
  "Tidewater Freight",
  "Juniper Analytics",
  "Pennywort Legal",
]
export const CATEGORIES: TransactionCategory[] = [
  "Payroll",
  "Software",
  "Travel",
  "Marketing",
  "Fees",
  "Revenue",
]
export const STATUSES: TransactionStatus[] = ["settled", "pending", "review", "failed"]

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T>(rand: () => number, list: readonly T[]): T =>
  list[Math.floor(rand() * list.length)] as T

export function generateTransactions(count = 1000, seed = 2026): Transaction[] {
  const rand = mulberry32(seed)
  const rows: Transaction[] = []
  for (let i = 0; i < count; i++) {
    const roll = rand()
    const category: TransactionCategory =
      roll < 0.42
        ? "Revenue"
        : roll < 0.5
          ? "Payroll"
          : pick(rand, ["Software", "Travel", "Marketing", "Fees"])
    const isRevenue = category === "Revenue"
    const base = isRevenue
      ? 800 + rand() * 14000
      : category === "Payroll"
        ? 3000 + rand() * 9000
        : 40 + rand() * 3500
    const amount = Math.round(base * 100) / 100
    const ageDays = Math.floor(Math.pow(rand(), 1.4) * 120)
    const status: TransactionStatus =
      ageDays < 2
        ? pick(rand, ["pending", "pending", "settled", "review"])
        : rand() < 0.04
          ? "failed"
          : rand() < 0.03
            ? "review"
            : "settled"
    rows.push({
      id: `txn_${(100000 + i).toString(36)}`,
      date: NOW - ageDays * DAY - Math.floor(rand() * DAY),
      counterparty: pick(rand, COUNTERPARTIES),
      reference: `INV-${2400 + Math.floor(rand() * 900)}`,
      category,
      status,
      amount: isRevenue ? amount : -amount,
    })
  }
  return rows.sort((a, b) => b.date - a.date)
}

export const transactions = generateTransactions()
