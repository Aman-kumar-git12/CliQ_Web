import { useEffect, useRef } from "react";

/**
 * Calls `onEscape` when the Escape key is pressed while `active` is true (e.g. to close a modal).
 *
 * @param {boolean} active Listen only while this is true (usually the modal's `isOpen`).
 * @param {(event: KeyboardEvent) => void} onEscape Called with the keydown event.
 */
export const useEscapeKey = (active, onEscape) => {
    const handlerRef = useRef(onEscape);
    handlerRef.current = onEscape;

    useEffect(() => {
        if (!active) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") handlerRef.current?.(event);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [active]);
};

export default useEscapeKey;
