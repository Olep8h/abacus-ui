/** tokens.json (Figma variables export) → tokens.css + tokens.generated.ts */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const tokensDir = path.join(here, "../src/tokens")
const input = path.join(tokensDir, "tokens.json")
const outCss = path.join(tokensDir, "tokens.css")
const outTs = path.join(tokensDir, "tokens.generated.ts")

const PREFIX = "sds"
const EXT = "com.figma.sds"

const COLLECTIONS = {
  "@color_primitives": { segment: "color", light: "value" },
  "@color": { segment: "color", light: "sds_light", dark: "sds_dark" },
  "@size": { segment: "size", light: "default" },
  "@typography_primitives": { segment: "typography", light: "default" },
  "@typography": { segment: "typography", light: "mode_1" },
}

const GENERIC_FAMILY = { sans: "sans-serif", serif: "serif", mono: "monospace" }

const raw = JSON.parse(fs.readFileSync(input, "utf8"))

const normalise = (segment) => segment.trim().toLowerCase().replace(/\s+/g, "-")

const cssName = (collection, pathSegments) =>
  `--${PREFIX}-${COLLECTIONS[collection].segment}-${pathSegments.map(normalise).join("-")}`

function* leaves(node, trail = []) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue
    if (value && typeof value === "object" && "$type" in value) {
      yield { path: [...trail, key], node: value }
    } else if (value && typeof value === "object") {
      yield* leaves(value, [...trail, key])
    }
  }
}

const SUPPORTED_TYPES = new Set(["color", "number", "fontFamily", "fontWeight"])
const skipped = []

const index = new Map()
for (const collection of Object.keys(COLLECTIONS)) {
  if (!raw[collection]) throw new Error(`tokens.json is missing collection ${collection}`)
  for (const leaf of leaves(raw[collection])) {
    if (!SUPPORTED_TYPES.has(leaf.node.$type)) {
      skipped.push(`${collection}.${leaf.path.join(".")} ($type ${leaf.node.$type})`)
      continue
    }
    index.set(cssName(collection, leaf.path), { collection, ...leaf })
  }
}

const ALIAS = /^\{(@[a-z_]+)\.(.+)\}$/

class SkipToken extends Error {}

function toCss(value, { type, collection, path: p }) {
  if (typeof value === "string") {
    const alias = value.match(ALIAS)
    if (alias) {
      const [, targetCollection, rest] = alias
      const name = cssName(targetCollection, rest.split("."))
      if (!index.has(name)) {
        if (
          skipped.some((s) =>
            s.startsWith(`${targetCollection}.${rest.split(".").map(normalise).join(".")}`),
          )
        ) {
          throw new SkipToken(`${collection}.${p.join(".")} (aliases skipped ${name})`)
        }
        throw new Error(
          `Alias ${value} (in ${collection}/${p.join(".")}) points at unknown token ${name}`,
        )
      }
      return `var(${name})`
    }
    if (type === "fontFamily") {
      const kind = p.at(-1)?.split("-").at(-1)
      return `"${value}", ${GENERIC_FAMILY[kind] ?? "sans-serif"}`
    }
    return value.toLowerCase()
  }
  if (typeof value === "number") {
    if (type === "fontWeight") return String(value)
    return `${value / 16}rem`
  }
  throw new Error(`Unsupported value ${JSON.stringify(value)} for ${p.join(".")}`)
}

function resolve(value, mode, depth = 0) {
  if (depth > 10) throw new Error("Alias cycle")
  if (typeof value !== "string") return value
  const alias = value.match(ALIAS)
  if (!alias) return value
  const [, targetCollection, rest] = alias
  const target = index.get(cssName(targetCollection, rest.split(".")))
  const modes = target.node.$extensions?.[EXT]?.modes ?? {}
  const cfg = COLLECTIONS[target.collection]
  const next =
    (mode === "dark" && cfg.dark ? modes[cfg.dark] : modes[cfg.light]) ?? target.node.$value
  return resolve(next, mode, depth + 1)
}

const all = []
const staticLines = []
const lightLines = []
const darkLines = []

for (const [collection, cfg] of Object.entries(COLLECTIONS)) {
  for (const { path: p, node } of leaves(raw[collection])) {
    const name = cssName(collection, p)
    if (!index.has(name)) continue
    const modes = node.$extensions?.[EXT]?.modes ?? {}
    const type = node.$type
    const ctx = { type, collection, path: p }

    const lightRaw = modes[cfg.light] ?? node.$value
    let light
    let dark
    let darkRaw
    try {
      light = toCss(lightRaw, ctx)
      if (cfg.dark) {
        darkRaw = modes[cfg.dark] ?? node.$value
        dark = toCss(darkRaw, ctx)
      }
    } catch (err) {
      if (err instanceof SkipToken) {
        skipped.push(err.message)
        continue
      }
      throw err
    }
    ;(cfg.dark ? lightLines : staticLines).push(`  ${name}: ${light};`)
    if (dark !== undefined) darkLines.push(`  ${name}: ${dark};`)

    all.push({
      cssVar: name,
      collection: collection.slice(1),
      path: p,
      type,
      description: node.$description || undefined,
      light,
      dark,
      resolvedLight: String(resolve(lightRaw, "light")),
      resolvedDark: cfg.dark ? String(resolve(darkRaw, "dark")) : undefined,
    })
  }
}

const banner = `/* Generated by packages/ui/scripts/build-tokens.mjs from tokens.json. Do not edit by hand. */`

const css = `${banner}

:root {
${staticLines.join("\n")}
}

:root,
[data-theme="light"] {
${lightLines.join("\n")}
}

[data-theme="dark"] {
${darkLines.join("\n")}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${darkLines.map((l) => `  ${l}`).join("\n")}
  }
}
`

const ts = `// Generated by packages/ui/scripts/build-tokens.mjs from tokens.json. Do not edit by hand.

export type TokenType = "color" | "number" | "fontFamily" | "fontWeight" | "unknown"

export interface Token {
  /** CSS custom property name, e.g. \`--sds-color-brand-800\`. */
  cssVar: string
  /** Figma collection the token came from. */
  collection: "color_primitives" | "color" | "size" | "typography_primitives" | "typography"
  /** Path inside the collection, e.g. ["background", "brand", "default"]. */
  path: string[]
  type: TokenType
  description?: string
  /** CSS value in light mode (may reference another token via var()). */
  light: string
  /** CSS value in dark mode; only semantic colours have one. */
  dark?: string
  /** Fully resolved literal in light mode (hex, px number, family, …). */
  resolvedLight: string
  /** Fully resolved literal in dark mode. */
  resolvedDark?: string
}

export const tokens: readonly Token[] = ${JSON.stringify(all, null, 2)}
`

fs.writeFileSync(outCss, css)
fs.writeFileSync(outTs, ts)
console.log(
  `tokens: ${all.length} tokens → tokens.css (${staticLines.length} static, ${lightLines.length} light, ${darkLines.length} dark) + tokens.generated.ts`,
)
if (skipped.length)
  console.log(`skipped ${skipped.length} non-CSS tokens:\n  ${skipped.join("\n  ")}`)
