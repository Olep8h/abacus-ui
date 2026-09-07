import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Button } from "../button/button"
import { Field } from "../field/field"
import { Input } from "../input/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

const meta = {
  title: "Primitives/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  argTypes: {
    open: { control: "boolean" },
    modal: { control: false },
    onOpenChange: { control: false },
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

/** Uncontrolled. Open it, tab around, press Escape: focus lands back on the trigger. */
export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="secondary">Rename account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Rename account</DialogTitle>
        <DialogDescription>
          The new name appears on statements from the next cycle.
        </DialogDescription>
        <div className="mt-400">
          <Field label="Account name" required>
            <Input defaultValue="Operating account" />
          </Field>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** The one legitimate home for `variant="destructive"`: an irreversible action behind a confirm. */
export const DestructiveConfirm: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="destructive">Cancel transfer</Button>
      </DialogTrigger>
      <DialogContent showClose={false}>
        <DialogTitle>Cancel this transfer?</DialogTitle>
        <DialogDescription>
          €12,500.00 to Nordwind Logistics will not be sent. The counterparty is not notified.
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Keep transfer</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Cancel transfer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** Controlled from outside; the spring is interruptible, so spamming the toggle never queues up. */
export const Controlled: Story = {
  render: function ControlledStory() {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex items-center gap-300">
        <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
          Toggle dialog
        </Button>
        <span className="text-sm text-fg-secondary">open: {String(open)}</span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogTitle>Controlled dialog</DialogTitle>
            <DialogDescription>
              Close with the button, Escape, or a click outside.
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
}

/** Content taller than the viewport scrolls inside the overlay; the panel is never clipped. */
export const LongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">View terms</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Card programme terms</DialogTitle>
        <DialogDescription>Effective 1 October 2026.</DialogDescription>
        <div className="mt-400 flex flex-col gap-300 text-sm text-fg-secondary">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>
              {i + 1}. Cardholders may set per-card spending limits, merchant category controls and
              expiry dates. Limits apply per calendar month in the card's settlement currency and
              reset at 00:00 UTC on the first day of the month.
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
