import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RouteShimmering from "./RouteShimmering";

// Each route's loading placeholder is that page's own skeleton (the one it also shows while its data loads)
describe("RouteShimmering", () => {
    it.each([
        ["/home", "Loading feed"],
        ["/profile", "Loading profile"],
        ["/public-profile/u1", "Loading profile"],
        ["/edit-profile", "Loading profile editor"],
        ["/settings", "Loading settings"],
        ["/find/getconnection", "Loading connections"],
        ["/requests", "Loading connection requests"],
        ["/notifications", "Loading notifications"],
        ["/search", "Loading search"],
        ["/saved", "Loading saved posts"],
        ["/post/p1", "Loading post"],
        ["/create/post", "Loading post editor"],
        ["/my-experties", "Loading expertise studio"],
        ["/messages/u1", "Loading conversation"],
        ["/no-such-page", "Loading page"],
    ])("%s shows a skeleton labelled %s", (pathname, label) => {
        render(<RouteShimmering pathname={pathname} />);
        const status = screen.getByRole("status", { name: label });
        expect(status).toHaveAttribute("aria-busy", "true");
    });

    it("never falls back to a spinner", () => {
        const { container } = render(<RouteShimmering pathname="/no-such-page" />);
        expect(container.querySelector(".animate-spin")).toBeNull();
    });
});
