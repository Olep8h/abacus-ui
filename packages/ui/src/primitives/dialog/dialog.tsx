"use client"

import { X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { createContext, useContext, useState, type ComponentProps } from "react"

import { cn } from "../../lib/cn"
import { Button } from "../button/button"

const DialogOpenContext = createContext(false)

export type DialogProps = ComponentProps<typeof DialogPrimitive.Root>

/** Modal dialog: focus is trapped while open and returned to the trigger on close; Escape and outside click dismiss. */
export function Dialog({ open, defaultOpen, onOpenChange, children, ...props }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : uncontrolledOpen

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <DialogOpenContext.Provider value={isOpen}>
      <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange} {...props}>
        {children}
      </DialogPrimitive.Root>
    </DialogOpenContext.Provider>
  )
}

export type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger>

/** Opens the dialog. Use `asChild` to wrap a `Button`. */
export function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

export type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close>

/** Closes the dialog. Use `asChild` to wrap a `Button` in the footer. */
export function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const

const panelMotion = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
} as const

const spring = { type: "spring", stiffness: 420, damping: 32, mass: 0.8 } as const

export interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  /** Render the top-right close button. Turn off only if the footer offers a clear way out. */
  showClose?: boolean
}

/** The panel. Animates `transform` and `opacity` on a spring; reduced motion makes it an instant cut. */
export function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: DialogContentProps) {
  const open = useContext(DialogOpenContext)
  const reduceMotion = useReducedMotion()
  const instant = { duration: 0 } as const

  return (
    <AnimatePresence>
      {open ? (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay asChild forceMount>
            <motion.div
              data-slot="dialog-overlay"
              className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-scrim p-400 backdrop-blur-sm"
              {...overlayMotion}
              transition={reduceMotion ? instant : { duration: 0.15 }}
            >
              <DialogPrimitive.Content asChild forceMount {...props}>
                <motion.div
                  data-slot="dialog-content"
                  className={cn(
                    "relative flex w-full max-w-lg flex-col gap-200 rounded-md border border-line bg-surface p-800 text-fg shadow-lg outline-none",
                    className,
                  )}
                  {...(reduceMotion ? overlayMotion : panelMotion)}
                  transition={reduceMotion ? instant : spring}
                >
                  {children}
                  {showClose ? (
                    <DialogPrimitive.Close asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close"
                        className="absolute top-200 right-200 text-icon-secondary"
                      >
                        <X />
                      </Button>
                    </DialogPrimitive.Close>
                  ) : null}
                </motion.div>
              </DialogPrimitive.Content>
            </motion.div>
          </DialogPrimitive.Overlay>
        </DialogPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  )
}

export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>

/** Required. Radix links it to the panel via `aria-labelledby`. */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("pr-control-lg text-xl font-semibold", className)}
      {...props}
    />
  )
}

export type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>

/** Optional. Linked via `aria-describedby`; omit it and Radix warns, on purpose. */
export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-base text-fg-secondary", className)}
      {...props}
    />
  )
}

export type DialogFooterProps = ComponentProps<"div">

/** Action row. Stacks on small screens; primary action last in DOM so it is last in tab order. */
export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("mt-600 flex flex-col-reverse gap-300 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}
