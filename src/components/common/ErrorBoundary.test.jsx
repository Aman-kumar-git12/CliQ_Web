import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

const Crash = () => {
    throw new Error("boom");
};

describe("ErrorBoundary", () => {
    it("renders its children when nothing goes wrong", () => {
        render(
            <ErrorBoundary>
                <p>All good</p>
            </ErrorBoundary>,
        );
        expect(screen.getByText("All good")).toBeInTheDocument();
    });

    it("shows a recovery screen instead of a blank page when a child crashes", () => {
        vi.spyOn(console, "error").mockImplementation(() => {}); // React logs the caught error
        render(
            <ErrorBoundary>
                <Crash />
            </ErrorBoundary>,
        );
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Go to Feed" })).toHaveAttribute("href", "/home");
    });
});
