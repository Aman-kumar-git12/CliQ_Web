import { describe, expect, it } from "vitest";
import { pageTitle } from "./pageTitles";
import { avatarUrl, DEFAULT_AVATAR } from "./avatar";
import { formatSectionTitle, getViewerProfileNudge } from "./connectionPageHelpers";

describe("pageTitle", () => {
    it.each([
        ["/", "Sign up · CliQ"],
        ["/home", "Feed · CliQ"],
        ["/find/getconnection/history", "Explore · CliQ"],
        ["/profile/posts", "Your profile · CliQ"],
        ["/post/abc", "Post · CliQ"],
        ["/messages/123", "Messages · CliQ"],
        ["/privacy", "Privacy Policy · CliQ"],
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

describe("connection page helpers", () => {
    it("nudges thin profiles and stays quiet for complete ones", () => {
        expect(getViewerProfileNudge({ skills: "n/a", description: "****" })).toMatch(/Complete your profile/);
        expect(
            getViewerProfileNudge({ description: "Backend engineer", skills: ["Go", "SQL"], projects: "CliQ" }),
        ).toBeNull();
    });

    it("titles history sections", () => {
        expect(formatSectionTitle("my_interest")).toBe("My Current Interest");
        expect(formatSectionTitle(null)).toBe("Profiles");
    });
});
