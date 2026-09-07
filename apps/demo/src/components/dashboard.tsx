"use client"

import {
  Button,
  DataTable,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  TimeSeriesChart,
  formatCompact,
  formatCurrency,
  type SortingState,
} from "@abacus/ui"
import { Activity, RefreshCw, Search } from "lucide-react"
import Link from "next/link"
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"
import { memo, useMemo, useState } from "react"

import { deriveDailySeries, deriveStats, describeSeries, filterTransactions } from "@/mock/derive"
import { RANGE_DAYS, type RangeKey } from "@/mock/live"
import { CATEGORIES, STATUSES } from "@/mock/transactions"

import { getTransactionId, STATUS_META, transactionColumns } from "./columns"
import { ExportDialog } from "./export-dialog"
import { ThemeToggle } from "./theme-toggle"
import { useLiveFeed } from "./use-live-feed"

type Scene = "data" | "loading" | "empty" | "error"
const SCENE_LABEL: Record<Scene, string> = {
  data: "Show data",
  loading: "Show loading",
  empty: "Show empty",
  error: "Show error",
}

const filterParsers = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(["all", ...STATUSES] as const).withDefault("all"),
  category: parseAsStringLiteral(["all", ...CATEGORIES] as const).withDefault("all"),
  range: parseAsStringLiteral(Object.keys(RANGE_DAYS) as RangeKey[]).withDefault("30d"),
  sort: parseAsString.withDefault("date:desc"),
}

const SERIES = [
  { key: "inflow", label: "Inflow" },
  { key: "outflow", label: "Outflow" },
]
const formatEur = (v: number) => `€${formatCompact(v)}`
const Chart = memo(TimeSeriesChart)

function parseSort(value: string): SortingState {
  const [id, dir] = value.split(":")
  return id ? [{ id, desc: dir !== "asc" }] : []
}

export function Dashboard() {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: "replace",
    throttleMs: 200,
  })
  const [live, setLive] = useState(false)
  const [scene, setScene] = useState<Scene>("data")
  const { rows, tickCount } = useLiveFeed(live)

  const { q, status, category, range, sort } = filters
  const scoped = useMemo(
    () => filterTransactions(rows, { q, status, category, range }, undefined, { withRange: false }),
    [rows, q, status, category, range],
  )
  const visible = useMemo(
    () => filterTransactions(scoped, { q, status, category, range }),
    [scoped, q, status, category, range],
  )
  const stats = useMemo(() => deriveStats(scoped, range), [scoped, range])
  const daily = useMemo(() => deriveDailySeries(visible, range), [visible, range])
  const summary = useMemo(() => describeSeries(daily, range), [daily, range])
  const sorting = useMemo(() => parseSort(sort), [sort])
  const chartData = useMemo(() => (scene === "empty" ? [] : daily), [scene, daily])

  const tableData = scene === "empty" ? [] : visible
  const loading = scene === "loading"

  return (
    <div className="flex flex-col gap-600">
      <header className="flex flex-wrap items-start justify-between gap-400">
        <div>
          <h1 className="text-2xl font-bold">Abacus Analytics</h1>
          <p className="text-sm text-fg-secondary">
            Treasury view · EUR · mock ledger of {rows.length.toLocaleString("en-GB")} transactions.{" "}
            <Link
              href="/overview"
              className="text-fg-brand underline underline-offset-4 hover:text-fg"
            >
              See the overview
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-300">
          <Button
            variant={live ? "primary" : "secondary"}
            aria-pressed={live}
            onClick={() => setLive((v) => !v)}
            className="min-w-control-lg"
          >
            <Activity className={live ? "animate-pulse motion-reduce:animate-none" : undefined} />
            {live ? `Live · ${tickCount} ticks` : "Live"}
          </Button>
          <Select value={scene} onValueChange={(v) => setScene(v as Scene)}>
            <SelectTrigger aria-label="Show state" className="w-auto">
              <SelectValue>{SCENE_LABEL[scene]}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="data">Show data</SelectItem>
              <SelectItem value="loading">Show loading</SelectItem>
              <SelectItem value="empty">Show empty</SelectItem>
              <SelectItem value="error">Show error</SelectItem>
            </SelectContent>
          </Select>
          <ExportDialog rowCount={visible.length} />
          <ThemeToggle />
        </div>
      </header>

      <section aria-labelledby="stats-heading" className="flex flex-col gap-300">
        <h2 id="stats-heading" className="sr-only">
          Key figures
        </h2>
        <div className="grid grid-cols-1 gap-300 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Net inflow"
            value={stats.net.value}
            format={(v) => formatCurrency(v, "EUR", 0)}
            delta={stats.net.delta}
            deltaLabel={`vs previous ${RANGE_DAYS[filters.range]} days`}
            sparkline={stats.net.sparkline}
            loading={loading}
          />
          <StatCard
            label="Outgoing spend"
            value={stats.spend.value}
            format={(v) => formatCurrency(v, "EUR", 0)}
            delta={stats.spend.delta}
            deltaLabel={`vs previous ${RANGE_DAYS[filters.range]} days`}
            sparkline={stats.spend.sparkline}
            invertTrend
            loading={loading}
          />
          <StatCard
            label="Failed payments"
            value={stats.failed.value}
            format={(v) => Math.round(v).toString()}
            delta={stats.failed.delta}
            deltaLabel={`vs previous ${RANGE_DAYS[filters.range]} days`}
            sparkline={stats.failed.sparkline}
            invertTrend
            loading={loading}
          />
          <StatCard
            label="Active counterparties"
            value={stats.counterparties.value}
            format={(v) => Math.round(v).toString()}
            delta={stats.counterparties.delta}
            deltaLabel={`vs previous ${RANGE_DAYS[filters.range]} days`}
            loading={loading}
          />
        </div>
      </section>

      <section
        aria-labelledby="flow-heading"
        className="rounded-md border border-line bg-surface p-400"
      >
        <div className="mb-300 flex flex-wrap items-center justify-between gap-300">
          <h2 id="flow-heading" className="text-base font-semibold">
            Daily flow
          </h2>
          <Field label="Range" className="w-auto flex-row items-center gap-200">
            <Select
              value={filters.range}
              onValueChange={(range) => setFilters({ range: range as RangeKey })}
            >
              <SelectTrigger size="sm" className="w-auto">
                <SelectValue>Last {RANGE_DAYS[range]} days</SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {(Object.keys(RANGE_DAYS) as RangeKey[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    Last {RANGE_DAYS[key]} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Chart
          data={chartData}
          series={SERIES}
          summary={summary}
          formatValue={formatEur}
          brush
          loading={loading}
        />
      </section>

      <section aria-labelledby="transactions-heading" className="flex flex-col gap-300">
        <h2 id="transactions-heading" className="text-base font-semibold">
          Transactions
        </h2>
        <DataTable
          columns={transactionColumns}
          data={tableData}
          getRowId={getTransactionId}
          caption="Transactions matching the current filters"
          sorting={sorting}
          onSortingChange={(next) => {
            const first = next[0]
            setFilters({ sort: first ? `${first.id}:${first.desc ? "desc" : "asc"}` : "date:desc" })
          }}
          pageSize={25}
          status={scene === "loading" ? "loading" : scene === "error" ? "error" : "idle"}
          empty="No transactions match these filters."
          error={
            <>
              <span>The ledger did not respond. Your filters are kept in the URL.</span>
              <Button variant="secondary" size="sm" onClick={() => setScene("data")}>
                <RefreshCw />
                Retry
              </Button>
            </>
          }
          toolbar={
            <div className="flex flex-wrap items-end gap-300">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-300 size-400 -translate-y-1/2 text-icon-secondary"
                />
                <Input
                  size="sm"
                  aria-label="Search counterparty or reference"
                  placeholder="Search"
                  className="w-4000 pl-1200"
                  value={filters.q}
                  onChange={(e) => setFilters({ q: e.target.value })}
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(status) => setFilters({ status: status as typeof filters.status })}
              >
                <SelectTrigger size="sm" aria-label="Status" className="w-auto">
                  <SelectValue>
                    {status === "all" ? "All statuses" : STATUS_META[status].label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.category}
                onValueChange={(category) =>
                  setFilters({ category: category as typeof filters.category })
                }
              >
                <SelectTrigger size="sm" aria-label="Category" className="w-auto">
                  <SelectValue>{category === "all" ? "All categories" : category}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.q || filters.status !== "all" || filters.category !== "all" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ q: "", status: "all", category: "all" })}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          }
        />
      </section>
    </div>
  )
}
