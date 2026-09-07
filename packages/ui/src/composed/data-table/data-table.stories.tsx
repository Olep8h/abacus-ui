import type { Meta, StoryObj } from "@storybook/react-vite"
import { RefreshCw } from "lucide-react"

import { formatCurrency } from "../../lib/format"
import { Badge } from "../../primitives/badge/badge"
import { Button } from "../../primitives/button/button"
import { DataTable, createDataTableColumns } from "./data-table"
import { sampleTransactions, type Transaction } from "./data-table.sample"

const STATUS: Record<
  Transaction["status"],
  { intent: "positive" | "neutral" | "warning" | "danger"; label: string }
> = {
  settled: { intent: "positive", label: "Settled" },
  pending: { intent: "neutral", label: "Pending" },
  review: { intent: "warning", label: "Needs review" },
  failed: { intent: "danger", label: "Failed" },
}

const formatDate = (t: number) =>
  new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

const col = createDataTableColumns<Transaction>()
const columns = col.columns([
  col.accessor("date", { header: "Date", cell: (c) => formatDate(c.getValue()), sortFn: "basic" }),
  col.accessor("counterparty", { header: "Counterparty", sortFn: "alphanumeric" }),
  col.accessor("category", {
    header: "Category",
    cell: (c) => (
      <Badge intent="neutral" icon={false}>
        {c.getValue()}
      </Badge>
    ),
  }),
  col.accessor("status", {
    header: "Status",
    cell: (c) => <Badge intent={STATUS[c.getValue()].intent}>{STATUS[c.getValue()].label}</Badge>,
  }),
  col.accessor("amount", {
    header: "Amount",
    cell: (c) => (
      <span className={c.getValue() < 0 ? "text-fg" : "text-fg-positive"}>
        {formatCurrency(c.getValue())}
      </span>
    ),
    sortFn: "basic",
    meta: { align: "end" },
  }),
])

const data = sampleTransactions(120)
const getRowId = (row: Transaction) => row.id

const meta = {
  title: "Composed/DataTable",
  component: DataTable,
  parameters: { layout: "padded" },
  args: {
    columns,
    data,
    getRowId,
    caption: "Transactions, July to September 2026",
    pageSize: 10,
    status: "idle",
  },
  argTypes: {
    status: { control: "select", options: ["idle", "loading", "error"] },
    columns: { control: false },
    data: { control: false },
    getRowId: { control: false },
    sorting: { control: false },
    onSortingChange: { control: false },
  },
} satisfies Meta<typeof DataTable<Transaction>>

export default meta
type Story = StoryObj<typeof meta>

/** Click a header to sort; rows move to their new place with a transform-only layout animation. */
export const Default: Story = {}

/** Skeleton rows under the real header, so the layout does not jump when data lands. */
export const Loading: Story = { args: { status: "loading" } }

/** Empty is a state, not an absence: it says what would fill it. */
export const Empty: Story = {
  args: { data: [], empty: "No transactions match these filters." },
}

/** Errors keep the table shell and offer the way out. */
export const Error: Story = {
  args: {
    status: "error",
    error: (
      <>
        <span>The ledger did not respond. Your filters are kept.</span>
        <Button variant="secondary" size="sm">
          <RefreshCw />
          Retry
        </Button>
      </>
    ),
  },
}

/** At 320px the table scrolls horizontally inside its own box with the first column pinned. */
export const SmallScreen: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  args: { data: data.slice(0, 8), pageSize: 8 },
}

export const Playground: Story = {}
