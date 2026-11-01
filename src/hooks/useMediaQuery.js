import { useEffect, useState } from "react";

const getMatches = (query) => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
};

/**
 * Tracks whether a CSS media query currently matches, and re-renders when it changes
 * (resize, rotation, zoom…).
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 767px)");
 *
 * @param {string} query A media query string, as accepted by `window.matchMedia`.
 * @returns {boolean} `true` while the query matches. Without `window`/`matchMedia` (SSR, old test
 *   environments) it returns `false`.
 */
export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() => getMatches(query));

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;

        const mediaQueryList = window.matchMedia(query);
        const handleChange = () => setMatches(mediaQueryList.matches);

        // Sync in case the query changed or the viewport changed before the listener was attached
        handleChange();

        if (typeof mediaQueryList.addEventListener === "function") {
            mediaQueryList.addEventListener("change", handleChange);
            return () => mediaQueryList.removeEventListener("change", handleChange);
        }
        // Safari < 14
        mediaQueryList.addListener(handleChange);
        return () => mediaQueryList.removeListener(handleChange);
    }, [query]);

    return matches;
};

export default useMediaQuery;
