const { resolve } = require("node:path");
const prettierConfig = require("eslint-config-prettier/flat");
const turboConfig = require("eslint-config-turbo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = [
  ...turboConfig.default,
  prettierConfig,
  eslintPluginPrettierRecommended,
  {
    // plugins: ["only-warn"],
    languageOptions: {
      globals: {
        React: true,
        JSX: true,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project,
        },
      },
    },
    files: ["*.js?(x)", "*.ts?(x)"],
  },
  // Should use global ignore config to apply to all rules
  {
    ignores: [
      // Ignore dotfiles
      ".*.js",
      "node_modules/",
      "dist/",
      "build/",
      "public/",
      "public/**",
      "public/**/*",
    ],
  },
];
