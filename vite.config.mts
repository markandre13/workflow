import { cpSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, type Plugin } from "vite"

const root = fileURLToPath(new URL(".", import.meta.url))

const aliases = [
    { find: /^client\//, replacement: resolve(root, "src/client") + "/" },
    { find: /^shared\//, replacement: resolve(root, "src/shared") + "/" },
]

// Assets referenced at runtime (cursor images, polyfills) are not part of the
// module graph, so they need to be copied to the build output manually.
function copyStaticAssets(): Plugin {
    return {
        name: "workflow:copy-static-assets",
        apply: "build",
        closeBundle() {
            for (const dir of ["img", "polyfill"]) {
                cpSync(resolve(root, dir), resolve(root, "dist", dir), { recursive: true })
            }
        },
    }
}

export default defineConfig({
    // The application is also deployed below a sub-path (e.g. GitHub Pages
    // serves it from /workflow/), so keep asset URLs relative.
    base: "./",
    resolve: {
        alias: aliases,
    },
    oxc: {
        jsx: {
            development: false,
        },
    },
    optimizeDeps: {
        rolldownOptions: {
            transform: {
                jsx: {
                    development: false,
                },
            },
        },
    },
    server: {
        open: true,
    },
    build: {
        outDir: "dist",
        sourcemap: true,
        target: "es2024",
    },
    plugins: [copyStaticAssets()],
})
