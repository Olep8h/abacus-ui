import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, Plus } from "lucide-react"
import { fn } from "storybook/test"

import { Button } from "./button"
import { BUTTON_SIZES, BUTTON_VARIANTS, ButtonMatrix } from "./button-matrix"

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: {
    children: "Save changes",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "select", options: BUTTON_VARIANTS },
    size: { control: "select", options: BUTTON_SIZES },
    asChild: { control: false },
    children: { control: "text" },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** The default: primary intent, 40px tall. */
export const Default: Story = {}

/** Every variant × size × state × content, in both themes, on one page. */
export const Matrix: Story = {
  render: () => <ButtonMatrix />,
  parameters: { layout: "fullscreen", controls: { disable: true } },
}

/** Try any combination with the controls panel. */
export const Playground: Story = {
  args: { children: "Playground" },
}

/** Icon + label. Icons are `currentColor`, so they follow the variant's text token. */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus />
        New transaction
      </>
    ),
  },
}

/** Icon-only requires `aria-label`; Storybook's a11y addon fails the story without it. */
export const IconOnly: Story = {
  args: { size: "icon", "aria-label": "Add transaction", children: <Plus /> },
}

/** Loading keeps its width (label stays in layout, invisible) and stays focusable. */
export const Loading: Story = {
  args: { loading: true, children: "Submitting" },
}

/** `asChild` renders the child element with button styling — here a plain anchor. */
export const AsLink: Story = {
  args: { asChild: true, variant: "link" },
  render: (args) => (
    <Button {...args}>
      <a href="#reports">
        View reports
        <ArrowRight />
      </a>
    </Button>
  ),
}
