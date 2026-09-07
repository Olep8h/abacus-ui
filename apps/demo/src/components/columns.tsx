import { Badge, createDataTableColumns, formatCurrency } from "@abacus/ui"

import type { Transaction, TransactionStatus } from "@/mock/transactions"

export const STATUS_META: Record<
  TransactionStatus,
  { intent: "positive" | "neutral" | "warning" | "danger"; label: string }
> = {
  settled: { intent: "positive", label: "Settled" },
  pending: { intent: "neutral", label: "Pending" },
  review: { intent: "warning", label: "Needs review" },
  failed: { intent: "danger", label: "Failed" },
}

const formatDate = (t: number) =>
  new Date(t).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })

const col = createDataTableColumns<Transaction>()

export const transactionColumns = col.columns([
  col.accessor("date", { header: "Date", cell: (c) => formatDate(c.getValue()), sortFn: "basic" }),
  col.accessor("counterparty", { header: "Counterparty", sortFn: "alphanumeric" }),
  col.accessor("reference", {
    header: "Reference",
    enableSorting: false,
    cell: (c) => <span className="font-mono text-xs">{c.getValue()}</span>,
  }),
  col.accessor("category", {
    header: "Category",
    sortFn: "alphanumeric",
    cell: (c) => (
      <Badge intent="neutral" icon={false}>
        {c.getValue()}
      </Badge>
    ),
  }),
  col.accessor("status", {
    header: "Status",
    sortFn: "alphanumeric",
    cell: (c) => (
      <Badge intent={STATUS_META[c.getValue()].intent}>{STATUS_META[c.getValue()].label}</Badge>
    ),
  }),
  col.accessor("amount", {
    header: "Amount",
    sortFn: "basic",
    meta: { align: "end" },
    cell: (c) => (
      <span className={c.getValue() < 0 ? "text-fg" : "text-fg-positive"}>
        {formatCurrency(c.getValue())}
      </span>
    ),
  }),
])

export const getTransactionId = (row: Transaction) => row.id
