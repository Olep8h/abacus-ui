"use client"

import { Tooltip as TooltipPrimitive } from "radix-ui"
import { useState, type ComponentProps, type PointerEvent, type ReactNode } from "react"

import { cn } from "../../lib/cn"

export type TooltipProviderProps = ComponentProps<typeof TooltipPrimitive.Provider>

/** Optional app-level provider so adjacent tooltips share the skip delay. */
export function TooltipProvider({ delayDuration = 300, ...props }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
}

export interface TooltipProps extends Omit<
  ComponentProps<typeof TooltipPrimitive.Root>,
  "children"
> {
  /** Tooltip text. Keep it supplementary: the trigger must make sense without it. */
  content: ReactNode
  /** The trigger element. It receives the trigger props via Radix `Slot`, so it must forward them. */
  children: ReactNode
  /** Preferred side; flips automatically when there is no room. */
  side?: ComponentProps<typeof TooltipPrimitive.Content>["side"]
  /** Alignment along the side. */
  align?: ComponentProps<typeof TooltipPrimitive.Content>["align"]
  /** Extra classes for the bubble. */
  className?: string
}

/** Opens on hover and focus; on touch a tap opens it and a tap elsewhere closes it. Never the trigger's only label. */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  className,
  open: controlledOpen,
  onOpenChange,
  delayDuration = 300,
  ...rootProps
}: TooltipProps) {
  const [touchOpen, setTouchOpen] = useState(false)
  const open = controlledOpen ?? (touchOpen || undefined)

  const handleOpenChange = (next: boolean) => {
    if (!next) setTouchOpen(false)
    onOpenChange?.(next)
  }

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "touch") return
    event.preventDefault()
    setTouchOpen((value) => !value)
  }

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange} {...rootProps}>
        <TooltipPrimitive.Trigger asChild onPointerDown={handlePointerDown}>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            data-slot="tooltip-content"
            side={side}
            align={align}
            sideOffset={6}
            collisionPadding={8}
            className={cn(
              "z-50 max-w-xs rounded-md border border-line bg-surface px-300 py-200 text-sm text-fg shadow-md",
              "origin-(--radix-tooltip-content-transform-origin) animate-pop-in motion-reduce:animate-none",
              className,
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
