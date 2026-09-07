import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge } from "./badge"

const INTENTS = ["neutral", "brand", "positive", "warning", "danger"] as const
const VARIANTS = ["subtle", "solid"] as const
const SIZES = ["sm", "md"] as const
const THEMES = ["light", "dark"] as const
const LABEL: Record<(typeof INTENTS)[number], string> = {
  neutral: "Pending",
  brand: "Scheduled",
  positive: "Settled",
  warning: "Review",
  danger: "Failed",
}

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  args: { children: "Settled", intent: "positive", variant: "subtle", size: "sm", icon: true },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    variant: { control: "select", options: VARIANTS },
    size: { control: "select", options: SIZES },
    icon: { control: "boolean" },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** intent × variant × size × icon, both themes. Note the glyph differs per intent. */
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
          <table className="border-separate border-spacing-0 text-xs">
            <thead>
              <tr>
                <th scope="col" className="sr-only">
                  Intent
                </th>
                {VARIANTS.flatMap((variant) =>
                  SIZES.flatMap((size) =>
                    [true, false].map((icon) => (
                      <th
                        key={`${variant}-${size}-${icon}`}
                        scope="col"
                        className="px-300 pb-200 text-left font-normal text-fg-secondary"
                      >
                        {variant} · {size} · {icon ? "icon" : "no icon"}
                      </th>
                    )),
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {INTENTS.map((intent) => (
                <tr key={intent}>
                  <th
                    scope="row"
                    className="pr-300 text-left font-normal text-fg-secondary capitalize"
                  >
                    {intent}
                  </th>
                  {VARIANTS.flatMap((variant) =>
                    SIZES.flatMap((size) =>
                      [true, false].map((icon) => (
                        <td key={`${variant}-${size}-${icon}`} className="px-300 py-100">
                          <Badge intent={intent} variant={variant} size={size} icon={icon}>
                            {LABEL[intent]}
                          </Badge>
                        </td>
                      )),
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  ),
}

export const Playground: Story = {}
