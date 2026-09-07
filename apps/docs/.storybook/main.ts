import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/react-vite"
import tailwindcss from "@tailwindcss/vite"

const uiSrc = fileURLToPath(new URL("../../../packages/ui/src", import.meta.url))
const uiTsconfig = fileURLToPath(new URL("../../../packages/ui/tsconfig.json", import.meta.url))

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../../../packages/ui/src/**/*.mdx",
    "../../../packages/ui/src/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "storybook-addon-pseudo-states"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: uiTsconfig,
      include: [`${uiSrc}/**/*.tsx`],
      exclude: ["**/*.stories.tsx", "**/*.test.tsx", "**/*-matrix.tsx", "**/*.sample.ts"],
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()]
    return viteConfig
  },
}

export default config
