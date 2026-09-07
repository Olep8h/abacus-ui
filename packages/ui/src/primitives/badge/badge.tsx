import { cva, type VariantProps } from "class-variance-authority"
import { CircleAlert, CircleCheck, CircleMinus, Info, TriangleAlert } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { cn } from "../../lib/cn"

/** Maps onto SDS Tag: scheme × variant (primary → solid, secondary → subtle). */
export const badgeVariants = cva(
  [
    "inline-flex shrink-0 items-center gap-100 rounded-md border border-transparent font-medium whitespace-nowrap",
    "[&_svg]:size-300 [&_svg]:shrink-0",
  ],
  {
    variants: {
      intent: {
        neutral: "",
        brand: "",
        positive: "",
        warning: "",
        danger: "",
      },
      variant: {
        solid: "",
        subtle: "",
      },
      size: {
        sm: "h-control-sm px-200 text-xs",
        md: "h-control-md px-300 text-sm",
      },
    },
    compoundVariants: [
      {
        intent: "neutral",
        variant: "solid",
        className: "bg-surface-tertiary text-fg [&_svg]:text-icon",
      },
      {
        intent: "neutral",
        variant: "subtle",
        className: "border-line bg-surface-secondary text-fg [&_svg]:text-icon",
      },
      {
        intent: "brand",
        variant: "solid",
        className: "bg-brand text-fg-on-brand [&_svg]:text-icon-on-brand",
      },
      {
        intent: "brand",
        variant: "subtle",
        className: "bg-brand-secondary text-fg-on-brand-secondary",
      },
      {
        intent: "positive",
        variant: "solid",
        className: "bg-positive text-fg-on-positive [&_svg]:text-icon-on-positive",
      },
      {
        intent: "positive",
        variant: "subtle",
        className: "bg-positive-secondary text-fg-on-positive-secondary",
      },
      {
        intent: "warning",
        variant: "solid",
        className: "bg-warning text-fg-on-warning [&_svg]:text-icon-on-warning",
      },
      {
        intent: "warning",
        variant: "subtle",
        className: "bg-warning-secondary text-fg-on-warning-secondary",
      },
      {
        intent: "danger",
        variant: "solid",
        className: "bg-danger text-fg-on-danger [&_svg]:text-icon-on-danger",
      },
      {
        intent: "danger",
        variant: "subtle",
        className: "bg-danger-secondary text-fg-on-danger-secondary",
      },
    ],
    defaultVariants: { intent: "neutral", variant: "subtle", size: "sm" },
  },
)

type BadgeVariants = VariantProps<typeof badgeVariants>

const INTENT_ICON = {
  neutral: CircleMinus,
  brand: Info,
  positive: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
} as const

export interface BadgeProps extends ComponentProps<"span"> {
  /** Status semantics. Drives colour *and* the default glyph. */
  intent?: NonNullable<BadgeVariants["intent"]>
  /** `solid` for emphasis, `subtle` (default) for dense tables. */
  variant?: NonNullable<BadgeVariants["variant"]>
  /** 24px (`sm`) or 32px (`md`) tall. */
  size?: NonNullable<BadgeVariants["size"]>
  /** Leading glyph: `true` renders the intent's shape-distinct icon, a node overrides it, `false` drops it. */
  icon?: boolean | ReactNode
}

/** A non-interactive status label. For a clickable chip use a `Button` variant. */
export function Badge({
  className,
  intent = "neutral",
  variant = "subtle",
  size = "sm",
  icon = true,
  children,
  ...props
}: BadgeProps) {
  const Glyph = INTENT_ICON[intent]
  return (
    <span
      data-slot="badge"
      data-intent={intent}
      className={cn(badgeVariants({ intent, variant, size }), className)}
      {...props}
    >
      {icon === true ? <Glyph aria-hidden="true" /> : icon || null}
      {children}
    </span>
  )
}
