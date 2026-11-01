import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
    it("names the missing path and offers a way back", () => {
        render(
            <MemoryRouter initialEntries={["/no-such-page"]}>
                <NotFoundPage />
            </MemoryRouter>,
        );
        expect(screen.getByText("Page not found")).toBeInTheDocument();
        expect(screen.getByText("/no-such-page")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Go to Feed" })).toHaveAttribute("href", "/home");
    });
});
