"use client"

import { useId, type ComponentProps, type ReactNode } from "react"

import { cn } from "../../lib/cn"
import { Label } from "../label/label"
import { FieldContext, joinIds } from "./field-context"

export interface FieldProps extends Omit<ComponentProps<"div">, "children"> {
  /** Visible label text. Required: an unlabelled control is a bug, not an option. */
  label: ReactNode
  /** Helper text rendered under the label and linked via `aria-describedby`. */
  description?: ReactNode
  /** Validation message; sets `aria-invalid` on the control and is announced through a polite live region. */
  error?: ReactNode
  /** Marks the control required and shows the visual marker on the label. */
  required?: boolean
  /** Disables the control and dims the label. */
  disabled?: boolean
  /** Override the generated control id (useful when the control already has one). */
  id?: string
  /** Exactly one form control: `Input`, `Select`, or anything that calls `useFieldContext`. */
  children: ReactNode
}

/** Wires label, description and error to one control with the right ids and aria attributes. */
export function Field({
  label,
  description,
  error,
  required = false,
  disabled = false,
  id,
  className,
  children,
  ...props
}: FieldProps) {
  const generated = useId()
  const controlId = id ?? `${generated}-control`
  const descriptionId = description ? `${generated}-description` : undefined
  const errorId = error ? `${generated}-error` : undefined

  return (
    <FieldContext.Provider
      value={{
        controlId,
        describedBy: joinIds(descriptionId, errorId),
        invalid: Boolean(error),
        required,
        disabled,
      }}
    >
      <div
        data-slot="field"
        data-invalid={error ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={cn("flex w-full flex-col gap-200", className)}
        {...props}
      >
        <Label
          htmlFor={controlId}
          required={required}
          className={cn(disabled && "text-fg-disabled")}
        >
          {label}
        </Label>
        {description ? (
          <p id={descriptionId} className="text-sm text-fg-secondary">
            {description}
          </p>
        ) : null}
        {children}
        <div aria-live="polite" className={cn("text-sm text-fg-danger", !error && "sr-only")}>
          {error ? <p id={errorId}>{error}</p> : null}
        </div>
      </div>
    </FieldContext.Provider>
  )
}
