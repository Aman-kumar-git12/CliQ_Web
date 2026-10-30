const UNITS = [
    ["y", 365 * 24 * 60 * 60],
    ["mo", 30 * 24 * 60 * 60],
    ["w", 7 * 24 * 60 * 60],
    ["d", 24 * 60 * 60],
    ["h", 60 * 60],
    ["m", 60],
];

export const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (!Number.isFinite(seconds) || seconds < 60) return "just now";
    for (const [label, size] of UNITS) {
        if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`;
    }
    return "just now";
};
