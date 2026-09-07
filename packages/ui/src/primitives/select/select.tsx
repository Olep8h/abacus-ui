"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { Check, ChevronDown } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"
import type { ComponentProps } from "react"

import { cn } from "../../lib/cn"
import { joinIds, useFieldContext } from "../field/field-context"

export type SelectProps = ComponentProps<typeof SelectPrimitive.Root>

/** Single-choice control with full keyboard operation. Compose: `Select` → `SelectTrigger` + `SelectContent` → `SelectItem`. */
export function Select(props: SelectProps) {
  const field = useFieldContext()
  return (
    <SelectPrimitive.Root
      data-slot="select"
      required={props.required ?? field?.required}
      disabled={props.disabled ?? field?.disabled}
      {...props}
    />
  )
}

export type SelectGroupProps = ComponentProps<typeof SelectPrimitive.Group>

/** Groups items under a `SelectLabel`. */
export function SelectGroup(props: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

export type SelectValueProps = ComponentProps<typeof SelectPrimitive.Value>

/** Renders the selected item's text, or `placeholder`. Pass the label as children when the value is controlled, so server-rendered HTML already has it and nothing shifts on hydration. */
export function SelectValue(props: SelectValueProps) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

/** Same box as `Input`, so a form row of inputs and selects lines up. */
export const selectTriggerVariants = cva(
  [
    "flex w-full min-w-0 items-center justify-between gap-200 rounded-md border border-line-control bg-surface text-fg",
    "transition-colors duration-150 motion-reduce:transition-none",
    "outline-none focus-visible:border-line-brand-secondary focus-visible:focus-ring",
    "aria-invalid:border-line-danger",
    "disabled:cursor-not-allowed disabled:border-line-disabled disabled:bg-disabled disabled:text-fg-disabled",
    "data-placeholder:text-fg-secondary",
    "*:data-[slot=select-value]:truncate",
    "[&_svg]:size-400 [&_svg]:shrink-0 [&_svg]:text-icon",
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

type SelectTriggerVariants = VariantProps<typeof selectTriggerVariants>

export interface SelectTriggerProps extends ComponentProps<typeof SelectPrimitive.Trigger> {
  /** Control height: 32px (`sm`) or 40px (`md`). */
  size?: NonNullable<SelectTriggerVariants["size"]>
  /** Mark invalid. Set automatically inside a `Field` with `error`. */
  invalid?: boolean
}

/** The button that shows the value and opens the list. Picks up `Field` wiring like `Input`. */
export function SelectTrigger({
  className,
  size = "md",
  invalid,
  id,
  children,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SelectTriggerProps) {
  const field = useFieldContext()
  const isInvalid = invalid ?? (ariaInvalid === true || ariaInvalid === "true")

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      id={id ?? field?.controlId}
      aria-invalid={isInvalid || field?.invalid || undefined}
      aria-describedby={joinIds(ariaDescribedBy, field?.describedBy)}
      className={cn(selectTriggerVariants({ size }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content>

/** The popover list. Positioned under the trigger, at least as wide, never taller than the viewport. */
export function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-x-hidden overflow-y-auto rounded-md border border-line bg-surface p-100 text-fg shadow-md",
          "origin-(--radix-select-content-transform-origin) animate-pop-in motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="flex flex-col gap-050">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export type SelectLabelProps = ComponentProps<typeof SelectPrimitive.Label>

/** Heading for a `SelectGroup`. */
export function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-200 py-100 text-xs font-medium text-fg-secondary", className)}
      {...props}
    />
  )
}

export type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item>

/** One option. Highlight follows keyboard and pointer; the check marks the selected value. */
export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-200 rounded-sm py-150 pr-800 pl-200 text-sm outline-none select-none",
        "data-disabled:pointer-events-none data-disabled:text-fg-disabled data-highlighted:bg-surface-secondary",
        "[&_svg]:size-400 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-200 flex items-center text-icon-brand">
        <SelectPrimitive.ItemIndicator>
          <Check aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}

export type SelectSeparatorProps = ComponentProps<typeof SelectPrimitive.Separator>

/** A hairline between groups. */
export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-100 my-100 h-px bg-line", className)}
      {...props}
    />
  )
}
