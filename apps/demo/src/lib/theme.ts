export type Theme = "light" | "dark"

export const THEME_STORAGE_KEY = "abacus-theme"
const THEME_EVENT = "abacus:theme"

/** Inline in <head>: applies a persisted explicit theme before first paint. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})()`

export function resolveTheme(): Theme {
  const explicit = document.documentElement.getAttribute("data-theme")
  if (explicit === "light" || explicit === "dark") return explicit
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* storage unavailable: the attribute still applies for this session */
  }
  window.dispatchEvent(new Event(THEME_EVENT))
}

export function subscribeTheme(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", onChange)
  window.addEventListener(THEME_EVENT, onChange)
  return () => {
    media.removeEventListener("change", onChange)
    window.removeEventListener(THEME_EVENT, onChange)
  }
}
