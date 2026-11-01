import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Hash, Heart, MessageCircle, Loader2, FileText } from "lucide-react";
import * as searchApi from "../api/search";
import * as usersApi from "../api/users";
import { timeAgo } from "../utils/timeAgo";
import PeopleCards from "../components/search/PeopleCards";
import { DEFAULT_AVATAR } from "../utils/avatar";

const TABS = [
    { key: "all", label: "All" },
    { key: "people", label: "People" },
    { key: "posts", label: "Posts" },
    { key: "hashtags", label: "Hashtags" },
];
const EMPTY_RESULTS = { people: [], posts: [], hashtags: [], semantic: { used: false, available: true } };

const SectionTitle = ({ icon: Icon, children }) => (
    <h2 className="flex items-center gap-2 text-[11px] font-black text-ink-450 uppercase tracking-[0.3em] mb-3">
        <Icon size={13} /> {children}
    </h2>
);

const PostResult = ({ post, onHashtag }) => (
    <div className="p-4 rounded-[18px] border border-white/5 bg-surface-800 hover:bg-white/[0.03] transition-colors">
        <Link to={`/public-profile/${post.user?.id}`} className="flex items-center gap-2.5 no-underline mb-2">
            <img
                src={post.user?.imageUrl || DEFAULT_AVATAR}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-white/10"
            />
            <span className="font-black text-[13px] text-white">
                {post.user?.firstname} {post.user?.lastname}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-550">
                {timeAgo(post.createdAt)}
            </span>
        </Link>
        <Link to={`/post/${post.id}`} className="block no-underline">
            <p className="text-[13px] text-white/85 leading-relaxed line-clamp-3 whitespace-pre-line">{post.content}</p>
            {post.image && (
                <img
                    src={post.image}
                    alt={`Post by ${[post.user?.firstname, post.user?.lastname].filter(Boolean).join(" ") || "user"}`}
                    className="mt-3 w-full max-h-64 object-cover rounded-xl border border-white/10"
                />
            )}
        </Link>
        <div className="flex items-center gap-4 mt-3 text-[11px] font-bold text-ink-450">
            <span className="flex items-center gap-1">
                <Heart size={12} /> {post.likesCount}
            </span>
            <span className="flex items-center gap-1">
                <MessageCircle size={12} /> {post.commentsCount}
            </span>
            {post.hashtags?.slice(0, 4).map((tag) => (
                <button key={tag} onClick={() => onHashtag(tag)} className="text-violet-300 hover:text-violet-200">
                    #{tag}
                </button>
            ))}
        </div>
    </div>
);

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const tab = TABS.some((t) => t.key === searchParams.get("type")) ? searchParams.get("type") : "all";

    const [input, setInput] = useState(query);
    const [results, setResults] = useState(EMPTY_RESULTS);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(true);

    // People to discover while the search box is empty (formerly the Find People tab)
    useEffect(() => {
        usersApi
            .getSuggestedUsers()
            .then((data) => setSuggestions(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Suggestions failed:", err))
            .finally(() => setSuggestionsLoading(false));
    }, []);

    // Keep the input in sync when the URL changes (back button, hashtag click).
    useEffect(() => setInput(query), [query]);

    const updateParams = (next) => {
        const params = { q: next.q ?? query, type: next.type ?? tab };
        if (!params.q) delete params.q;
        if (params.type === "all") delete params.type;
        setSearchParams(params, { replace: next.replace ?? false });
    };

    // Debounce typing into the URL.
    useEffect(() => {
        if (input.trim() === query) return;
        const timer = setTimeout(() => updateParams({ q: input.trim(), replace: true }), 350);
        return () => clearTimeout(timer);
    }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!query) {
            setResults(EMPTY_RESULTS);
            return;
        }
        let cancelled = false;
        setLoading(true);
        searchApi
            .searchAll(query, tab)
            .then((data) => {
                if (!cancelled) setResults({ ...EMPTY_RESULTS, ...data });
            })
            .catch((err) => {
                console.error("Search failed:", err);
                if (!cancelled) setResults(EMPTY_RESULTS);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [query, tab]);

    const searchHashtag = (tag) => updateParams({ q: `#${tag}`, type: "posts" });
    const show = (section) => tab === "all" || tab === section;
    const nothingFound =
        query && !loading && !results.people.length && !results.posts.length && !results.hashtags.length;

    return (
        <div className="w-full min-h-screen text-white px-4 md:px-0 pt-[90px] md:pt-10 pb-28 md:pb-10">
            <h1 className="text-[28px] md:text-[32px] font-black tracking-tighter uppercase italic leading-none mb-5">
                Search
            </h1>

            <div className="relative group mb-4">
                <Search
                    size={16}
                    strokeWidth={3}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-600 group-focus-within:text-brand transition-colors"
                />
                <input
                    autoFocus
                    type="search"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Try "React", "#ai" or "people who know React and ML"'
                    aria-label="Search posts, people and hashtags"
                    className="w-full pl-12 pr-5 py-3.5 rounded-[16px] bg-surface-800 border border-white/5 text-[14px] text-white placeholder-ink-550 focus:outline-none focus:border-brand/40 transition-colors"
                />
                {loading && (
                    <Loader2 size={16} className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-brand" />
                )}
            </div>

            <div className="flex gap-1.5 mb-6 overflow-x-auto">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => updateParams({ type: t.key })}
                        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] border transition-colors shrink-0
                            ${tab === t.key ? "bg-gradient-to-r from-violet-500/20 to-pink-500/15 border-violet-500/30 text-white" : "bg-white/[0.03] border-white/5 text-ink-300 hover:text-white"}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {!query && (
                <>
                    <p className="text-[13px] text-ink-450 mb-8">
                        Search people by name, skill or role, find posts, or look up a{" "}
                        <span className="text-violet-300">#hashtag</span>. Describe who you're looking for and AI
                        matching finds similar profiles.
                    </p>
                    <PeopleCards title="Suggested Network" users={suggestions} loading={suggestionsLoading} />
                </>
            )}

            {query && !results.semantic.available && show("people") && (
                <p className="text-[11px] text-amber-300/80 mb-4">
                    AI matching is unavailable right now. Showing keyword matches only.
                </p>
            )}

            {nothingFound && <p className="text-[13px] text-ink-450">No results for “{query}”.</p>}

            <div className="flex flex-col gap-8">
                {show("hashtags") && results.hashtags.length > 0 && (
                    <section>
                        <SectionTitle icon={Hash}>Hashtags</SectionTitle>
                        <div className="flex flex-wrap gap-2">
                            {results.hashtags.map(({ tag, postsCount }) => (
                                <button
                                    key={tag}
                                    onClick={() => searchHashtag(tag)}
                                    className="px-3.5 py-2 rounded-xl bg-surface-800 border border-white/5 hover:border-violet-500/30 text-[13px] font-bold"
                                >
                                    <span className="text-violet-300">#{tag}</span>
                                    <span className="text-ink-450 text-[11px] ml-2">
                                        {postsCount} {postsCount === 1 ? "post" : "posts"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {show("people") && results.people.length > 0 && (
                    <PeopleCards title="People" users={results.people} showMatchReasons />
                )}

                {show("posts") && results.posts.length > 0 && (
                    <section>
                        <SectionTitle icon={FileText}>Posts</SectionTitle>
                        <div className="flex flex-col gap-2.5">
                            {results.posts.map((post) => (
                                <PostResult key={post.id} post={post} onHashtag={searchHashtag} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
