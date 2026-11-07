import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

const root = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
    resolve: {
        alias: [
            { find: /^client\//, replacement: resolve(root, "src/client") + "/" },
            { find: /^shared\//, replacement: resolve(root, "src/shared") + "/" },
        ],
    },
    build: {
        ssr: resolve(root, "src/server/server.ts"),
        outDir: resolve(root, "dist"),
        emptyOutDir: false,
        sourcemap: true,
        target: "node20",
        rollupOptions: {
            output: {
                entryFileNames: "server.js",
            },
        },
    },
})
