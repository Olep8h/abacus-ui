# AI workflow

This repo was built with Claude Code from a written brief I prepared first: stack, component inventory, token rules, motion requirements, definition of done. The model produced first drafts; nothing went in until it passed the same loop every change goes through here: typecheck, lint, the arbitrary-value and contrast checks, tests, a Storybook build, and the built output opened in a browser. For motion, a DevTools trace. Four episodes below, in the same shape: the prompt, what came back, what stayed and what did not.

## 1. Tokens: keep the generator mechanical

**Prompt.** The token section of the brief: pick a public Figma file with light and dark modes and a numeric type scale, commit its variables export untouched, generate CSS custom properties from it, expose them through Tailwind's `@theme`, and fail CI on any hard-coded colour or length.

**Came back.** Three candidates evaluated; Figma's own Simple Design System chosen because its raw export is public and has both modes. The first generator draft emitted shadcn-style names (`--primary`, `--background`) directly from the JSON. It also would have produced `var(--undefined)` silently: alias strings in the export use Figma display names (`Brand B.800`) while keys are kebab-case (`brand-b`).

**Kept / rejected.** Kept the file and the pipeline. Rejected curated names in generated output: curation lives in a hand-written `theme.css`, the generator stays a pure transform, and an unresolved alias is a build error. A Figma re-export can never rename a utility by accident.

## 2. Prop tables were wrong and the build was green

**Prompt.** Prop tables generated from TypeScript types and TSDoc via `react-docgen-typescript`, no hand-written tables.

**Came back.** A Storybook that built without a warning and showed `variant: string` with empty descriptions. The first explanation offered was pnpm's strict layout hiding `typescript` from the Storybook framework. Reading the preset source disproved it.

**Kept / rejected.** The real cause, confirmed by grepping the built bundle for a TSDoc sentence and not finding it: the Vite docgen plugin resolves its default `include` glob against the Storybook app's directory, so a library one folder up is filtered out before parsing. One explicit `include` fixed it. The lesson I keep: a green build says nothing about whether the docs are right. Read the artifact.

## 3. A test that hung, and a fix I refused

**Prompt.** A Vitest test proving `Select` is fully keyboard-operable.

**Came back.** A test that opened the listbox and timed out after sixteen seconds. Bisecting showed only the popper positioning layer stalled timers, with no render loop. Timing individual DOM calls found single `Element.matches` calls taking 200 ms: floating-ui probes `:popover-open` and `:modal`, and jsdom's selector engine throws on both, slowly, inside a try/catch. The model then proposed switching the component to `position="item-aligned"` so the test would pass.

**Kept / rejected.** Rejected the component change: that alters product behaviour to satisfy a test environment. Kept a three-line `matches` polyfill in the test setup. The test covers arrow keys, type-ahead, Enter, Escape and focus return, and runs in 300 ms.

## 4. GSAP ScrollTrigger, an API I had not shipped before

**Prompt.** A pinned section with staged reveals and a parallax layer, transform and opacity only, with a committed performance trace.

**Came back.** A section that pinned correctly and then let the next section slide over it. Every check passed; the bug was only visible by scrolling the page. The pinned element's parent was a flex column, and the spacer padding ScrollTrigger adds is swallowed by flex.

**Kept / rejected.** Kept the structure and made the parent a block container, with a `refresh()` after fonts load. The trace in `docs/perf` is what I trust over the claim: 300 frames over a five-second scrub at 4× CPU throttling, none over 25 ms, eleven layout events in total.

## Where the line sits

I let the model write scaffolding, stories, matrices, mock-data generators and the first draft of any component whose behaviour is fully defined by a Radix primitive. I write or rewrite by hand anything that touches focus management, form validation state and money formatting. I read every line that reaches the library's public surface, and I do not accept a claim about performance or accessibility without a trace, an axe run or a contrast number that one command in this repo can reproduce.
