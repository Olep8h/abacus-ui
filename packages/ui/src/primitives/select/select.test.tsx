import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

function Example({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Currency">
        <SelectValue placeholder="Choose a currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="eur">Euro</SelectItem>
        <SelectItem value="usd">US Dollar</SelectItem>
        <SelectItem value="gbp">Pound Sterling</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe("Select", () => {
  it("is fully operable with the keyboard", async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<Example onValueChange={onValueChange} />)

    const trigger = screen.getByRole("combobox", { name: "Currency" })
    expect(trigger).toHaveTextContent("Choose a currency")

    await user.tab()
    expect(trigger).toHaveFocus()

    await user.keyboard("{ArrowDown}")
    const listbox = await screen.findByRole("listbox")
    expect(listbox).toBeInTheDocument()
    await user.keyboard("{ArrowDown}")
    await user.keyboard("{Enter}")

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
    expect(onValueChange).toHaveBeenCalledWith("usd")
    expect(trigger).toHaveTextContent("US Dollar")
    expect(trigger).toHaveFocus()

    await user.keyboard("{Enter}")
    await screen.findByRole("listbox")
    await user.keyboard("p")
    expect(screen.getByRole("option", { name: "Pound Sterling" })).toHaveAttribute(
      "data-highlighted",
    )
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(trigger).toHaveTextContent("US Dollar")
    expect(trigger).toHaveFocus()
  })
})
