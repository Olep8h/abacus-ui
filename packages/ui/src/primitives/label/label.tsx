"use client"

import { Label as LabelPrimitive } from "radix-ui"
import type { ComponentProps } from "react"

import { cn } from "../../lib/cn"

export interface LabelProps extends ComponentProps<typeof LabelPrimitive.Root> {
  /** Append a visual required marker. The control itself must still carry `required`. */
  required?: boolean
}

/** Form label. Usually rendered by `Field`, not directly. */
export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "inline-flex items-center gap-100 text-sm font-medium text-fg select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:text-fg-disabled",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="text-fg-danger">
          *
        </span>
      ) : null}
    </LabelPrimitive.Root>
  )
}
