import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as usersApi from "../../api/users";
import { DEFAULT_AVATAR } from "../../utils/avatar";

// "@par" right before the caret, not preceded by a word char (so emails don't trigger it).
const ACTIVE_MENTION_REGEX = /(?:^|[^\p{L}\p{N}_.])@([\p{L}\p{M}\p{N}_.]*)$/u;

/**
 * Text field with @mention autocomplete. Picking a suggestion inserts
 * "@handle " and reports the chosen user ids (still present in the text)
 * through `onMentionIdsChange`, so the server can tell apart users who
 * share a handle.
 */
const MentionTextarea = forwardRef(function MentionTextarea(
    {
        value,
        onChange,
        onMentionIdsChange,
        multiline = true,
        className = "",
        dropdownClassName = "",
        onKeyDown,
        ...props
    },
    ref,
) {
    const inputRef = useRef(null);
    const picksRef = useRef(new Map()); // handle -> user id
    const [query, setQuery] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const blurTimerRef = useRef(null);

    useImperativeHandle(ref, () => inputRef.current);

    useEffect(() => () => clearTimeout(blurTimerRef.current), []);

    // Report the picked ids whose @handle is still in the text.
    useEffect(() => {
        if (!onMentionIdsChange) return;
        const text = String(value || "").toLowerCase();
        const ids = [...picksRef.current.entries()]
            .filter(([handle]) => text.includes(`@${handle}`))
            .map(([, id]) => id);
        onMentionIdsChange([...new Set(ids)]);
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (query === null || query.length === 0) {
            setSuggestions([]);
            return;
        }
        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const data = await usersApi.getMentionSuggestions(query);
                if (!cancelled) {
                    setSuggestions(Array.isArray(data) ? data : []);
                    setActiveIndex(0);
                }
            } catch {
                if (!cancelled) setSuggestions([]);
            }
        }, 200);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query]);

    const updateQuery = (text, caret) => {
        const match = text.slice(0, caret).match(ACTIVE_MENTION_REGEX);
        setQuery(match ? match[1] : null);
    };

    const handleChange = (e) => {
        onChange(e.target.value);
        updateQuery(e.target.value, e.target.selectionStart ?? e.target.value.length);
    };

    const pick = (user) => {
        const el = inputRef.current;
        const text = String(value || "");
        const caret = el?.selectionStart ?? text.length;
        const before = text.slice(0, caret).replace(/@[\p{L}\p{M}\p{N}_.]*$/u, `@${user.handle} `);
        const next = before + text.slice(caret).replace(/^\S*/, "");
        picksRef.current.set(user.handle, user.id);
        onChange(next);
        setQuery(null);
        setSuggestions([]);
        requestAnimationFrame(() => {
            el?.focus();
            el?.setSelectionRange(before.length, before.length);
        });
    };

    const open = query !== null && suggestions.length > 0;

    const handleKeyDown = (e) => {
        if (open) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const step = e.key === "ArrowDown" ? 1 : -1;
                setActiveIndex((i) => (i + step + suggestions.length) % suggestions.length);
                return;
            }
            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                pick(suggestions[activeIndex]);
                return;
            }
            if (e.key === "Escape") {
                e.preventDefault();
                setQuery(null);
                return;
            }
        }
        onKeyDown?.(e);
    };

    const Field = multiline ? "textarea" : "input";

    return (
        <div className="relative w-full">
            <Field
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onClick={(e) => updateQuery(e.target.value, e.target.selectionStart ?? 0)}
                onBlur={() => {
                    clearTimeout(blurTimerRef.current);
                    blurTimerRef.current = setTimeout(() => setQuery(null), 150);
                }}
                className={className}
                aria-autocomplete="list"
                aria-expanded={open}
                {...props}
            />
            {open && (
                <ul
                    role="listbox"
                    className={`absolute left-0 top-full mt-1 z-[120] w-full max-w-xs rounded-xl border border-white/10 bg-surface-750 shadow-2xl overflow-hidden ${dropdownClassName}`}
                >
                    {suggestions.map((user, i) => (
                        <li key={user.id} role="option" aria-selected={i === activeIndex}>
                            <button
                                type="button"
                                // mousedown fires before the field's blur closes the list
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    pick(user);
                                }}
                                onMouseEnter={() => setActiveIndex(i)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left ${i === activeIndex ? "bg-violet-500/15" : "hover:bg-white/5"}`}
                            >
                                <img
                                    loading="lazy"
                                    decoding="async"
                                    src={user.imageUrl || DEFAULT_AVATAR}
                                    alt=""
                                    className="w-7 h-7 rounded-full object-cover"
                                />
                                <span className="min-w-0">
                                    <span className="block text-[13px] font-bold text-white truncate">
                                        {user.firstname} {user.lastname}
                                    </span>
                                    <span className="block text-[11px] text-ink-350 truncate">@{user.handle}</span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

export default MentionTextarea;
