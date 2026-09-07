import type { Meta, StoryObj } from "@storybook/react-vite"

import { Field } from "../field/field"
import { Input } from "./input"

const SIZES = ["sm", "md"] as const
const STATES = ["default", "hover", "focus-visible", "filled", "invalid", "disabled"] as const
const THEMES = ["light", "dark"] as const

const STATE_PROPS: Record<(typeof STATES)[number], Partial<React.ComponentProps<typeof Input>>> = {
  default: {},
  hover: { className: "pseudo-hover" },
  "focus-visible": { className: "pseudo-focus-visible" },
  filled: { defaultValue: "€ 1,250.00" },
  invalid: { invalid: true, defaultValue: "12,50" },
  disabled: { disabled: true, defaultValue: "Read only" },
}

const meta = {
  title: "Primitives/Input",
  component: Input,
  args: { placeholder: "0.00", size: "md" },
  argTypes: { size: { control: "select", options: SIZES } },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/** Bare input. In real forms wrap it in `Field` so it gets a label and ids. */
export const Default: Story = {
  render: (args) => (
    <div className="w-xs">
      <Input aria-label="Amount" {...args} />
    </div>
  ),
}

/** size × state in both themes. */
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
                        <div className="w-4000">
                          <Input
                            size={size}
                            aria-label={`${size} ${state}`}
                            placeholder="0.00"
                            {...STATE_PROPS[state]}
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

/** `Field` supplies label, description, error and the aria wiring. */
export const InField: Story = {
  name: "In a Field",
  render: (args) => (
    <div className="flex w-xs flex-col gap-600">
      <Field label="Account name" description="Shown on statements.">
        <Input {...args} placeholder="Operating account" />
      </Field>
      <Field label="IBAN" required error="Enter a valid IBAN (22 characters for DE).">
        <Input {...args} defaultValue="DE89 3704 0044 0532 0130" />
      </Field>
      <Field label="Reference" disabled description="Locked after settlement.">
        <Input {...args} defaultValue="INV-2041" />
      </Field>
    </div>
  ),
}

/** Playground with controls. */
export const Playground: Story = {
  render: (args) => (
    <div className="w-xs">
      <Input aria-label="Playground" {...args} />
    </div>
  ),
}
