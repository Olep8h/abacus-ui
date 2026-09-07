"use client"

import { createContext, useContext } from "react"

export interface FieldContextValue {
  /** id the control should use so the label's `htmlFor` resolves. */
  controlId: string
  /** Space-separated ids for `aria-describedby` (description + error, when present). */
  describedBy?: string
  invalid: boolean
  required: boolean
  disabled: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

/** The enclosing `Field`, if any. */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext)
}

/** Merge a control's own aria-describedby with the Field's. */
export function joinIds(...ids: Array<string | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(" ")
  return joined.length ? joined : undefined
}
