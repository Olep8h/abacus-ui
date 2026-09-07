"use client"

import { useEffect, useRef, useState } from "react"

import { applyTick, createTicker } from "@/mock/live"
import { transactions, type Transaction } from "@/mock/transactions"

export function useLiveFeed(enabled: boolean, ticksPerSecond = 4) {
  const [rows, setRows] = useState<readonly Transaction[]>(transactions)
  const [tickCount, setTickCount] = useState(0)
  const latest = useRef<readonly Transaction[]>(transactions)
  const dirty = useRef(false)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    const next = createTicker(latest.current)
    let ticks = 0

    const paint = () => {
      frame.current = null
      if (!dirty.current) return
      dirty.current = false
      setRows(latest.current)
      setTickCount(ticks)
    }

    const interval = window.setInterval(() => {
      latest.current = applyTick(latest.current, next())
      dirty.current = true
      ticks++
      frame.current ??= window.requestAnimationFrame(paint)
    }, 1000 / ticksPerSecond)

    return () => {
      window.clearInterval(interval)
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [enabled, ticksPerSecond])

  return { rows, tickCount }
}
