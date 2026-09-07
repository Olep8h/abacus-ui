import type { Meta, StoryObj } from "@storybook/react-vite"

import { Field } from "../field/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select"

const CURRENCIES = [
  { value: "eur", label: "Euro (EUR)" },
  { value: "usd", label: "US Dollar (USD)" },
  { value: "gbp", label: "Pound Sterling (GBP)" },
  { value: "chf", label: "Swiss Franc (CHF)" },
  { value: "pln", label: "Polish Złoty (PLN)" },
]

const SIZES = ["sm", "md"] as const
const STATES = ["default", "hover", "focus-visible", "selected", "invalid", "disabled"] as const
const THEMES = ["light", "dark"] as const

const meta = {
  title: "Primitives/Select",
  component: Select,
  parameters: { layout: "centered" },
  argTypes: { onValueChange: { control: false }, value: { control: false } },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

function CurrencySelect({
  size = "md",
  ...state
}: {
  size?: "sm" | "md"
  className?: string
  invalid?: boolean
  disabled?: boolean
  defaultValue?: string
  "aria-label"?: string
}) {
  const { className, invalid, disabled, defaultValue, ...rest } = state
  return (
    <Select defaultValue={defaultValue} disabled={disabled}>
      <SelectTrigger size={size} className={className} invalid={invalid} {...rest}>
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Open it with the keyboard: `ArrowDown`, type "p" to jump, `Enter` to pick, `Escape` to leave. */
export const Default: Story = {
  render: () => (
    <div className="w-xs">
      <CurrencySelect aria-label="Currency" />
    </div>
  ),
}

/** size × state, both themes. Interaction states are forced by the pseudo-states addon. */
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
          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  <th scope="col" className="sr-only">
                    Size
                  </th>
                  {STATES.map((state) => (
                    <th
                      key={state}
                      scope="col"
                      className="px-300 pb-200 text-left font-normal text-fg-secondary"
                    >
                      {state}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZES.map((size) => (
                  <tr key={size}>
                    <th scope="row" className="pr-300 text-left font-normal text-fg-secondary">
                      {size}
                    </th>
                    {STATES.map((state) => (
                      <td key={state} className="px-300 py-100">
                        <div className="w-xs">
                          <CurrencySelect
                            size={size}
                            aria-label={`${size} ${state}`}
                            className={
                              state === "hover"
                                ? "pseudo-hover"
                                : state === "focus-visible"
                                  ? "pseudo-focus-visible"
                                  : undefined
                            }
                            defaultValue={
                              state === "selected" || state === "invalid" ? "eur" : undefined
                            }
                            invalid={state === "invalid"}
                            disabled={state === "disabled"}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  ),
}

/** Groups, labels and a separator. */
export const Grouped: Story = {
  render: () => (
    <div className="w-xs">
      <Select defaultValue="eur">
        <SelectTrigger aria-label="Settlement currency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Eurozone</SelectLabel>
            <SelectItem value="eur">Euro (EUR)</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Other</SelectLabel>
            <SelectItem value="usd">US Dollar (USD)</SelectItem>
            <SelectItem value="gbp">Pound Sterling (GBP)</SelectItem>
            <SelectItem value="chf" disabled>
              Swiss Franc (CHF) — not enabled
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

/** Inside a `Field`: label, description, error and `aria-*` wiring come for free. */
export const InField: Story = {
  name: "In a Field",
  render: () => (
    <div className="flex w-xs flex-col gap-600">
      <Field label="Settlement currency" description="Payouts convert into this currency.">
        <CurrencySelect />
      </Field>
      <Field label="Reporting currency" required error="Choose a currency to continue.">
        <CurrencySelect />
      </Field>
    </div>
  ),
}
