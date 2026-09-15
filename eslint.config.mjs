import js from "@eslint/js"
import next from "@next/eslint-plugin-next"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", ".next/**", "dist/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      next: {
        rootDir: ["./"],
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "@next/next": next,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", ignoreRestSiblings: true }],
    },
  }
)
