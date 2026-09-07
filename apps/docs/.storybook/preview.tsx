import type { Decorator, Preview } from "@storybook/react-vite"
import { useEffect, type ReactNode } from "react"

import "../src/globals.css"

function ThemeScope({ theme, children }: { theme: string; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])
  return children
}

const withTheme: Decorator = (Story, context) => (
  <ThemeScope theme={String(context.globals.theme ?? "light")}>
    <Story />
  </ThemeScope>
)

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Colour theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "centered",
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "error" },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ["Introduction", "Tokens", "Primitives", "Composed"],
      },
    },
  },
}

export default preview
