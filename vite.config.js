import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.js"],
        // Tests talk to mocked modules only; nothing reaches a real backend
        restoreMocks: true,
    },
    build: {
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
            output: {
                // Libraries every page needs get stable shared chunks (cached across deploys). Everything else
                // stays with the code that imports it, so lazy pages and pickers download their own libraries.
                manualChunks(id) {
                    if (!id.includes("node_modules")) return undefined;
                    if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id))
                        return "vendor-react";
                    if (id.includes("lucide-react")) return "vendor-icons";
                    if (id.includes("framer-motion")) return "vendor-animation";
                    return undefined;
                },
            },
        },
    },
});
