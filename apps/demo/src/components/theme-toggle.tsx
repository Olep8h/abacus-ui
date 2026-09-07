"use client"

import { Button, Tooltip } from "@abacus/ui"
import { Moon, Sun } from "lucide-react"
import { useSyncExternalStore } from "react"

import { applyTheme, resolveTheme, subscribeTheme } from "@/lib/theme"

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, resolveTheme, () => "light")
  const next = theme === "dark" ? "light" : "dark"
  return (
    <Tooltip content={`Switch to ${next} theme`}>
      <Button
        variant="secondary"
        size="icon"
        aria-label={`Switch to ${next} theme`}
        onClick={() => applyTheme(next)}
      >
        {theme === "dark" ? <Sun /> : <Moon />}
      </Button>
    </Tooltip>
  )
}
