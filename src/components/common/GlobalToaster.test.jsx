import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GlobalToaster from "./GlobalToaster";
import { showErrorToast } from "../../utils/toast";

describe("GlobalToaster", () => {
    it("shows a toast sent with showErrorToast and hides it after a few seconds", async () => {
        // Only the auto-hide timer is faked; the exit animation then runs on real animation frames
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
        render(<GlobalToaster />);

        act(() => showErrorToast("Upload failed"));
        expect(screen.getByText("Upload failed")).toBeInTheDocument();

        act(() => vi.advanceTimersByTime(10000));
        vi.useRealTimers();
        await waitFor(() => expect(screen.queryByText("Upload failed")).not.toBeInTheDocument());
    });

    it("shows the same message only once while it is on screen", () => {
        render(<GlobalToaster />);
        act(() => {
            showErrorToast("Can't reach CliQ");
            showErrorToast("Can't reach CliQ");
            showErrorToast("Can't reach CliQ");
        });
        expect(screen.getAllByText("Can't reach CliQ")).toHaveLength(1);
    });

    it("keeps at most three toasts", () => {
        render(<GlobalToaster />);
        act(() => ["one", "two", "three", "four"].forEach((m) => showErrorToast(m)));
        expect(screen.queryByText("one")).not.toBeInTheDocument();
        expect(screen.getByText("four")).toBeInTheDocument();
    });
});
