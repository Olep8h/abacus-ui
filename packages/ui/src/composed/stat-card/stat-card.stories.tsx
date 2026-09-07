import type { Meta, StoryObj } from "@storybook/react-vite"

import { formatCurrency } from "../../lib/format"
import { StatCard } from "./stat-card"

const THEMES = ["light", "dark"] as const
const spark = [12.1, 12.8, 12.4, 13.9, 14.2, 13.8, 15.1, 16.0, 15.6, 17.2, 18.1]
const sparkDown = [...spark].reverse()

const meta = {
  title: "Composed/StatCard",
  component: StatCard,
  parameters: { layout: "padded" },
  args: {
    label: "Net inflow",
    value: 18_120.5,
    format: (v: number) => formatCurrency(v),
    delta: 0.042,
    deltaLabel: "vs last 30 days",
    sparkline: spark,
    loading: false,
  },
  argTypes: { format: { control: false }, sparkline: { control: false } },
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

/** Counts up once on mount. Reload the story to see it; re-renders do not replay it. */
export const Default: Story = {
  render: (args) => (
    <div className="w-4000 sm:w-xs">
      <StatCard {...args} />
    </div>
  ),
}

/** A falling number that is good news: `invertTrend` flips the colour, not the arrow. */
export const InvertedTrend: Story = {
  args: {
    label: "Failed payments",
    value: 14,
    format: (v: number) => Math.round(v).toString(),
    delta: -0.18,
    sparkline: sparkDown,
    invertTrend: true,
  },
  render: (args) => (
    <div className="w-4000 sm:w-xs">
      <StatCard {...args} />
    </div>
  ),
}

/** Same footprint while loading, so the grid does not shift. */
export const Loading: Story = {
  args: { loading: true },
  render: (args) => (
    <div className="w-4000 sm:w-xs">
      <StatCard {...args} />
    </div>
  ),
}

/** trend × loading in both themes. */
export const Matrix: Story = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-800">
      {THEMES.map((theme) => (
        <section
          key={theme}
          data-theme={theme}
          className="flex flex-col gap-400 bg-surface p-600 text-fg"
        >
          <h2 className="text-lg font-semibold capitalize">{theme}</h2>
          <div className="grid grid-cols-1 gap-300 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Net inflow"
              value={18120.5}
              format={(v) => formatCurrency(v)}
              delta={0.042}
              sparkline={spark}
            />
            <StatCard
              label="Card spend"
              value={42310.2}
              format={(v) => formatCurrency(v)}
              delta={-0.031}
              sparkline={sparkDown}
            />
            <StatCard
              label="Failed payments"
              value={14}
              format={(v) => Math.round(v).toString()}
              delta={-0.18}
              sparkline={sparkDown}
              invertTrend
            />
            <StatCard
              label="Active cards"
              value={1284}
              format={(v) => Math.round(v).toLocaleString("en-GB")}
              delta={0}
            />
            <StatCard label="Net inflow" value={0} loading />
            <StatCard label="Card spend" value={0} loading />
            <StatCard label="No delta" value={9_400} format={(v) => formatCurrency(v)} />
            <StatCard
              label="No sparkline"
              value={0.62}
              format={(v) => `${(v * 100).toFixed(0)}%`}
              delta={0.012}
            />
          </div>
        </section>
      ))}
    </div>
  ),
}

export const Playground: Story = {
  render: (args) => (
    <div className="w-4000 sm:w-xs">
      <StatCard {...args} />
    </div>
  ),
}
