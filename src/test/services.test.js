import { beforeEach, describe, expect, it } from "vitest";
import axiosClient from "../api/axiosClient";
import * as authApi from "../api/auth";
import * as postsApi from "../api/posts";
import * as connectionsApi from "../api/connections";
import * as chatApi from "../api/chat";
import * as searchApi from "../api/search";
import * as notificationsApi from "../api/notifications";

// Every service is one HTTP call: check it sends the right request and returns only the response body.
let lastRequest;

beforeEach(() => {
    lastRequest = null;
    axiosClient.defaults.adapter = async (config) => {
        lastRequest = config;
        return { data: { ok: true, url: config.url }, status: 200, statusText: "OK", headers: {}, config };
    };
});

const sent = () => ({
    method: lastRequest.method,
    url: lastRequest.url,
    params: lastRequest.params,
    body:
        lastRequest.data === undefined
            ? undefined
            : typeof lastRequest.data === "string"
              ? JSON.parse(lastRequest.data)
              : lastRequest.data,
});

describe("service layer", () => {
    it("returns the response body, not the axios response", async () => {
        await expect(authApi.login({ email: "a@b.c", password: "x" })).resolves.toEqual({ ok: true, url: "/login" });
        expect(sent()).toMatchObject({ method: "post", url: "/login", body: { email: "a@b.c", password: "x" } });
    });

    it("builds URLs from ids", async () => {
        await postsApi.deletePost("p1");
        expect(sent()).toMatchObject({ method: "delete", url: "/delete/post/p1" });

        await chatApi.deleteAskHistoryItem("u1", "h9");
        expect(sent()).toMatchObject({ method: "delete", url: "/message-ai/ask-history/u1/h9" });

        await notificationsApi.markNotificationRead("n1");
        expect(sent()).toMatchObject({ method: "patch", url: "/notifications/n1/read" });
    });

    it("sends a connection request as 'interested' unless told otherwise", async () => {
        await connectionsApi.sendConnectionRequest("u2");
        expect(sent().url).toBe("/request/send/interested/u2");

        await connectionsApi.sendConnectionRequest("u2", "ignored");
        expect(sent().url).toBe("/request/send/ignored/u2");

        await connectionsApi.reviewConnectionRequest("accepted", "r1");
        expect(sent()).toMatchObject({ method: "post", url: "/request/review/accepted/r1" });
    });

    it("passes query parameters", async () => {
        await postsApi.getFollowingFeed("abc123");
        expect(sent()).toMatchObject({ method: "get", url: "/post/feed/following", params: { cursor: "abc123" } });

        await postsApi.getTrendingFeed(2);
        expect(sent()).toMatchObject({ method: "get", url: "/post/feed/trending", params: { page: 2 } });

        await searchApi.searchAll("react", "people");
        expect(sent()).toMatchObject({ url: "/search", params: { q: "react", type: "people" } });
    });

    it("keeps the caller's { silent: true } so the screen can show its own error", async () => {
        await postsApi.deletePost("p1", { silent: true });
        expect(lastRequest.silent).toBe(true);

        await postsApi.getTrendingFeed(1, { silent: true });
        expect(lastRequest.silent).toBe(true);
        expect(lastRequest.params).toEqual({ page: 1 });
    });

    it("uploads media as multipart form data", async () => {
        const form = new FormData();
        form.append("content", "hello");
        await postsApi.createPostWithMedia(form);
        expect(lastRequest.method).toBe("post");
        expect(lastRequest.url).toBe("/create/post");
        expect(lastRequest.data).toBeInstanceOf(FormData);
    });
});
