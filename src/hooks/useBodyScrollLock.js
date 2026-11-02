import { useEffect } from "react";

// How many open overlays currently want the page locked. Shared by every caller, so closing (or
// unmounting) one dialog doesn't unlock the page under another dialog that is still open, and a
// dialog that is mounted closed never touches the page at all.
let lockCount = 0;
let previousOverflow = "";

const lock = () => {
    if (lockCount === 0) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }
    lockCount += 1;
};

const unlock = () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) document.body.style.overflow = previousOverflow;
};

/**
 * Stops the page behind a modal from scrolling while `active` is true.
 * @param {boolean} active
 */
export const useBodyScrollLock = (active) => {
    useEffect(() => {
        if (!active) return undefined;
        lock();
        return unlock;
    }, [active]);
};

export default useBodyScrollLock;
