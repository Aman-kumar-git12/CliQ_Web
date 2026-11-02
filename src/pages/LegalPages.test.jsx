import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import TermsPage from "./TermsPage";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

const renderAt = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("legal pages", () => {
    it("Privacy Policy names the cookie, the providers and how to delete an account", () => {
        renderAt(<PrivacyPolicyPage />);
        // Text queries, not role queries: role lookups on a page this long are slow in jsdom
        expect(screen.getByText("Privacy Policy", { selector: "h1" })).toBeInTheDocument();
        expect(screen.getByText(/single essential cookie/)).toBeInTheDocument();
        for (const provider of ["MongoDB Atlas", "Cloudinary", "Brevo", "Groq"]) {
            expect(screen.getByText(provider)).toBeInTheDocument();
        }
        expect(screen.getByText(/Settings > Delete account/)).toBeInTheDocument();
        expect(screen.getAllByText("Terms of Service", { selector: "a" })[0]).toHaveAttribute("href", "/terms");
    });

    it("Terms of Service links back to the Privacy Policy", () => {
        renderAt(<TermsPage />);
        expect(screen.getByText("Terms of Service", { selector: "h1" })).toBeInTheDocument();
        expect(screen.getAllByText("Privacy Policy", { selector: "a" })[0]).toHaveAttribute("href", "/privacy");
    });

    it("login and signup show the legal links under the Google button", () => {
        renderAt(<GoogleAuthButton label="signin_with" />);
        expect(screen.getByText("Terms of Service", { selector: "a" })).toHaveAttribute("href", "/terms");
        expect(screen.getByText("Privacy Policy", { selector: "a" })).toHaveAttribute("href", "/privacy");
    });
});
