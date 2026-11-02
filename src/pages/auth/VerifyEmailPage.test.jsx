import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../api/auth", () => ({ verifyEmail: vi.fn() }));
vi.mock("../../context/UserContext", () => ({ useUserContext: () => ({ setUser: () => {} }) }));

import * as authApi from "../../api/auth";
import VerifyEmailPage from "./VerifyEmailPage";

describe("VerifyEmailPage", () => {
    it("shows placeholder lines instead of a spinner while the link is checked", () => {
        vi.mocked(authApi.verifyEmail).mockReturnValue(new Promise(() => {}));
        const { container } = render(
            <MemoryRouter initialEntries={["/verify-email?token=abc"]}>
                <VerifyEmailPage />
            </MemoryRouter>,
        );
        expect(screen.getByRole("status", { name: "Verifying your email" })).toBeInTheDocument();
        expect(container.querySelector(".animate-spin")).toBeNull();
    });

    it("shows the error and a way to log in when the link fails", async () => {
        vi.mocked(authApi.verifyEmail).mockRejectedValue({ response: { data: { message: "Link expired" } } });
        render(
            <MemoryRouter initialEntries={["/verify-email?token=abc"]}>
                <VerifyEmailPage />
            </MemoryRouter>,
        );
        expect(await screen.findByText("Link expired")).toBeInTheDocument();
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Go to Login" })).toBeInTheDocument();
    });
});
