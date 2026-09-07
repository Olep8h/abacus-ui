"use client"

import type { CellData, TableFeatures } from "@tanstack/table-core"
import {
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnVisibilityState,
  type PaginationState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Settings2 } from "lucide-react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { useMemo, useState, type ComponentProps, type ReactNode } from "react"

import { cn } from "../../lib/cn"
import { Button } from "../../primitives/button/button"
import { Skeleton } from "../../primitives/skeleton/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../primitives/select/select"
import { Tooltip } from "../../primitives/tooltip/tooltip"

/* eslint-disable @typescript-eslint/no-unused-vars */
declare module "@tanstack/table-core" {
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /** Horizontal alignment of header and cells; numbers go `end`. */
    align?: "start" | "end"
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/** Feature set of the table; only what is registered here exists on the instance. */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime },
})

export type DataTableFeatures = typeof dataTableFeatures

/** Typed column helper bound to this table's feature set. */
export function createDataTableColumns<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

/** Column definition type consumers write against. */
export type DataTableColumn<TData extends RowData, TValue = unknown> = ColumnDef<
  DataTableFeatures,
  TData,
  TValue
>

export type DataTableStatus = "idle" | "loading" | "error"

export interface DataTableProps<TData extends RowData> extends Omit<
  ComponentProps<"div">,
  "children"
> {
  /** Column definitions, built with `createDataTableColumns<T>()`. Keep the reference stable. */
  columns: readonly DataTableColumn<TData, unknown>[]
  /** Row data. Keep the reference stable between renders unless it changed. */
  data: readonly TData[]
  /** Stable row identity: needed for layout animation and for live updates to land in place. */
  getRowId: (row: TData) => string
  /** Controlled sorting (pass with `onSortingChange`) or leave both out for internal state. */
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  /** Page size; the table paginates internally so layout animations touch one page at a time. */
  pageSize?: number
  /** `loading` shows skeleton rows, `error` shows the error slot. Both keep the header. */
  status?: DataTableStatus
  /** Rendered when `data` is empty and status is `idle`. */
  empty?: ReactNode
  /** Rendered when status is `error`. Put the retry button here. */
  error?: ReactNode
  /** Visible caption for the table; also its accessible name. */
  caption: ReactNode
  /** Column ids that stay pinned on the left when the table scrolls horizontally. */
  stickyFirstColumn?: boolean
  /** Toolbar content rendered left of the column-visibility control. */
  toolbar?: ReactNode
}

const rowMotion = {
  layout: "position" as const,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/** Sortable, paginated table with column visibility and loading / empty / error states. Rows keyed by `getRowId` animate into place on re-sort. */
export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  sorting: controlledSorting,
  onSortingChange,
  pageSize = 25,
  status = "idle",
  empty = "Nothing to show.",
  error = "Something went wrong.",
  caption,
  stickyFirstColumn = true,
  toolbar,
  className,
  ...props
}: DataTableProps<TData>) {
  const reduceMotion = useReducedMotion()
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize })
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({})
  const sorting = controlledSorting ?? internalSorting

  const table = useTable({
    features: dataTableFeatures,
    columns: columns as ColumnDef<DataTableFeatures, TData, unknown>[],
    data: data as TData[],
    getRowId,
    state: { sorting, pagination, columnVisibility },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      if (controlledSorting === undefined) setInternalSorting(next)
      onSortingChange?.(next)
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    },
    onPaginationChange: (updater) =>
      setPagination((p) => (typeof updater === "function" ? updater(p) : updater)),
    onColumnVisibilityChange: (updater) =>
      setColumnVisibility((v) => (typeof updater === "function" ? updater(v) : updater)),
  })

  const rows = table.getRowModel().rows
  const pageCount = table.getPageCount()
  const visibleColumns = table.getVisibleLeafColumns()
  const hideable = useMemo(() => table.getAllLeafColumns().filter((c) => c.getCanHide()), [table])

  return (
    <div
      data-slot="data-table"
      className={cn("flex min-w-0 flex-col gap-300", className)}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-300">
        {toolbar}
        <div className="ml-auto">
          <Select
            value=""
            onValueChange={(id) => {
              const column = table.getColumn(id)
              column?.toggleVisibility()
            }}
          >
            <Tooltip content="Show or hide columns">
              <SelectTrigger size="sm" aria-label="Columns" className="w-auto gap-100">
                <Settings2 aria-hidden="true" />
                <SelectValue placeholder="Columns" />
              </SelectTrigger>
            </Tooltip>
            <SelectContent align="end">
              {hideable.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  <span className="flex items-center gap-200">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-200 rounded-full",
                        column.getIsVisible() ? "bg-brand" : "bg-line",
                      )}
                    />
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                    <span className="sr-only">
                      {column.getIsVisible() ? " (shown)" : " (hidden)"}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-max border-separate border-spacing-0 text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header, i) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const align = (
                    header.column.columnDef.meta as { align?: "start" | "end" } | undefined
                  )?.align
                  const SortIcon =
                    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : canSort
                              ? "none"
                              : undefined
                      }
                      className={cn(
                        "border-b border-line bg-surface-secondary px-300 py-200 text-left text-xs font-medium whitespace-nowrap text-fg",
                        align === "end" && "text-right",
                        stickyFirstColumn && i === 0 && "sticky left-0 z-10 border-r",
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "-mx-200 inline-flex items-center gap-100 rounded-sm px-200 py-100 outline-none hover:text-fg-brand focus-visible:focus-ring",
                            align === "end" && "flex-row-reverse",
                          )}
                        >
                          <table.FlexRender header={header} />
                          <SortIcon
                            aria-hidden="true"
                            className={cn("size-300", !sorted && "text-icon-secondary")}
                          />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody aria-busy={status === "loading" || undefined}>
            {status === "loading" ? (
              Array.from({ length: Math.min(pageSize, 8) }, (_, r) => (
                <tr key={`skeleton-${r}`}>
                  {visibleColumns.map((column, i) => (
                    <td
                      key={column.id}
                      className={cn(
                        "border-b border-line px-300 py-200",
                        stickyFirstColumn && i === 0 && "sticky left-0 z-10 border-r bg-surface",
                      )}
                    >
                      <Skeleton className="h-400 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : status === "error" ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-300 py-1200 text-center text-fg-secondary"
                >
                  <div role="alert" className="flex flex-col items-center gap-300">
                    {error}
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-300 py-1200 text-center text-fg-secondary"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              <LayoutGroup id="data-table-rows">
                <AnimatePresence initial={false} mode="popLayout">
                  {rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      {...(reduceMotion ? {} : rowMotion)}
                      transition={
                        reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }
                      }
                      className="group/row hover:bg-surface-hover"
                    >
                      {row.getVisibleCells().map((cell, i) => {
                        const align = (
                          cell.column.columnDef.meta as { align?: "start" | "end" } | undefined
                        )?.align
                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              "border-b border-line px-300 py-200 whitespace-nowrap tabular-nums",
                              align === "end" && "text-right",
                              stickyFirstColumn &&
                                i === 0 &&
                                "sticky left-0 z-10 border-r bg-surface group-hover/row:bg-surface-hover",
                            )}
                          >
                            <table.FlexRender cell={cell} />
                          </td>
                        )
                      })}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </LayoutGroup>
            )}
          </tbody>
        </table>
      </div>

      {status === "idle" && rows.length > 0 ? (
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center justify-between gap-300 text-sm text-fg-secondary"
        >
          <p aria-live="polite">
            Page {pagination.pageIndex + 1} of {pageCount} ·{" "}
            {table.getRowCount().toLocaleString("en-GB")} rows
          </p>
          <div className="flex items-center gap-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  )
}
