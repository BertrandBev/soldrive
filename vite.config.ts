import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
// import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
// import rollupNodePolyFill from "rollup-plugin-node-polyfills";
// import inject from "@rollup/plugin-inject";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // base: mode == "development" ? "/" : "/soldrive", // gh-pages
  plugins: [vue()],
  define: {
    "process.env": process.env,
  },
  resolve: {
    alias: {
      // "node-fetch": "isomorphic-fetch",
      // process: "rollup-plugin-node-polyfills/polyfills/process",
      crypto: "crypto-browserify",
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      // util: "rollup-plugin-node-polyfills/polyfills/util",
    },
  },
  optimizeDeps: {
    disabled: false,
    esbuildOptions: {
      target: "esnext",
      // // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      // // Enable esbuild polyfill plugins
      plugins: [
        // NodeGlobalsPolyfillPlugin({
        //   buffer: true,
        //   // process: true,
        // }),
        // NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    target: "esnext",
    commonjsOptions: { include: [] },
    // rollupOptions: {
    //   plugins: [
    //     // Enable rollup polyfills plugin
    //     // used during production bundling
    //     // rollupNodePolyFill(),
    //     inject({ Buffer: ["buffer", "Buffer"] }),
    //   ],
    // },
  },
}));
