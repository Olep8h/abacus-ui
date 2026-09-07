import { tokens, type Token } from "@abacus/ui/tokens"

const semanticColours = tokens.filter((t) => t.collection === "color")
const primitiveColours = tokens.filter((t) => t.collection === "color_primitives")
const sizes = tokens.filter((t) => t.collection === "size")
const typeScale = tokens.filter(
  (t) => t.collection === "typography_primitives" && t.path[0]?.startsWith("scale"),
)

function groupBy<T>(items: readonly T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    map.set(k, [...(map.get(k) ?? []), item])
  }
  return map
}

function Swatch({ token, theme }: { token: Token; theme: "light" | "dark" }) {
  return (
    <div data-theme={theme} className="flex items-center gap-200 bg-surface p-200 text-fg">
      <span
        aria-hidden="true"
        className="size-control-sm shrink-0 rounded-sm border border-line"
        style={{ background: `var(${token.cssVar})` }}
      />
      <code className="font-mono text-xs text-fg-secondary">
        {theme === "light" ? token.resolvedLight : token.resolvedDark}
      </code>
    </div>
  )
}

/** Semantic colour tokens: role → intent → step, light and dark side by side. */
export function ColorTokens() {
  const byRole = groupBy(semanticColours, (t) => t.path[0] ?? "")
  return (
    <div className="flex flex-col gap-800">
      {[...byRole.entries()].map(([role, list]) => (
        <section key={role} className="flex flex-col gap-300">
          <h3 className="text-lg font-semibold capitalize">{role}</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-fg-secondary">
                  <th className="p-200 font-medium">Token</th>
                  <th className="p-200 font-medium">Light</th>
                  <th className="p-200 font-medium">Dark</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.cssVar} className="border-t border-line">
                    <td className="p-200 align-top">
                      <code className="font-mono text-xs">{t.cssVar}</code>
                    </td>
                    <td className="p-0">
                      <Swatch token={t} theme="light" />
                    </td>
                    <td className="p-0">
                      <Swatch token={t} theme="dark" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

/** The raw ramps. Reachable from CSS, deliberately not from Tailwind utilities. */
export function PrimitiveRamps() {
  const byRamp = groupBy(primitiveColours, (t) => t.path[0] ?? "")
  return (
    <div className="flex flex-col gap-400">
      {[...byRamp.entries()].map(([ramp, list]) => (
        <div key={ramp} className="flex flex-col gap-100">
          <span className="text-sm font-medium capitalize">{ramp}</span>
          <div className="grid grid-cols-5 gap-100 sm:grid-cols-10">
            {list.map((t) => (
              <div key={t.cssVar} className="flex flex-col gap-050">
                <span
                  aria-hidden="true"
                  className="h-control-sm rounded-sm border border-line"
                  style={{ background: `var(${t.cssVar})` }}
                />
                <code className="font-mono text-xs text-fg-secondary">{t.path[1]}</code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Type scale rendered at its real size. */
export function TypeScale() {
  return (
    <div className="flex flex-col gap-300">
      {typeScale.map((t) => (
        <div key={t.cssVar} className="flex items-baseline gap-400 border-b border-line pb-200">
          <code className="w-1600 shrink-0 font-mono text-xs text-fg-secondary">
            {t.path[0]} · {t.resolvedLight}px
          </code>
          <span style={{ fontSize: `var(${t.cssVar})` }} className="truncate leading-tight">
            The quick brown fox
          </span>
        </div>
      ))}
    </div>
  )
}

/** Spacing, radius, stroke and icon sizes. */
export function SizeScale({ group }: { group: "space" | "radius" | "stroke" | "icon" }) {
  const list = sizes.filter((t) => t.path[0] === group && !t.path[1]?.startsWith("negative"))
  return (
    <div className="flex flex-col gap-200">
      {list.map((t) => (
        <div key={t.cssVar} className="flex items-center gap-400">
          <code className="w-1600 shrink-0 font-mono text-xs text-fg-secondary">
            {t.path.slice(1).join("-")} · {t.resolvedLight}px
          </code>
          {group === "radius" ? (
            <span
              aria-hidden="true"
              className="size-control-lg border border-line-secondary bg-brand-tertiary"
              style={{ borderRadius: `var(${t.cssVar})` }}
            />
          ) : (
            <span
              aria-hidden="true"
              className="h-200 rounded-sm bg-brand"
              style={{ width: `var(${t.cssVar})` }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
