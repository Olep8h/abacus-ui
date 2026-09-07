export interface Transaction {
  id: string
  date: number
  counterparty: string
  category: "Payroll" | "Software" | "Travel" | "Marketing" | "Fees" | "Revenue"
  status: "settled" | "pending" | "review" | "failed"
  amount: number
}

const COUNTERPARTIES = [
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
]
const CATEGORIES: Transaction["category"][] = [
  "Payroll",
  "Software",
  "Travel",
  "Marketing",
  "Fees",
  "Revenue",
]
const STATUSES: Transaction["status"][] = [
  "settled",
  "settled",
  "settled",
  "pending",
  "review",
  "failed",
]

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

export function sampleTransactions(count = 120, seed = 42): Transaction[] {
  const rand = mulberry32(seed)
  const start = Date.UTC(2026, 6, 1)
  return Array.from({ length: count }, (_, i) => {
    const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)] ?? "Fees"
    const magnitude = Math.round((50 + rand() * 12000) * 100) / 100
    return {
      id: `txn_${(1000 + i).toString(36)}`,
      date: start + Math.floor(rand() * 68) * 86_400_000 + Math.floor(rand() * 86_400_000),
      counterparty: COUNTERPARTIES[Math.floor(rand() * COUNTERPARTIES.length)] ?? "Unknown",
      category,
      status: STATUSES[Math.floor(rand() * STATUSES.length)] ?? "settled",
      amount: category === "Revenue" ? magnitude : -magnitude,
    }
  })
}
