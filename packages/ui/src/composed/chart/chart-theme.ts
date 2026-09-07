/** Token variables for SVG props that cannot take utility classes. */
export const chartSeries = [
  "var(--sds-color-background-brand-default)",
  "var(--sds-color-background-positive-default)",
  "var(--sds-color-background-warning-default)",
  "var(--sds-color-background-danger-default)",
  "var(--sds-color-background-neutral-default)",
] as const

export const chartAxis = {
  grid: "var(--sds-color-border-default-default)",
  tick: "var(--sds-color-text-default-secondary)",
  cursor: "var(--sds-color-border-default-secondary)",
} as const

export function seriesColor(index: number): string {
  return chartSeries[index % chartSeries.length] ?? chartSeries[0]
}
