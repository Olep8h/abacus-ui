import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Button, buttonVariants } from "./button"
import { BUTTON_SIZES, BUTTON_VARIANTS, ButtonMatrix } from "./button-matrix"

describe("Button", () => {
  it("renders the full variant × size × state matrix without crashing", () => {
    const { container } = render(<ButtonMatrix themes={["light"]} />)
    const buttons = container.querySelectorAll("button")
    expect(buttons).toHaveLength(5 * (3 * 3 + 1) * 6)
  })

  it("keeps the variant × size class table stable", () => {
    const table = Object.fromEntries(
      BUTTON_VARIANTS.flatMap((variant) =>
        BUTTON_SIZES.map((size) => [`${variant}/${size}`, buttonVariants({ variant, size })]),
      ),
    )
    expect(table).toMatchSnapshot()
  })

  it("names every icon-only button", () => {
    render(<ButtonMatrix themes={["light"]} />)
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAccessibleName()
    }
  })

  it("blocks activation while loading but stays focusable", async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <Button loading onClick={onClick}>
        Submit
      </Button>,
    )
    const button = screen.getByRole("button", { name: /loading/i })
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).not.toBeDisabled()
    await user.tab()
    expect(button).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(onClick).not.toHaveBeenCalled()
  })

  it("renders as the child element with asChild", () => {
    render(
      <Button asChild>
        <a href="/reports">Reports</a>
      </Button>,
    )
    const link = screen.getByRole("link", { name: "Reports" })
    expect(link).toHaveAttribute("data-slot", "button")
    expect(link.tagName).toBe("A")
  })
})
