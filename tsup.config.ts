import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,        // generate .d.ts
  sourcemap: true,
  clean: true,
  external: ["react"] // don’t bundle React
});
