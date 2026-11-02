import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../api/users", () => ({
    getMyProfile: vi.fn(),
    updateExpertise: vi.fn(),
    generateAiExpertise: vi.fn(),
}));

import * as usersApi from "../api/users";
import ExpertiseStudioPage from "./ExpertiseStudioPage";

const renderPage = () =>
    render(
        <MemoryRouter>
            <ExpertiseStudioPage />
        </MemoryRouter>,
    );

describe("ExpertiseStudioPage loading", () => {
    it("shows the studio skeleton (and no Save button) while the saved expertise loads", () => {
        vi.mocked(usersApi.getMyProfile).mockReturnValue(new Promise(() => {}));
        renderPage();
        expect(screen.getByRole("status", { name: "Loading expertise studio" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Save Expertise/ })).not.toBeInTheDocument();
    });

    it("shows the form filled with the saved expertise once loaded", async () => {
        vi.mocked(usersApi.getMyProfile).mockResolvedValue({
            user: { firstname: "Ada", lastname: "Lovelace", email: "ada@example.com", expertise: null },
        });
        renderPage();
        expect(await screen.findByDisplayValue("Ada Lovelace")).toBeInTheDocument();
        expect(screen.queryByRole("status", { name: "Loading expertise studio" })).not.toBeInTheDocument();
    });
});
