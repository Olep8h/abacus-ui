#!/usr/bin/env node
/* global document, setTimeout, axe, fetch */
/** Runs axe-core over every Storybook story and the demo pages at 320px and 1280px. */
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import puppeteer from "puppeteer-core"

const require = createRequire(import.meta.url)
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8")
const storybook = process.env.STORYBOOK_URL ?? "http://127.0.0.1:6007"
const demo = process.env.DEMO_URL ?? "http://localhost:3001"
const WIDTHS = [320, 1280]
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]
const STORY_DISABLED = ["region", "landmark-one-main", "page-has-heading-one"]

const index = await (await fetch(`${storybook}/index.json`)).json()
const stories = Object.values(index.entries).filter((e) => e.type === "story")

const browser = await puppeteer.launch({ channel: "chrome", headless: true })
const page = await browser.newPage()

async function audit(url, width, label, disabled = []) {
  await page.setViewport({ width, height: 900 })
  await page.goto(url, { waitUntil: "networkidle0" })
  await new Promise((r) => setTimeout(r, 400))
  await page.evaluate(axeSource)
  const result = await page.evaluate(
    (tags, disabledRules) =>
      axe.run(document, {
        runOnly: { type: "tag", values: tags },
        rules: Object.fromEntries(disabledRules.map((id) => [id, { enabled: false }])),
      }),
    TAGS,
    disabled,
  )
  return {
    label,
    width,
    passes: result.passes.length,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
      count: v.nodes.length,
    })),
  }
}

const results = []
for (const width of WIDTHS) {
  for (const story of stories) {
    results.push(await audit(`${storybook}/iframe.html?id=${story.id}&viewMode=story`, width, `story ${story.title}/${story.name}`, STORY_DISABLED))
  }
  for (const route of ["/", "/overview", "/?status=failed&category=Fees"]) {
    results.push(await audit(`${demo}${route}`, width, `demo ${route}`))
  }
}
await browser.close()

const failing = results.filter((r) => r.violations.length)
const lines = [
  "# Accessibility audit (axe-core)",
  "",
  `Run with \`pnpm check:a11y\` against the built Storybook and the production demo. ${results.length} page × width checks at ${WIDTHS.join("px and ")}px; rules: ${TAGS.join(", ")}. Stories skip the page-level landmark rules (${STORY_DISABLED.join(", ")}) because a story is a fragment, not a page.`,
  "",
  `**${failing.length} checks with violations, ${results.length - failing.length} clean.**`,
  "",
]
for (const r of failing) {
  lines.push(`## ${r.label} @ ${r.width}px`)
  for (const v of r.violations) lines.push(`- **${v.id}** (${v.impact}) ×${v.count}: ${v.help} — \`${v.nodes.join("`, `")}\``)
  lines.push("")
}
lines.push(`Recorded ${new Date().toISOString().slice(0, 10)}.`)
fs.mkdirSync("docs", { recursive: true })
fs.writeFileSync(path.join("docs", "a11y.md"), lines.join("\n"))
console.log(lines.join("\n"))
const serious = failing.flatMap((r) => r.violations).filter((v) => ["serious", "critical"].includes(v.impact))
if (serious.length) process.exit(1)
