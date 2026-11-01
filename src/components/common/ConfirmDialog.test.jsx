import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog", () => {
    it("renders nothing while closed", () => {
        render(<ConfirmDialog isOpen={false} onClose={() => {}} onConfirm={() => {}} title="Reset this list?" />);
        expect(screen.queryByText("Reset this list?")).not.toBeInTheDocument();
    });

    it("calls onConfirm or onClose from its buttons", async () => {
        const onConfirm = vi.fn();
        const onClose = vi.fn();
        render(
            <ConfirmDialog
                isOpen
                onClose={onClose}
                onConfirm={onConfirm}
                title="Reset this list?"
                confirmText="Yes, Reset"
            />,
        );
        expect(screen.getByText("Reset this list?")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Yes, Reset" }));
        expect(onConfirm).toHaveBeenCalledTimes(1);

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onClose).toHaveBeenCalled();
    });
});
