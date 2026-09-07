#!/usr/bin/env node
/* global window, document, performance, requestAnimationFrame, setTimeout, innerHeight */
/**
 * Records Chrome DevTools traces of the two animated sequences and writes a frames chart.
 * Usage: PERF_URL=http://localhost:3001 pnpm perf:trace   (run against a production build)
 */
import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"
import puppeteer from "puppeteer-core"

const url = process.env.PERF_URL ?? "http://localhost:3001"
const outDir = path.resolve("docs/perf")
fs.mkdirSync(outDir, { recursive: true })

const CATEGORIES = [
  "devtools.timeline",
  "disabled-by-default-devtools.timeline",
  "disabled-by-default-devtools.timeline.frame",
  "blink.user_timing",
  "loading",
]

const FRAME_BUDGET = 1000 / 60

async function measureFrames(page, drive) {
  await page.evaluate(() => {
    window.__frames = []
    let last = performance.now()
    window.__stopFrames = false
    const tick = (now) => {
      window.__frames.push(now - last)
      last = now
      if (!window.__stopFrames) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await drive()
  return page.evaluate(() => {
    window.__stopFrames = true
    return window.__frames.slice(1)
  })
}

function summarise(frames) {
  const sorted = [...frames].sort((a, b) => a - b)
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0
  const over = frames.filter((f) => f > FRAME_BUDGET * 1.5).length
  return {
    frames: frames.length,
    avgMs: +(frames.reduce((a, b) => a + b, 0) / frames.length).toFixed(2),
    p95Ms: +pct(0.95).toFixed(2),
    maxMs: +Math.max(...frames).toFixed(2),
    over25ms: over,
    fps: +(1000 / (frames.reduce((a, b) => a + b, 0) / frames.length)).toFixed(1),
  }
}

function countTraceEvents(tracePath) {
  const { traceEvents } = JSON.parse(fs.readFileSync(tracePath, "utf8"))
  const counts = {}
  for (const e of traceEvents) {
    if (
      [
        "Layout",
        "UpdateLayoutTree",
        "Paint",
        "PrePaint",
        "Commit",
        "Animation",
        "CompositeLayers",
        "Layerize",
      ].includes(e.name)
    ) {
      counts[e.name] = (counts[e.name] ?? 0) + 1
    }
  }
  return counts
}

function framesSvg(title, frames, summary) {
  const w = 1200
  const h = 220
  const pad = 40
  const barW = Math.max(1, (w - pad * 2) / frames.length)
  const scale = (h - pad * 2) / Math.max(50, Math.max(...frames))
  const bars = frames
    .map((f, i) => {
      const colour =
        f <= FRAME_BUDGET * 1.05 ? "#14ae5c" : f <= FRAME_BUDGET * 2 ? "#e5a000" : "#ec221f"
      const bh = f * scale
      return `<rect x="${(pad + i * barW).toFixed(1)}" y="${(h - pad - bh).toFixed(1)}" width="${Math.max(0.8, barW - 0.4).toFixed(1)}" height="${bh.toFixed(1)}" fill="${colour}"/>`
    })
    .join("")
  const budgetY = h - pad - FRAME_BUDGET * scale
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" font-family="Inter, system-ui, sans-serif" font-size="12">
<rect width="${w}" height="${h}" fill="#ffffff"/>
<text x="${pad}" y="22" font-size="14" font-weight="600" fill="#1e1e1e">${title}</text>
<text x="${w - pad}" y="22" text-anchor="end" fill="#444">${summary.frames} frames · avg ${summary.avgMs} ms · p95 ${summary.p95Ms} ms · max ${summary.maxMs} ms · ${summary.over25ms} over 25 ms</text>
${bars}
<line x1="${pad}" x2="${w - pad}" y1="${budgetY.toFixed(1)}" y2="${budgetY.toFixed(1)}" stroke="#1e1e1e" stroke-dasharray="4 4"/>
<text x="${w - pad}" y="${(budgetY - 4).toFixed(1)}" text-anchor="end" fill="#1e1e1e">16.7 ms (60 fps)</text>
<text x="${pad}" y="${h - 12}" fill="#757575">green ≤ 17.5 ms · amber ≤ 33 ms · red &gt; 33 ms — one bar per requestAnimationFrame</text>
</svg>`
}

async function record(page, name, setup, drive) {
  await setup()
  const tracePath = path.join(outDir, `${name}.trace.json`)
  await page.tracing.start({ path: tracePath, categories: CATEGORIES })
  const frames = await measureFrames(page, drive)
  await page.tracing.stop()
  const summary = summarise(frames)
  const events = countTraceEvents(tracePath)
  fs.writeFileSync(
    path.join(outDir, `${name}.trace.json.gz`),
    zlib.gzipSync(fs.readFileSync(tracePath)),
  )
  fs.unlinkSync(tracePath)
  fs.writeFileSync(path.join(outDir, `${name}.frames.svg`), framesSvg(name, frames, summary))
  return { name, ...summary, events }
}

const browser = await puppeteer.launch({
  channel: "chrome",
  headless: true,
  args: ["--window-size=1400,900", "--force-device-scale-factor=1"],
})
const page = await browser.newPage()
await page.setViewport({ width: 1400, height: 900 })
await page.emulateCPUThrottling(4)

const results = []

results.push(
  await record(
    page,
    "overview-scroll",
    async () => {
      await page.goto(`${url}/overview`, { waitUntil: "networkidle0" })
      await new Promise((r) => setTimeout(r, 800))
    },
    () =>
      page.evaluate(
        () =>
          new Promise((resolve) => {
            const total = document.documentElement.scrollHeight - innerHeight
            const start = performance.now()
            const duration = 5000
            const step = () => {
              const t = Math.min(1, (performance.now() - start) / duration)
              window.scrollTo(0, total * t)
              if (t < 1) requestAnimationFrame(step)
              else resolve()
            }
            requestAnimationFrame(step)
          }),
      ),
  ),
)

results.push(
  await record(
    page,
    "table-resort",
    async () => {
      await page.goto(`${url}/`, { waitUntil: "networkidle0" })
      await page.waitForSelector("tbody tr")
      await new Promise((r) => setTimeout(r, 800))
    },
    async () => {
      for (const label of ["Amount", "Counterparty", "Date", "Status", "Amount", "Amount"]) {
        const [button] = await page.$$(`xpath/.//th//button[contains(., "${label}")]`)
        if (button) await button.click()
        await new Promise((r) => setTimeout(r, 450))
      }
    },
  ),
)

await browser.close()

const md = `# Performance traces

Recorded by \`pnpm perf:trace\` against a production build (\`next start\`) in headless Chrome with **4× CPU throttling**, viewport 1400×900. Each \`*.trace.json.gz\` loads into Chrome DevTools → Performance → Load profile. The SVG is the frames track drawn from \`requestAnimationFrame\` deltas during the same recording.

| Sequence | Frames | Avg | p95 | Max | Frames over 25 ms | Layout events | Paint events |
| --- | --- | --- | --- | --- | --- | --- | --- |
${results.map((r) => `| ${r.name} | ${r.frames} | ${r.avgMs} ms | ${r.p95Ms} ms | ${r.maxMs} ms | ${r.over25ms} | ${r.events.Layout ?? 0} | ${r.events.Paint ?? 0} |`).join("\n")}

Recorded ${new Date().toISOString().slice(0, 10)}.
`
fs.writeFileSync(path.join(outDir, "README.md"), md)
console.log(md)
