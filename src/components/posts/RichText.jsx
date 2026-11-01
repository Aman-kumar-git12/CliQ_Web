import { Fragment } from "react";
import { Link } from "react-router-dom";

// Mirrors the backend parsers in WebsiteBackend/src/utils/contentUtils.js.
const TOKEN_REGEX = /(https?:\/\/[^\s<>"'`]+)|(#[\p{L}\p{M}\p{N}_]+)|((?<![\p{L}\p{N}_.])@[\p{L}\p{M}\p{N}_.]+)/gu;
const TRAILING_URL_PUNCTUATION = /[).,!?;:'"\]]+$/;

const stop = (e) => e.stopPropagation();

/**
 * Renders post/comment text with clickable #hashtags (→ search), @mentions
 * (only ones the server resolved, → profile) and links (new tab).
 */
export default function RichText({ text, mentions = [], currentUserId, className = "" }) {
    const content = String(text || "");
    if (!content) return null;

    const mentionByHandle = new Map(mentions.map((m) => [m.handle, m]));
    const parts = [];
    let lastIndex = 0;

    for (const match of content.matchAll(TOKEN_REGEX)) {
        const [raw, url, hashtag, mention] = match;
        let token = raw;
        let trailing = "";

        if (url) {
            token = raw.replace(TRAILING_URL_PUNCTUATION, "");
            trailing = raw.slice(token.length);
        } else if (mention) {
            token = raw.replace(/\.+$/, "");
            trailing = raw.slice(token.length);
        }

        if (match.index > lastIndex) parts.push(content.slice(lastIndex, match.index));
        const key = `${match.index}-${token}`;

        if (url) {
            parts.push(
                <a
                    key={key}
                    href={token}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    onClick={stop}
                    className="text-[#9e8bff] hover:underline break-all"
                >
                    {token.replace(/^https?:\/\/(www\.)?/, "")}
                </a>,
            );
        } else if (hashtag) {
            parts.push(
                <Link
                    key={key}
                    to={`/search?q=${encodeURIComponent(token)}&type=posts`}
                    onClick={stop}
                    className="text-[#9e8bff] font-bold hover:underline"
                >
                    {token}
                </Link>,
            );
        } else {
            const resolved = mentionByHandle.get(token.slice(1).toLowerCase());
            parts.push(
                resolved ? (
                    <Link
                        key={key}
                        to={resolved.id === currentUserId ? "/profile" : `/public-profile/${resolved.id}`}
                        onClick={stop}
                        className="text-[#f0abfc] font-bold hover:underline"
                    >
                        {token}
                    </Link>
                ) : (
                    token
                ),
            );
        }

        if (trailing) parts.push(trailing);
        lastIndex = match.index + raw.length;
    }
    if (lastIndex < content.length) parts.push(content.slice(lastIndex));

    return (
        <p className={`whitespace-pre-wrap break-words ${className}`}>
            {parts.map((part, i) => (typeof part === "string" ? <Fragment key={i}>{part}</Fragment> : part))}
        </p>
    );
}
