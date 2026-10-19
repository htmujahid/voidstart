import { fileURLToPath } from "node:url";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";

const generated = [
  "dist/**",
  ".void/**",
  ".tanstack/**",
  "src/routeTree.gen.ts",
  "db/migrations/**",
];
const vendored = [
  "src/components/ui/**",
  // Dice UI data table (installed with the shadcn CLI)
  "src/components/data-table/**",
  "src/hooks/use-data-table.ts",
  "src/hooks/use-debounced-callback.ts",
  "src/lib/data-table-*.ts",
  "src/lib/format.ts",
  "src/lib/id.ts",
  ".agents/**",
  ".claude/**",
];

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    voidPlugin(),
    // voidPlugin aliases the "better-auth/client" prefix in dev, which also captures
    // "better-auth/client/plugins". Alias is first-match-wins, so this must come after it.
    {
      name: "better-auth-client-plugins",
      config: () => ({
        resolve: {
          alias: [
            {
              find: /^better-auth\/client\/plugins$/,
              replacement: fileURLToPath(import.meta.resolve("better-auth/client/plugins")),
            },
          ],
        },
      }),
    },
  ],
  fmt: {
    sortImports: {
      customGroups: [
        {
          groupName: "react",
          elementNamePattern: ["react", "react/**", "react-dom", "react-dom/**"],
        },
        { groupName: "tanstack", elementNamePattern: ["@tanstack/**"] },
      ],
      groups: [
        "builtin",
        "react",
        { newlinesBetween: false },
        "tanstack",
        { newlinesBetween: false },
        "external",
        ["internal", "subpath"],
        ["parent", "sibling", "index"],
        "style",
        "unknown",
      ],
    },
    ignorePatterns: [...generated, ...vendored, "pnpm-lock.yaml", "AGENTS.md"],
  },
  lint: {
    ignorePatterns: [...generated, ...vendored],
    plugins: ["typescript", "react", "jsx-a11y", "import", "promise", "oxc"],
    categories: { correctness: "error", suspicious: "warn" },
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "react/react-in-jsx-scope": "off",
      "react/set-state-in-effect": "warn",
      "jsx-a11y/control-has-associated-label": "off",
      "import/no-unassigned-import": "off",
      "typescript/no-unsafe-type-assertion": "off",
      "react/rules-of-hooks": "error",
      "react/exhaustive-deps": "warn",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
