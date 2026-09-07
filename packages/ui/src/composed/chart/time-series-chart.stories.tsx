import type { Meta, StoryObj } from "@storybook/react-vite"

import { formatCompact } from "../../lib/format"
import { mulberry32 } from "../data-table/data-table.sample"
import { TimeSeriesChart, type TimeSeriesPoint } from "./time-series-chart"

function series(days = 90, seed = 7): TimeSeriesPoint[] {
  const rand = mulberry32(seed)
  const start = Date.UTC(2026, 5, 10)
  let inflow = 12_400
  let outflow = 9_800
  return Array.from({ length: days }, (_, i) => {
    inflow = Math.max(2000, inflow + (rand() - 0.45) * 1400)
    outflow = Math.max(1500, outflow + (rand() - 0.5) * 1100)
    return { t: start + i * 86_400_000, inflow: Math.round(inflow), outflow: Math.round(outflow) }
  })
}

const data = series()
const SERIES = [
  { key: "inflow", label: "Inflow" },
  { key: "outflow", label: "Outflow" },
]

const meta = {
  title: "Composed/TimeSeriesChart",
  component: TimeSeriesChart,
  parameters: { layout: "padded" },
  args: {
    data,
    series: SERIES,
    summary:
      "Daily inflow and outflow from 10 June to 7 September 2026. Inflow rises from about 12.4K to 18K with a dip in late July; outflow stays between 8K and 11K.",
    formatValue: (v: number) => `€${formatCompact(v)}`,
    brush: true,
    height: 240,
    loading: false,
  },
  argTypes: {
    data: { control: false },
    series: { control: false },
    formatValue: { control: false },
    formatTime: { control: false },
  },
} satisfies Meta<typeof TimeSeriesChart>

export default meta
type Story = StoryObj<typeof meta>

/** Two series, tokenised colours, a brush to zoom. Focus the chart and use arrow keys for the tooltip. */
export const Default: Story = {}

export const SingleSeries: Story = { args: { series: [SERIES[0]!], brush: false } }

export const Loading: Story = { args: { loading: true } }

export const Empty: Story = { args: { data: [] } }

export const Playground: Story = {}
