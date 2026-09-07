"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"
import { Slot } from "radix-ui"
import type { ComponentProps, MouseEvent } from "react"

import { cn } from "../../lib/cn"

/** Variant table; `variant` and `size` prop types derive from it. */
export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-200 rounded-md border leading-none font-medium whitespace-nowrap select-none",
    "transition-colors duration-150 motion-reduce:transition-none",
    "outline-none focus-visible:focus-ring",
    "disabled:pointer-events-none disabled:border-line-disabled disabled:bg-disabled disabled:text-fg-disabled",
    "aria-disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:size-400 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-line-brand bg-brand text-fg-on-brand hover:bg-brand-hover active:bg-brand-hover",
        secondary:
          "border-line bg-surface-secondary text-fg hover:bg-surface-secondary-hover active:bg-surface-tertiary",
        ghost:
          "border-transparent bg-transparent text-fg-brand hover:bg-surface-hover active:bg-surface-secondary",
        destructive:
          "border-line-danger-secondary bg-danger text-fg-on-danger hover:border-line-danger hover:bg-danger-hover active:bg-danger-hover",
        link: "border-transparent bg-transparent text-fg-brand underline-offset-4 hover:underline active:text-fg-brand-secondary disabled:border-transparent disabled:bg-transparent",
      },
      size: {
        sm: "h-control-md px-200 text-sm [&_svg]:size-300",
        md: "h-control-lg px-300 text-base",
        lg: "h-1200 px-400 text-lg",
        icon: "size-control-lg",
      },
    },
    compoundVariants: [
      { variant: "link", size: ["sm", "md", "lg", "icon"], className: "h-auto w-auto px-0" },
    ],
    defaultVariants: { variant: "primary", size: "md" },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

export interface ButtonProps extends ComponentProps<"button"> {
  /** Visual intent. `destructive` is for irreversible actions only. */
  variant?: NonNullable<ButtonVariants["variant"]>
  /** Control height on the 32 / 40 / 48 scale. `icon` is a 40px square for icon-only buttons. */
  size?: NonNullable<ButtonVariants["size"]>
  /** Render the child element instead of a `<button>`, merging props onto it (Radix Slot). `loading` is not decorated in this mode. */
  asChild?: boolean
  /** Show a spinner and block activation; the button stays focusable (`aria-disabled`). */
  loading?: boolean
  /** Text announced to assistive technology while `loading`. */
  loadingLabel?: string
}

/** The primary action control. Icon-only buttons (`size="icon"`) must carry an `aria-label`. */
export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  loading = false,
  loadingLabel = "Loading",
  type,
  children,
  onClick,
  ...props
}: ButtonProps) {
  if (
    process.env.NODE_ENV !== "production" &&
    size === "icon" &&
    !props["aria-label"] &&
    !props["aria-labelledby"]
  ) {
    console.warn('[Button] size="icon" needs an aria-label so screen readers can name it.')
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  const classes = cn(buttonVariants({ variant, size }), className)

  if (asChild) {
    return (
      <Slot.Root
        data-slot="button"
        data-variant={variant}
        data-size={size}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        className={classes}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Slot.Root>
    )
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      type={type ?? "button"}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      className={classes}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <>
          <span aria-hidden="true" className="invisible inline-flex items-center gap-200">
            {children}
          </span>
          <span className="absolute inset-0 grid place-items-center">
            <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
            <span className="sr-only">{loadingLabel}</span>
          </span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
