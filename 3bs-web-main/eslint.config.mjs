import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "indent": ["error", 2],
      "semi": ["error", "always"],
      "prettier/prettier": ["error", { "semi": true, "tabWidth": 2, singleQuote: false }],
      "quotes": ["error", "double", { avoidEscape: true }]
    }
  },
  prettier,
  {
    plugins: {
      prettier: eslintPluginPrettier
    }
  }
];

export default eslintConfig;
