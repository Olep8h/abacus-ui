import type { Meta, StoryObj } from "@storybook/react-vite"
import { Info, RefreshCw } from "lucide-react"

import { Button } from "../button/button"
import { Tooltip } from "./tooltip"

const SIDES = ["top", "right", "bottom", "left"] as const
const THEMES = ["light", "dark"] as const

const meta = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  args: {
    content: "Refreshes balances from the ledger",
    side: "top",
    align: "center",
    children: (
      <Button variant="secondary" size="icon" aria-label="Refresh balances">
        <RefreshCw />
      </Button>
    ),
  },
  argTypes: {
    side: { control: "select", options: SIDES },
    align: { control: "select", options: ["start", "center", "end"] },
    children: { control: false },
    open: { control: "boolean" },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

/** Hover or focus the trigger. The icon button keeps its own `aria-label`; the tooltip adds detail. */
export const Default: Story = {}

/** Every side, forced open, in both themes. */
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
          <div className="flex flex-wrap gap-2400 px-1600 py-1200">
            {SIDES.map((side) => (
              <Tooltip key={side} open side={side} content={`Opens to the ${side}`}>
                <Button variant="secondary">{side}</Button>
              </Tooltip>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
}

/** Explaining a metric: the trigger is a real button, so keyboard users can reach it. */
export const OnText: Story = {
  render: (args) => (
    <p className="flex items-center gap-100 text-sm text-fg-secondary">
      Net revenue retention
      <Tooltip
        {...args}
        content="Revenue from existing customers this period ÷ the same customers' revenue last period."
      >
        <button
          type="button"
          aria-label="What is net revenue retention?"
          className="rounded-full text-icon-secondary outline-none focus-visible:focus-ring"
        >
          <Info className="size-400" />
        </button>
      </Tooltip>
    </p>
  ),
}
