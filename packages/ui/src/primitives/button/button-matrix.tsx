import { Plus } from "lucide-react"

import { cn } from "../../lib/cn"
import { Button, type ButtonProps } from "./button"

export const BUTTON_VARIANTS = ["primary", "secondary", "ghost", "destructive", "link"] as const
export const BUTTON_SIZES = ["sm", "md", "lg", "icon"] as const
export const BUTTON_STATES = [
  "default",
  "hover",
  "focus-visible",
  "active",
  "disabled",
  "loading",
] as const
export const BUTTON_CONTENT = ["label", "icon-label", "icon"] as const
export const THEMES = ["light", "dark"] as const

type State = (typeof BUTTON_STATES)[number]
type Content = (typeof BUTTON_CONTENT)[number]

const STATE_PROPS: Record<State, Partial<ButtonProps>> = {
  default: {},
  hover: { className: "pseudo-hover" },
  "focus-visible": { className: "pseudo-focus-visible" },
  active: { className: "pseudo-active" },
  disabled: { disabled: true },
  loading: { loading: true },
}

function content(kind: Content, size: ButtonProps["size"]) {
  if (kind === "icon" || size === "icon") return <Plus />
  if (kind === "icon-label")
    return (
      <>
        <Plus />
        Add
      </>
    )
  return "Add"
}

export interface ButtonMatrixProps {
  /** Render only these themes (defaults to both, stacked). */
  themes?: readonly (typeof THEMES)[number][]
}

/**
 * The full variant × size × state × content grid for both themes on one page.
 * Shared by the Matrix story and the render test, so what is tested is what is shown.
 */
export function ButtonMatrix({ themes = THEMES }: ButtonMatrixProps) {
  return (
    <div className="flex flex-col gap-800">
      {themes.map((theme) => (
        <section
          key={theme}
          data-theme={theme}
          className="flex flex-col gap-600 bg-surface p-600 text-fg"
          aria-label={`${theme} theme`}
        >
          <h2 className="text-lg font-semibold capitalize">{theme}</h2>
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-col gap-200">
              <h3 className="text-sm font-medium text-fg-secondary capitalize">{variant}</h3>
              <div className="overflow-x-auto">
                <table className="border-separate border-spacing-0 text-xs">
                  <thead>
                    <tr>
                      <th scope="col" className="sr-only">
                        Size / content
                      </th>
                      {BUTTON_STATES.map((state) => (
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
                    {BUTTON_SIZES.map((size) =>
                      BUTTON_CONTENT.filter((c) => (size === "icon" ? c === "icon" : true)).map(
                        (kind) => (
                          <tr key={`${size}-${kind}`}>
                            <th
                              scope="row"
                              className="pr-300 text-left font-normal whitespace-nowrap text-fg-secondary"
                            >
                              {size} · {kind}
                            </th>
                            {BUTTON_STATES.map((state) => (
                              <td key={state} className={cn("px-300 py-100 align-middle")}>
                                <Button
                                  variant={variant}
                                  size={size}
                                  aria-label={
                                    kind === "icon" || size === "icon" ? "Add" : undefined
                                  }
                                  {...STATE_PROPS[state]}
                                >
                                  {content(kind, size)}
                                </Button>
                              </td>
                            ))}
                          </tr>
                        ),
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
