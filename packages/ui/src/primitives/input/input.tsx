"use client"

import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "../../lib/cn"
import { joinIds, useFieldContext } from "../field/field-context"

/** SDS Input: surface background, 1px inset border, 8px radius, tertiary placeholder. */
export const inputVariants = cva(
  [
    "peer flex w-full min-w-0 rounded-md border border-line-control bg-surface text-fg",
    "placeholder:text-fg-secondary",
    "transition-colors duration-150 motion-reduce:transition-none",
    "outline-none focus-visible:border-line-brand-secondary focus-visible:focus-ring",
    "aria-invalid:border-line-danger",
    "disabled:cursor-not-allowed disabled:border-line-disabled disabled:bg-disabled disabled:text-fg-disabled disabled:placeholder:text-fg-disabled",
    "file:me-200 file:border-0 file:bg-transparent file:font-medium file:text-fg",
  ],
  {
    variants: {
      size: {
        sm: "h-control-md px-300 text-sm",
        md: "h-control-lg px-400 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
)

type InputVariants = VariantProps<typeof inputVariants>

export interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  /** Control height: 32px (`sm`) or 40px (`md`). */
  size?: NonNullable<InputVariants["size"]>
  /** Mark the value invalid. Set automatically when rendered inside a `Field` with `error`. */
  invalid?: boolean
}

/** Single-line text control. Inside a `Field` it picks up id, descriptions, `required`, `disabled` and invalid state. */
export function Input({
  className,
  size = "md",
  invalid,
  id,
  required,
  disabled,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  const field = useFieldContext()
  const isInvalid = invalid ?? (ariaInvalid === true || ariaInvalid === "true") ?? false

  return (
    <input
      data-slot="input"
      id={id ?? field?.controlId}
      required={required ?? field?.required}
      disabled={disabled ?? field?.disabled}
      aria-invalid={isInvalid || field?.invalid || undefined}
      aria-describedby={joinIds(ariaDescribedBy, field?.describedBy)}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}
