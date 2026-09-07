# Abacus UI

A small, token-driven React component library and one real screen built on it. Built as a work sample for a frontend contract application: it exists to show a Figma token set landing in Tailwind faithfully, a documented component library with full variant matrices, and production-style motion that is measured rather than claimed.

| Deliverable                | Where                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------- |
| Storybook                  | https://abacus-ui-docs.vercel.app                                                       |
| Demo (analytics dashboard) | https://abacus-ui-demo.vercel.app · scroll sequence at `/overview`                      |
| AI workflow                | [AI-WORKFLOW.md](./AI-WORKFLOW.md)                                                      |
| Performance traces         | [docs/perf](./docs/perf/README.md) · accessibility audit [docs/a11y.md](./docs/a11y.md) |

## What is in the box

```
packages/ui        @abacus/ui — the library (Tailwind v4 · Radix · cva · motion · Recharts · TanStack Table v9)
apps/docs          Storybook 10: matrices, generated prop tables, "when not to use it" per component
apps/demo          Next.js 16 dashboard: 1,000-row ledger, URL filters, live mode, GSAP overview route
scripts/           CI checks: arbitrary values, contrast, axe audit, DevTools trace recorder
```

Ten components, on purpose: `Button`, `Input` + `Field`, `Select`, `Badge`, `Dialog`, `Tooltip`, `Skeleton`, `DataTable`, `StatCard`, `TimeSeriesChart`. Each has a default story, a matrix story rendering every variant × size × state in both themes on one page, a playground, and a docs page whose prop table is generated from the TypeScript types and their TSDoc.

## The token pipeline

Source: Figma's **Simple Design System** ([Community file](https://www.figma.com/community/file/1380235722331273046/simple-design-system), published by Figma). The variables export is taken from Figma's companion [`figma/sds`](https://github.com/figma/sds) repository (MIT), which commits the raw export of that file; Community files are published under CC BY 4.0. The palette was not touched: SDS's brand ramp is deliberately neutral, and it stays neutral here.

```
tokens.json  ──build-tokens.mjs──▶  tokens.css  ──@import──▶  theme.css  ──@theme──▶  Tailwind utilities
Figma export                        --sds-* vars                hand-curated            bg-brand, p-200, text-sm …
```

1. `packages/ui/src/tokens/tokens.json` is the export, byte-for-byte (W3C-DTCG shape with Figma's mode extensions).
2. `pnpm build:tokens` writes `tokens.css`: every variable as an `--sds-*` custom property, light on `:root`, dark on `[data-theme="dark"]` and, until the user chooses, on `prefers-color-scheme: dark`. It also writes a typed token list the Storybook **Tokens** page renders from, so the docs cannot drift from the CSS. Aliases are resolved and validated; an alias to a missing variable fails the build.
3. `theme.css` is the only hand-curated file. It clears Tailwind's default palette, spacing, radii and type scale (`--color-*: initial`, …) and maps **semantic** names only: `bg-brand`, `text-fg-secondary`, `border-line-danger`, `p-200`, `rounded-md`, `text-sm`. `bg-red-500` and `p-5` do not exist; the primitive ramps stay reachable from CSS for charts and docs but not from utilities, so a component cannot skip the semantic layer.

**The rule, and its teeth.** No hard-coded colour, length or radius outside the token layer. `scripts/check-arbitrary-values.mjs` runs in CI and fails on `text-[#E3FC03]`, `p-[13px]`, `bg-(--my-var)`, or a hex literal in TSX or CSS; arbitrary _variants_ like `data-[state=open]:` and Radix runtime variables are allowed. I enforced the same rule on a Mantine → Tailwind migration: the moment one `#hex` lands in a component, the theme cannot flip it and the designer cannot change it from Figma, and by the time you notice there are forty.

Theme switching is one attribute on `<html>`. No provider, no context, no re-render: `<script>` in `<head>` applies the persisted choice before first paint, and the CSS does the rest. `pnpm check:tokens` regenerates the outputs and fails if they differ from what is committed.

## Decisions and trade-offs

- **TanStack Table v9 with explicit features.** Sorting, pagination and column visibility are registered; nothing else exists on the instance, which keeps the bundle honest and the types exact. Cost: v9 is new, its API differs from every v8 snippet online, and the `ColumnMeta` augmentation for column alignment is more ceremony than v8 needed.
- **Pagination instead of virtualisation, with `layout` row animation.** Rows animate into place on re-sort (transform only, keyed by row id), which is only sane when a page is 25 rows. Cost: 1,000 rows never render at once, so the "scroll a huge table" experience is not demonstrated; with real data volumes I would virtualise and drop the row animation.
- **Semantic tokens only in utilities.** `bg-positive` is available; `bg-green-500` is not. Cost: a designer's one-off "make this one chip lime" needs a token first. That is the point, and it is also friction.
- **Motion library split.** Framer Motion (`motion`) for component-level springs and layout; GSAP ScrollTrigger only on the marketing route, loaded only there. Cost: two animation runtimes in one app (about 60 KB gzipped combined). I would not do this in a product without a reason; here the reason is that the brief asks for both.
- **What I did not build.** No Storybook interaction tests via the Vitest addon (browser-mode Vitest plus Playwright is a second test runner for a repo with three tests), no D3 beyond one hand-rolled scale pair for the sparkline, no CMS, no auth. Every one of those is a day I preferred to spend on the matrix, the traces and the contrast audit.

## Motion and the performance proof

Every animation uses `transform` and `opacity` only, and every one collapses under `prefers-reduced-motion`: `useReducedMotion` for Framer Motion, `gsap.matchMedia` for ScrollTrigger, `motion-reduce:` for the CSS keyframes. `pnpm perf:trace` records real Chrome DevTools traces (loadable in the Performance panel) of the scroll sequence and the table re-sort against a production build with 4× CPU throttling, and draws the frames track from `requestAnimationFrame` deltas:

| Sequence           | Frames | Avg      | p95     | Max      | Frames over 25 ms | Layout events |
| ------------------ | ------ | -------- | ------- | -------- | ----------------- | ------------- |
| overview scroll    | 300    | 16.67 ms | 16.7 ms | 16.8 ms  | 0                 | 11            |
| table re-sort (×6) | 171    | 18.8 ms  | 33.4 ms | 116.6 ms | 11                | 36            |

What I checked: that the scroll sequence produces no layout work at all (eleven `Layout` events across five seconds are ScrollTrigger's own measurements at start), and that the re-sort's cost is React committing 25 rows and TanStack sorting 1,000, not the animation. The first pass of the re-sort measured p95 83 ms: the URL-bound sort state re-rendered the whole dashboard and recomputed the chart each click; keying memoisation on the individual fields brought it to 33 ms. If the sequence got heavier I would virtualise the table, move sorting into a worker for the 10k-row case, and cap the row animation to pages under 50 rows.

**Live mode.** Ticks land in a last-known slot; painting is coalesced on `requestAnimationFrame`, so at most one React commit happens per frame and intermediate ticks are dropped rather than queued. Sort order and scroll position survive because rows are keyed by id and the table is data-driven, not re-mounted.

**Lighthouse** (production build, headless Chrome): desktop 100 / 100 / 100 / 100, mobile 98 / 100 / 100 / 100 (performance / accessibility / best practices / SEO), CLS 0 on both. Mobile loses two points to time-to-interactive on a throttled CPU (Recharts and the table hydrate on the main thread). The first mobile run reported CLS 0.25: Radix `SelectValue` renders its text only after hydration, so the header reflowed once labels appeared. Passing the label as children fixes it and is now documented on the component.

## Accessibility

- Keyboard: every control reachable, visible focus ring everywhere (a token pair, not a magic number), logical order, `Dialog` traps focus and returns it to its trigger, `Select` is fully keyboard-operable with type-ahead. The last two are Vitest tests.
- `pnpm check:a11y` runs axe-core over every story and the demo routes at 320 px and 1280 px; results in `docs/a11y.md`.
- **Contrast: Figma's palette fails AA in four pairs.** `pnpm check:contrast` resolves every alias and measures the pairs the components use, in both themes. SDS ships white on red-500 (3.7:1) for its danger button, white on green-500 (2.8:1) for positive tags, a 1.4:1 input border and 2.1:1 placeholder text. `theme.css` carries a small override layer for those (red-600 and a 3:1 border in light; dark text on the light-theme positive badge), and the check pins the two documented exemptions: disabled controls (exempt under WCAG) and the tertiary text token, which components no longer use for text. SDS also hard-codes its focus ring as `rgb(0, 106, 255)` outside the token set; here it is `border-brand`, so it flips with the theme.
- Responsive to 320 px: the table scrolls inside its own container with a sticky first column; nothing squashes and nothing overflows the page horizontally.

## What I would do next

- **Publish the package properly.** Today `@abacus/ui` exports TypeScript source and relies on `transpilePackages`; a real handoff needs a `tsup` build with `.d.ts`, a changelog and a version, plus Chromatic for visual regression on the matrices.
- **Virtualise `DataTable` and add row selection and expansion** as registered features, with the keyboard grid pattern that inline editing needs.
- **Wire the token pipeline to Figma directly** through the Variables REST API or the Figma MCP server, so `tokens.json` is pulled rather than copied, and diff the result in CI.

## Run it locally

```bash
pnpm install
pnpm storybook          # http://localhost:6006
pnpm dev                # http://localhost:3000  (dashboard) · /overview
pnpm verify             # tokens · arbitrary values · contrast · lint · typecheck · tests · builds

# optional, need the production demo running on :3001 and Storybook static on :6007
pnpm --filter @abacus/demo build && pnpm --filter @abacus/demo start -p 3001
pnpm --filter @abacus/docs build && (cd apps/docs/storybook-static && python3 -m http.server 6007)
pnpm perf:trace         # docs/perf
pnpm check:a11y         # docs/a11y.md
```

Node 24, pnpm 10. No network access is needed at runtime: the demo's data is a seeded generator.
