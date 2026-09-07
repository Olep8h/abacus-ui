#!/usr/bin/env node
/** WCAG contrast of the token pairs the components rely on, in both themes. */
import { tokens } from "../packages/ui/src/tokens/tokens.generated.ts"

const byVar = new Map(tokens.map((t) => [t.cssVar, t]))

/** theme.css accessibility overrides, mirrored here so the check measures what ships. */
const OVERRIDES = {
  light: {
    "background-danger-default": "background-danger-hover",
    "background-danger-hover": "border-danger-default",
    "text-positive-on-positive": "text-default-default",
  },
  dark: {},
}
const colour = (name, theme) => {
  const t = byVar.get(`--sds-color-${OVERRIDES[theme][name] ?? name}`)
  if (!t) throw new Error(`unknown token ${name}`)
  return theme === "dark" ? (t.resolvedDark ?? t.resolvedLight) : t.resolvedLight
}

function rgba(hex) {
  const h = hex.replace("#", "")
  const n = h.length === 3 || h.length === 4 ? [...h].map((c) => c + c).join("") : h
  const v = parseInt(n.slice(0, 6), 16)
  const a = n.length === 8 ? parseInt(n.slice(6, 8), 16) / 255 : 1
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255, a]
}
const blend = (fg, bg) => fg.map((c, i) => (i === 3 ? 1 : c * fg[3] + bg[i] * (1 - fg[3])))
const lum = ([r, g, b]) => {
  const f = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (fgHex, bgHex, baseHex) => {
  const base = rgba(baseHex)
  const bg = blend(rgba(bgHex), base)
  const fg = blend(rgba(fgHex), bg)
  const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a)
  return (l1 + 0.05) / (l2 + 0.05)
}

const PAIRS = [
  ["body text", "text-default-default", "background-default-default", 4.5],
  ["secondary text", "text-default-secondary", "background-default-default", 4.5],
  [
    "tertiary text (not used for text in components)",
    "text-default-tertiary",
    "background-default-default",
    4.5,
  ],
  ["placeholder (secondary)", "text-default-secondary", "background-default-default", 4.5],
  ["table header text", "text-default-default", "background-default-secondary", 4.5],
  ["primary button", "text-brand-on-brand", "background-brand-default", 4.5],
  ["primary button hover", "text-brand-on-brand", "background-brand-hover", 4.5],
  ["ghost / link text", "text-brand-default", "background-default-default", 4.5],
  ["destructive button", "text-danger-on-danger", "background-danger-default", 4.5],
  ["danger text", "text-danger-default", "background-default-default", 4.5],
  ["positive text (delta)", "text-positive-default", "background-default-default", 4.5],
  ["warning text", "text-warning-default", "background-default-default", 4.5],
  ["badge positive solid", "text-positive-on-positive", "background-positive-default", 4.5],
  ["badge warning solid", "text-warning-on-warning", "background-warning-default", 4.5],
  ["badge danger solid", "text-danger-on-danger", "background-danger-default", 4.5],
  [
    "badge positive subtle",
    "text-positive-on-positive-secondary",
    "background-positive-secondary",
    4.5,
  ],
  [
    "badge warning subtle",
    "text-warning-on-warning-secondary",
    "background-warning-secondary",
    4.5,
  ],
  ["badge danger subtle", "text-danger-on-danger-secondary", "background-danger-secondary", 4.5],
  ["badge brand subtle", "text-brand-on-brand-secondary", "background-brand-secondary", 4.5],
  ["disabled control text", "text-disabled-default", "background-disabled-default", 4.5],
  ["control border (non-text, 3:1)", "border-default-secondary", "background-default-default", 3],
  [
    "separator (decorative, informational)",
    "border-default-default",
    "background-default-default",
    1,
  ],
  ["focus ring (non-text, 3:1)", "border-brand-default", "background-default-default", 3],
]

let failures = 0
for (const theme of ["light", "dark"]) {
  console.log(`\n${theme}`)
  for (const [label, fg, bg, min] of PAIRS) {
    const base = colour("background-default-default", theme)
    const ratio = contrast(colour(fg, theme), colour(bg, theme), base)
    const ok = ratio >= min
    if (!ok) failures++
    console.log(
      `  ${ok ? "✓" : "✗"} ${ratio.toFixed(2).padStart(5)}  ${label.padEnd(30)} ${fg} on ${bg}`,
    )
  }
}

const KNOWN = Number(process.env.CONTRAST_KNOWN_FAILURES ?? 4)
if (failures > KNOWN) {
  console.error(
    `\n✖ ${failures} contrast failures (documented baseline: ${KNOWN}). See README → Accessibility.`,
  )
  process.exit(1)
}
console.log(`\n${failures} known failures, within the documented baseline of ${KNOWN}.`)
