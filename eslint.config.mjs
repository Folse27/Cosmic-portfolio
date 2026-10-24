import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", ".claude/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Covers and logos are arbitrary CMS URLs (uploads or pasted links) and are
      // deliberately shown uncropped; see "Design decisions" in the README.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
