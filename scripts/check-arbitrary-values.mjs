#!/usr/bin/env node
/** Fails CI on hard-coded colours, lengths and radii outside packages/ui/src/tokens. */
import fs from "node:fs"
import path from "node:path"

const ROOTS = ["packages/ui/src", "apps/docs/src", "apps/docs/.storybook", "apps/demo/src"]
const EXT = new Set([".ts", ".tsx", ".mdx", ".css"])
const ALLOWED_FILES = [
  "packages/ui/src/tokens/tokens.css",
  "packages/ui/src/tokens/tokens.json",
  "packages/ui/src/tokens/tokens.generated.ts",
]

const LITERAL =
  /#[0-9a-fA-F]{3,8}\b|\b\d*\.?\d+(px|rem|em|vh|vw|dvh|svh|ch|%)(?![\w-])|var\(--|calc\(|rgba?\(|hsla?\(|oklch\(|oklab\(|color-mix\(/
const ARBITRARY = /[a-z0-9-]+-\[([^\]]+)\]/g
const VARIABLE_SHORTHAND = /[a-z0-9-]+-\((--[a-z0-9-]+)\)/g
const CSS_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b\d*\.?\d+px\b/g

function* walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue
      yield* walk(full)
    } else if (EXT.has(path.extname(entry.name))) {
      yield full
    }
  }
}

const problems = []

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const rel = path.relative(process.cwd(), file)
    if (ALLOWED_FILES.includes(rel)) continue
    const lines = fs.readFileSync(file, "utf8").split("\n")
    lines.forEach((line, i) => {
      const where = `${rel}:${i + 1}`
      if (rel.endsWith(".css")) {
        if (rel.endsWith("theme.css")) return
        for (const m of line.matchAll(CSS_LITERAL))
          problems.push(`${where}  literal in CSS: ${m[0]}`)
        return
      }
      for (const m of line.matchAll(ARBITRARY)) {
        const inner = m[1]
        if (inner.startsWith("&") || inner.includes("=") || inner.startsWith(":")) continue
        if (LITERAL.test(inner)) problems.push(`${where}  arbitrary value: ${m[0]}`)
      }
      for (const m of line.matchAll(VARIABLE_SHORTHAND)) {
        if (!m[1].startsWith("--radix-")) problems.push(`${where}  variable shorthand: ${m[0]}`)
      }
      for (const m of line.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
        if (!line.includes("http")) problems.push(`${where}  hex colour: ${m[0]}`)
      }
    })
  }
}

if (problems.length) {
  console.error(`✖ ${problems.length} hard-coded value(s) outside the token layer:\n`)
  for (const p of problems) console.error("  " + p)
  process.exit(1)
}
console.log("✓ no arbitrary Tailwind values or literal colours/lengths outside the token layer")
