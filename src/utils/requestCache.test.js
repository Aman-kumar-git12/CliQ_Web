import { afterEach, describe, expect, it, vi } from "vitest";
import { cachedRequest, clearRequestCache, invalidateCachedRequests } from "./requestCache";
import { buildProfileUpdate } from "./profileUpdate";
import { likesCountAfterToggle } from "./postLikes";

afterEach(() => {
    clearRequestCache();
    vi.useRealTimers();
});

describe("cachedRequest", () => {
    it("shares one request between callers and reuses the answer while it is fresh", async () => {
        const load = vi.fn(() => Promise.resolve(["ada"]));
        const [a, b] = await Promise.all([cachedRequest("k", load, 1000), cachedRequest("k", load, 1000)]);
        expect(a).toEqual(["ada"]);
        expect(b).toBe(a);
        await cachedRequest("k", load, 1000);
        expect(load).toHaveBeenCalledTimes(1);
    });

    it("loads again once the answer is older than maxAgeMs", async () => {
        vi.useFakeTimers();
        const load = vi.fn(() => Promise.resolve(1));
        await cachedRequest("k", load, 1000);
        vi.advanceTimersByTime(1001);
        await cachedRequest("k", load, 1000);
        expect(load).toHaveBeenCalledTimes(2);
    });

    it("does not keep a failed request, so the next caller tries again", async () => {
        const load = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce("ok");
        await expect(cachedRequest("k", load, 1000)).rejects.toThrow("offline");
        await expect(cachedRequest("k", load, 1000)).resolves.toBe("ok");
    });

    it("forgets entries by key prefix", async () => {
        const load = vi.fn(() => Promise.resolve(1));
        await cachedRequest("hover-card:1", load, 1000);
        await cachedRequest("hover-card:2", load, 1000);
        invalidateCachedRequests("hover-card:1");
        await cachedRequest("hover-card:1", load, 1000);
        await cachedRequest("hover-card:2", load, 1000);
        expect(load).toHaveBeenCalledTimes(3);
    });
});

describe("buildProfileUpdate", () => {
    const original = { firstname: "Ada", lastname: "", age: 30, imageUrl: "https://img/a.png" };
    const form = { ...original, password: "", currentPassword: "" };

    it("sends nothing for an unchanged form (an empty last name from Google sign-up is not resent)", () => {
        expect(buildProfileUpdate(form, original)).toEqual({});
    });

    it("sends only the fields that changed", () => {
        expect(buildProfileUpdate({ ...form, firstname: " Grace ", age: "31" }, original)).toEqual({
            firstname: "Grace",
            age: 31,
        });
    });

    it("sends a new password with the current one", () => {
        expect(buildProfileUpdate({ ...form, password: "N3w-password!", currentPassword: "old" }, original)).toEqual({
            password: "N3w-password!",
            currentPassword: "old",
        });
    });

    it("never sends a cleared age or photo URL (the server would reject them)", () => {
        expect(buildProfileUpdate({ ...form, age: "", imageUrl: "" }, original)).toEqual({});
    });
});

describe("likesCountAfterToggle", () => {
    it("follows the server's answer from the count before the click", () => {
        expect(likesCountAfterToggle(false, 4, true)).toBe(5);
        expect(likesCountAfterToggle(true, 5, false)).toBe(4);
        expect(likesCountAfterToggle(false, 4, false)).toBe(4); // the server says nothing changed
        expect(likesCountAfterToggle(true, 0, false)).toBe(0);
    });
});
