import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axiosClient, { SESSION_EXPIRED_EVENT } from "./axiosClient";
import { TOAST_EVENT } from "../utils/toast";

// Fake transport: each test says what the "server" answers, and we record what the client did.
let answer;
let requestCount;
const toasts = [];
let sessionExpired = 0;

const onToast = (e) => toasts.push(e.detail.message);
const onExpired = () => sessionExpired++;

beforeEach(() => {
    requestCount = 0;
    toasts.length = 0;
    sessionExpired = 0;
    axiosClient.defaults.adapter = async (config) => {
        requestCount++;
        return answer(config);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    vi.useFakeTimers();
});

afterEach(() => {
    window.removeEventListener(TOAST_EVENT, onToast);
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
    vi.useRealTimers();
});

const networkError = (config) => Object.assign(new Error("Network Error"), { config, isAxiosError: true });
const httpError = (status, data) => (config) => {
    throw Object.assign(new Error(`HTTP ${status}`), {
        config,
        response: { status, data, config },
        isAxiosError: true,
    });
};

describe("axiosClient error handling", () => {
    it("retries a failed read twice, then shows one 'can't reach' toast", async () => {
        answer = (config) => Promise.reject(networkError(config));
        const request = axiosClient.get("/posts").catch((e) => e);
        await vi.runAllTimersAsync();
        await request;
        expect(requestCount).toBe(3);
        expect(toasts).toEqual(["Can't reach CliQ right now. Check your connection and try again."]);
    });

    it("never retries a write, because the server may already have saved it", async () => {
        answer = (config) => Promise.reject(networkError(config));
        await axiosClient.post("/create/post", {}).catch(() => {});
        expect(requestCount).toBe(1);
        expect(toasts).toHaveLength(1);
    });

    it("treats a 401 as an ended session, without a toast", async () => {
        answer = httpError(401, { message: "Your session has ended." });
        await axiosClient.get("/profile").catch(() => {});
        expect(sessionExpired).toBe(1);
        expect(toasts).toHaveLength(0);
    });

    it("does not log out on a wrong password (401 from /login)", async () => {
        answer = httpError(401, { message: "Invalid credentials" });
        await axiosClient.post("/login", {}).catch(() => {});
        expect(sessionExpired).toBe(0);
        expect(toasts).toHaveLength(0);
    });

    it("shows the server's message when a write fails", async () => {
        answer = httpError(400, { message: "File is too large" });
        await axiosClient.post("/chat/upload", {}).catch(() => {});
        expect(toasts).toEqual(["File is too large"]);
    });

    it("stays quiet when the caller passes { silent: true }", async () => {
        answer = httpError(400, { message: "File is too large" });
        await axiosClient.post("/chat/upload", {}, { silent: true }).catch(() => {});
        expect(toasts).toHaveLength(0);
    });

    it("stays quiet for a read that fails with 404 (pages show their own empty state)", async () => {
        answer = httpError(404, { message: "Not found" });
        await axiosClient.get("/user/x").catch(() => {});
        expect(toasts).toHaveLength(0);
    });

    it("toasts when a read fails with a server error", async () => {
        answer = httpError(500, { message: "Something went wrong on our side. Please try again." });
        await axiosClient.get("/notifications").catch(() => {});
        expect(toasts).toEqual(["Something went wrong on our side. Please try again."]);
    });
});
