import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

// Same URL rule as the backend: the first http(s) link, minus trailing punctuation.
const URL_REGEX = /\bhttps?:\/\/[^\s<>"'`]+/i;
export const extractFirstUrl = (text) => {
    const match = String(text || "").match(URL_REGEX);
    return match ? match[0].replace(/[).,!?;:'"\]]+$/, "") : null;
};

/** Debounced preview of the first link in `text`, for composers. */
export const useLinkPreview = (text, delay = 600) => {
    const url = extractFirstUrl(text);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!url) {
            setPreview(null);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await axiosClient.get("/link-preview", { params: { url } });
                if (!cancelled) setPreview(res.data.preview || null);
            } catch {
                if (!cancelled) setPreview(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, delay);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [url, delay]);

    return { preview, loading };
};
