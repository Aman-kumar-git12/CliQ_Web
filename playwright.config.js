import { defineConfig, devices } from "@playwright/test";
import { API_ORIGIN } from "./e2e/support/constants.js";

// End-to-end tests run against a production build (vite preview) with a fake backend (e2e/support/mockApi.js):
// no real API, database or Socket.IO server is needed. The build goes to its own folder so dist/ is untouched.
const PORT = 4319;

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    // Lazy page chunks + mocked API: generous waits keep slow CI machines from flaking
    timeout: 60_000,
    expect: { timeout: 15_000 },
    reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: "retain-on-failure",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: `npx vite build --outDir dist-e2e --emptyOutDir && npx vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        // Always a fresh server: one started by hand would talk to the real backend from .env
        reuseExistingServer: false,
        timeout: 180_000,
        // Overrides .env: every API call goes to the mocked origin
        env: { VITE_BACKEND_URL: API_ORIGIN },
    },
});
