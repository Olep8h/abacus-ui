import js from "@eslint/js"
import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import jsxA11y from "eslint-plugin-jsx-a11y"
import reactHooks from "eslint-plugin-react-hooks"
import storybook from "eslint-plugin-storybook"
import tseslint from "typescript-eslint"

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/storybook-static/**",
    "**/dist/**",
    "**/next-env.d.ts",
    "packages/ui/src/tokens/tokens.generated.ts",
  ]),

  // Node scripts.
  {
    files: ["scripts/**/*.mjs", "packages/ui/scripts/**/*.mjs"],
    extends: [js.configs.recommended],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },

  // Library + Storybook: plain TS/React rules, no Next.js assumptions.
  {
    files: ["packages/**/*.{ts,tsx}", "apps/docs/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.stories.tsx"],
    extends: [storybook.configs["flat/recommended"]],
  },

  // Demo app: Next.js rules scoped to apps/demo only.
  {
    files: ["apps/demo/**/*.{ts,tsx}"],
    extends: [...nextVitals, ...nextTs],
    settings: { next: { rootDir: "apps/demo" } },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
    },
  },
])
