import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { configDefaults, defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"

const root = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
    resolve: {
        alias: [
            { find: /^client\//, replacement: resolve(root, "src/client") + "/" },
            { find: /^shared\//, replacement: resolve(root, "src/shared") + "/" },
        ],
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
    test: {
        globals: true,
        include: ["test/unit/**/*.spec.ts"],
        setupFiles: ["test/setup.ts"],
        exclude: [
            ...configDefaults.exclude,
            "test/unit/math.spec.ts",
            "test/unit/teletype-crdt.spec.ts",
            "test/unit/paths/Path.spec.ts",
            "test/unit/util/indexeddb.spec.ts",
        ],
        browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            viewport: {
                width: 1024,
                height: 768,
            },
        },
    },
})
