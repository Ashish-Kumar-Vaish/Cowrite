import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ["events", "buffer", "stream", "util"],
      globals: {
        Buffer: true,
      },
    }),
  ],
  optimizeDeps: {
    include: [
      "@tiptap/extension-collaboration",
      "@tiptap/extension-collaboration-cursor",
      "yjs",
      "@hocuspocus/provider",
    ],
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
