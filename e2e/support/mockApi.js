/*
 * A fake CliQ backend for end-to-end tests. The app is started with VITE_BACKEND_URL=API_ORIGIN (see
 * playwright.config.js); nothing listens there, and every request to it is answered here with page.route.
 * Response shapes follow the WebsiteBackend controllers. Anything not mocked gets a 404 (and is logged), so a
 * new call shows up in the test output instead of hanging. Socket.IO can't connect: chat sends stay optimistic.
 */
import { test as base, expect } from "@playwright/test";
import { API_ORIGIN } from "./constants.js";

export { API_ORIGIN };
export const VALID_PASSWORD = "correct-horse-battery";

export const ME = {
    id: "64b000000000000000000001",
    firstname: "Asha",
    lastname: "Verma",
    email: "asha@example.com",
    age: 27,
    role: "user",
    authProvider: "local",
    emailVerified: true,
    isBlocked: false,
    imageUrl: null,
};

export const FRIEND = {
    id: "64b000000000000000000002",
    firstname: "Rohan",
    lastname: "Mehta",
    email: "rohan@example.com",
    imageUrl: null,
};

let postSeq = 0;
/** A post as the backend's postPresenter formats it */
export const makePost = (author, content) => ({
    id: `64c0000000000000000000${String(++postSeq).padStart(2, "0")}`,
    userId: author.id,
    content,
    image: null,
    video: null,
    linkPreview: null,
    mentionIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    username: `${author.firstname} ${author.lastname}`,
    handle: author.firstname.toLowerCase(),
    avatar: "https://example.invalid/avatar.png",
    likes: 0,
    comments: 0,
    repostsCount: 0,
    isLiked: false,
    isReported: false,
    isSaved: false,
    isReposted: false,
    hashtags: [],
    mentions: [],
    isRepost: false,
    isQuote: false,
    repostOf: null,
});

/**
 * Installs the fake backend on a page.
 * @param {import("@playwright/test").Page} page
 * @param {{ loggedIn?: boolean, posts?: object[], chatHistory?: object[] }} [options]
 */
export async function mockApi(page, { loggedIn = false, posts = [], chatHistory = [] } = {}) {
    const state = { loggedIn, posts: [...posts], chatHistory: [...chatHistory] };

    // Third-party requests (avatar CDN, sticker images, fonts) are refused: tests stay offline and fast, and a slow
    // CDN can't hold up the page's load event. Registered first, so the API route below takes precedence.
    await page.route(
        (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
        (route) => route.abort(),
    );

    await page.route(`${API_ORIGIN}/**`, async (route) => {
        const request = route.request();
        const method = request.method();
        const { pathname } = new URL(request.url());
        const origin = request.headers().origin || "*";
        // Cross-origin with credentials: the browser needs these on every response
        const headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };
        const reply = (json, status = 200) => route.fulfill({ status, headers, json });

        if (method === "OPTIONS") return route.fulfill({ status: 204, headers });
        // Socket.IO polling: refuse, the app keeps working without live updates
        if (pathname.startsWith("/socket.io")) return route.abort();

        const body = request.postDataJSON?.() ?? null;
        const key = `${method} ${pathname}`;

        // --- auth ---
        if (key === "GET /auth/me") return reply({ user: state.loggedIn ? ME : null });
        if (key === "POST /login") {
            if (body?.email === ME.email && body?.password === VALID_PASSWORD) {
                state.loggedIn = true;
                return reply({ message: "Login successful", user: ME });
            }
            return reply({ message: "Invalid credentials" }, 401);
        }
        if (key === "POST /logout") {
            state.loggedIn = false;
            return reply({ message: "Logout successful" });
        }
        if (!state.loggedIn) return reply({ message: "Authentication required" }, 401);

        // --- feed and posts ---
        if (key === "POST /post/feed/random") return reply({ hasMore: false, posts: state.posts });
        if (key === "GET /post/feed/following" || key === "GET /post/feed/trending") {
            return reply({ page: 1, hasMore: false, posts: [] });
        }
        if (key === "POST /create/post") {
            const post = makePost(ME, body?.content ?? "");
            state.posts = [post, ...state.posts];
            return reply(post);
        }

        // --- sidebar, navigation badges, notifications, background warm-up of the matcher ---
        if (key === "GET /request/smart-users") return reply([]);
        if (key === "GET /user/search/suggested") return reply([]);
        if (key === "GET /search/trending-hashtags") return reply({ hashtags: [] });
        if (key === "GET /user/requests") return reply({ connectionRequests: [] });
        if (key === "GET /notifications") return reply({ notifications: [], unreadCount: 0, nextCursor: null });

        // --- chat ---
        if (key === "GET /chat/conversations") {
            return reply([
                {
                    id: "conv-1",
                    targetUserId: FRIEND.id,
                    name: `${FRIEND.firstname} ${FRIEND.lastname}`,
                    imageUrl: FRIEND.imageUrl,
                    lastMessage: state.chatHistory.at(-1)?.text ?? "Start a new chat",
                    lastMessageTime: new Date().toISOString(),
                    unread: false,
                },
            ]);
        }
        if (key === `GET /chat/history/${FRIEND.id}`) return reply(state.chatHistory);
        if (key === `GET /user/${FRIEND.id}`) return reply({ user: FRIEND });
        if (key === `GET /user/connections/${FRIEND.id}`) return reply({ status: "accepted" });
        if (method === "GET" && pathname.startsWith("/message-ai/")) return reply([]);

        console.warn(`[mockApi] not mocked: ${key}`);
        return reply({ message: `Not mocked in e2e: ${key}` }, 404);
    });

    return state;
}

/** A chat message as GET /chat/history returns it */
export const makeMessage = (sender, text, minutesAgo = 5) => ({
    id: `msg-${sender.id}-${minutesAgo}`,
    text,
    senderId: sender.id,
    image: null,
    file: null,
    isDelete: false,
    isMe: sender.id === ME.id,
    parentMessage: null,
    createdAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
});

/**
 * `test` with the intro splash screen already marked as seen, so it never covers the page.
 */
export const test = base.extend({
    page: async ({ page }, use) => {
        await page.addInitScript(() => window.sessionStorage.setItem("splashSeen", "true"));
        await use(page);
        // Mock handlers still running when the test ends must not hold up closing the page
        await page.unrouteAll({ behavior: "ignoreErrors" });
    },
});

export { expect };
