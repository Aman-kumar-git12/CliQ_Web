import { describe, expect, it } from "vitest";
import { pageTitle } from "./pageTitles";
import { avatarUrl, DEFAULT_AVATAR } from "./avatar";

describe("pageTitle", () => {
    it.each([
        ["/", "Sign up · CliQ"],
        ["/home", "Feed · CliQ"],
        ["/find/getconnection/history", "Explore · CliQ"],
        ["/profile/posts", "Your profile · CliQ"],
        ["/post/abc", "Post · CliQ"],
        ["/messages/123", "Messages · CliQ"],
        ["/nope", "CliQ"],
        ["/searchx", "CliQ"], // a prefix must end at a path segment
    ])("%s → %s", (path, title) => {
        expect(pageTitle(path)).toBe(title);
    });
});

describe("avatarUrl", () => {
    it("uses the user's photo when there is one, otherwise the default", () => {
        expect(avatarUrl("https://img/x.png")).toBe("https://img/x.png");
        expect(avatarUrl(null)).toBe(DEFAULT_AVATAR);
        expect(avatarUrl("")).toBe(DEFAULT_AVATAR);
    });
});
