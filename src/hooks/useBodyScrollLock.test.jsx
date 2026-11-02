import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useBodyScrollLock } from "./useBodyScrollLock";

const Lock = ({ active }) => {
    useBodyScrollLock(active);
    return null;
};

afterEach(() => {
    document.body.style.overflow = "";
});

describe("useBodyScrollLock", () => {
    it("keeps the page locked until the last open overlay closes", () => {
        const first = render(<Lock active />);
        const second = render(<Lock active />);
        expect(document.body.style.overflow).toBe("hidden");

        first.unmount();
        expect(document.body.style.overflow).toBe("hidden");
        second.unmount();
        expect(document.body.style.overflow).toBe("");
    });

    it("leaves the page alone while inactive", () => {
        document.body.style.overflow = "auto";
        const { unmount } = render(<Lock active={false} />);
        unmount();
        expect(document.body.style.overflow).toBe("auto");
    });

    it("a closed dialog mounting or unmounting does not unlock the page under an open one", () => {
        const open = render(<ConfirmDialog isOpen onClose={() => {}} onConfirm={() => {}} title="Delete?" />);
        const closed = render(<ConfirmDialog isOpen={false} onClose={() => {}} onConfirm={() => {}} title="Other" />);
        expect(document.body.style.overflow).toBe("hidden");
        closed.unmount();
        expect(document.body.style.overflow).toBe("hidden");
        open.unmount();
        expect(document.body.style.overflow).toBe("");
    });
});
