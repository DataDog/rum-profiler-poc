// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/main.ts"),
      name: "DD_RUM_PROFILER",
      // the proper extensions will be added
      fileName: "main",
    },
    rollupOptions: {
      plugins: [
        typescript({
          rootDir: resolve(__dirname, "src"),
          declaration: true,
          declarationDir: resolve(__dirname, "dist"),
          exclude: resolve(__dirname, "node_modules/**"),
        }),
      ],
    },
  },
});
