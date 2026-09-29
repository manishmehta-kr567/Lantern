import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import path from "path";

export default defineConfig({
  plugins: [react(), wasm()],
  build: {
    target: 'esnext'
  },
  resolve: {
    dedupe: [
      "@midnight-ntwrk/bboard-contract",
      "@midnight-ntwrk/compact-js",
      "@midnight-ntwrk/compact-runtime",
      "@midnight-ntwrk/ledger-v8",
      "@midnight-ntwrk/midnight-js-contracts",
      "@midnight-ntwrk/midnight-js-fetch-zk-config-provider",
      "@midnight-ntwrk/midnight-js-http-client-proof-provider",
      "@midnight-ntwrk/midnight-js-indexer-public-data-provider",
      "@midnight-ntwrk/midnight-js-level-private-state-provider",
      "@midnight-ntwrk/midnight-js-network-id",
      "@midnight-ntwrk/midnight-js-protocol",
      "@midnight-ntwrk/midnight-js-utils",
      "@midnight-ntwrk/onchain-runtime-v3",
      "@midnight-ntwrk/platform-js",
      "@midnight-ntwrk/wallet-sdk-address-format",
      "rxjs"
    ],
    alias: {
      "@midnight-ntwrk/bboard-contract": path.resolve(
        __dirname,
        "preprod-deployment/contracts/src/index.ts"
      )
    }
  },
  test: { environment: "jsdom", globals: true, exclude: ["scratch/**", "**/node_modules/**"] },
});
