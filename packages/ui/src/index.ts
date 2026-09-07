/**
 * @abacus/ui — public surface.
 *
 * Everything a consumer may import is listed here explicitly. Nothing else in `src/` is
 * part of the contract, so internals can move without a breaking change.
 */

export { Button, buttonVariants, type ButtonProps } from "./primitives/button/button"
export { Badge, badgeVariants, type BadgeProps } from "./primitives/badge/badge"
export { Input, inputVariants, type InputProps } from "./primitives/input/input"
export { Field, type FieldProps } from "./primitives/field/field"
export { useFieldContext, type FieldContextValue } from "./primitives/field/field-context"
export { Label, type LabelProps } from "./primitives/label/label"
export { Skeleton, type SkeletonProps } from "./primitives/skeleton/skeleton"
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  type DialogCloseProps,
  type DialogContentProps,
  type DialogDescriptionProps,
  type DialogFooterProps,
  type DialogProps,
  type DialogTitleProps,
  type DialogTriggerProps,
} from "./primitives/dialog/dialog"
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
  type SelectContentProps,
  type SelectGroupProps,
  type SelectItemProps,
  type SelectLabelProps,
  type SelectProps,
  type SelectSeparatorProps,
  type SelectTriggerProps,
  type SelectValueProps,
} from "./primitives/select/select"
export {
  Tooltip,
  TooltipProvider,
  type TooltipProps,
  type TooltipProviderProps,
} from "./primitives/tooltip/tooltip"

export {
  DataTable,
  createDataTableColumns,
  dataTableFeatures,
  type DataTableColumn,
  type DataTableFeatures,
  type DataTableProps,
  type DataTableStatus,
} from "./composed/data-table/data-table"
export type { SortingState } from "@tanstack/react-table"
export { StatCard, type StatCardProps } from "./composed/stat-card/stat-card"
export { Sparkline, type SparklineProps } from "./composed/stat-card/sparkline"
export {
  TimeSeriesChart,
  type TimeSeriesChartProps,
  type TimeSeriesPoint,
  type TimeSeriesSeries,
} from "./composed/chart/time-series-chart"
export { chartSeries, seriesColor } from "./composed/chart/chart-theme"

export { cn } from "./lib/cn"
export { formatCompact, formatCurrency, formatPercentDelta } from "./lib/format"
