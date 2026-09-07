import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Button } from "../button/button"
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

function Example() {
  return (
    <>
      <Button variant="ghost">Before</Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription>Pick a new name.</DialogDescription>
          <Input aria-label="Name" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button variant="ghost">After</Button>
    </>
  )
}

describe("Dialog", () => {
  it("traps focus while open and returns it to the trigger on close", async () => {
    const user = userEvent.setup()
    render(<Example />)

    const trigger = screen.getByRole("button", { name: "Open" })
    await user.click(trigger)

    const dialog = await screen.findByRole("dialog", { name: "Rename" })
    expect(dialog).toHaveAccessibleDescription("Pick a new name.")
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))

    for (let i = 0; i < 6; i++) {
      await user.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
    await user.tab({ shift: true })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)

    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("closes from a DialogClose button and still returns focus", async () => {
    const user = userEvent.setup()
    render(<Example />)
    const trigger = screen.getByRole("button", { name: "Open" })
    await user.click(trigger)
    await screen.findByRole("dialog")
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })
})
