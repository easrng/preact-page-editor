import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { visualizer } from "rollup-plugin-visualizer";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.tsx",
  output: {
    file: "dist/editor.js",
    format: "iife",
  },
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
    }),
    copy({
      targets: [
        { src: "src/index.html", dest: "dist" },
        { src: "src/style", dest: "dist" },
      ],
    }),
    nodeResolve({
      browser: true,
    }),
    commonjs(),
    process.env.MINIFY && terser(),
    visualizer({
      filename: "dist/stats.html",
    }),
  ],
};
