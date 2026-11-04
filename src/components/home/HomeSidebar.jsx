import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useUserContext } from "../../context/UserContext";
import * as connectionsApi from "../../api/connections";
import * as searchApi from "../../api/search";
import * as usersApi from "../../api/users";
import { avatarUrl } from "../../utils/avatar";
import { cachedRequest, invalidateCachedRequests } from "../../utils/requestCache";
import { FOCUS_RING, PRESS, SOFT_TRANSITION } from "../posts/postUi";

// Reused for a minute: coming back to Home (or switching to Search) doesn't reload them
const SIDEBAR_MAX_AGE_MS = 60000;

// Palette colours (the line is drawn in currentColor)
const SPARKLINE_COLORS = ["text-brand", "text-brand-pink", "text-brand-light", "text-brand-rose"];

const Sparkline = ({ color }) => (
    <svg
        width="60"
        height="24"
        viewBox="0 0 60 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${color} opacity-60 group-hover:opacity-90 transition-opacity duration-200 ease-soft`}
        aria-hidden="true"
    >
        <path
            d="M1 23L12 18L24 21L36 10L48 14L59 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const HomeSidebar = () => {
    const { user: currentUser } = useUserContext();
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hashtags, setHashtags] = useState([]);
    const [hashtagsLoading, setHashtagsLoading] = useState(true);
    const [requested, setRequested] = useState(() => new Set());

    useEffect(() => {
        let cancelled = false;
        cachedRequest("suggested-users", () => usersApi.getSuggestedUsers(), SIDEBAR_MAX_AGE_MS)
            .then((data) => !cancelled && setSuggestedUsers(Array.isArray(data) ? data.slice(0, 3) : []))
            .catch((err) => console.error("Failed to fetch suggestions:", err))
            .finally(() => !cancelled && setLoading(false));

        // Most-used hashtags of the last 30 days
        cachedRequest("trending-hashtags", () => searchApi.getTrendingHashtags(), SIDEBAR_MAX_AGE_MS)
            .then((data) => !cancelled && setHashtags(data.hashtags || []))
            .catch((err) => console.error("Failed to fetch trending hashtags:", err))
            .finally(() => !cancelled && setHashtagsLoading(false));
        return () => {
            cancelled = true;
        };
    }, []);

    const handleConnect = async (userId) => {
        try {
            await connectionsApi.sendConnectionRequest(userId);
            setRequested((current) => new Set(current).add(userId));
            // Requested people drop out of suggestions on the server; don't show them again from the cache
            invalidateCachedRequests("suggested-users");
            invalidateCachedRequests(`hover-card:${userId}`);
        } catch (err) {
            // The API client already showed the reason
            console.error("Connect failed:", err);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="flex flex-col gap-8 w-full pt-2">
            {/* TRENDING */}
            <div className="px-1">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h3 className="text-[11px] font-black text-ink-300 uppercase tracking-[0.25em] flex items-center gap-2">
                        Trending
                    </h3>
                    <Link
                        to="/search?type=hashtags"
                        className={`text-[11px] font-bold text-brand-light hover:text-white rounded-sm flex items-center gap-1 ${SOFT_TRANSITION} ${FOCUS_RING}`}
                    >
                        See all <ChevronRight size={12} />
                    </Link>
                </div>

                <div className="flex flex-col gap-2">
                    {hashtagsLoading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-[52px] bg-white/5 rounded-xl motion-safe:animate-pulse" />
                        ))
                    ) : hashtags.length === 0 ? (
                        <p className="px-1 text-[12px] leading-relaxed text-ink-300">
                            No hashtags yet. Add a #tag to your next post.
                        </p>
                    ) : (
                        hashtags.map((item, idx) => (
                            <Link
                                key={item.tag}
                                to={`/search?q=${encodeURIComponent(`#${item.tag}`)}&type=posts`}
                                className={`flex items-center justify-between group cursor-pointer px-2 py-2 rounded-xl hover:bg-white/[0.03] no-underline ${SOFT_TRANSITION} ${FOCUS_RING}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-[28px] font-black text-white/20 group-hover:text-white/30 transition-colors duration-150 ease-soft leading-none w-6">
                                        {idx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-[13.5px] font-bold text-white group-hover:text-brand-light transition-colors duration-150 ease-soft tracking-tight">
                                            #{item.tag}
                                        </span>
                                        <span className="text-[10.5px] font-bold text-ink-300 mt-0.5 tracking-wide tabular-nums">
                                            {item.postsCount} {item.postsCount === 1 ? "post" : "posts"}
                                        </span>
                                    </div>
                                </div>
                                <Sparkline color={SPARKLINE_COLORS[idx % SPARKLINE_COLORS.length]} />
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* DISCOVER PEOPLE */}
            <div className="px-1">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h3 className="text-[11px] font-black text-ink-300 uppercase tracking-[0.25em]">Discover People</h3>
                    <Link
                        to="/search"
                        className={`text-[11px] font-bold text-brand-light hover:text-white rounded-sm flex items-center gap-1 ${SOFT_TRANSITION} ${FOCUS_RING}`}
                    >
                        Explore <ChevronRight size={12} />
                    </Link>
                </div>

                <div className="flex flex-col gap-2">
                    {loading
                        ? [1, 2, 3].map((i) => (
                              <div key={i} className="h-14 bg-white/5 rounded-xl motion-safe:animate-pulse" />
                          ))
                        : suggestedUsers.map((user) => (
                              <div
                                  key={user.id}
                                  className={`flex items-center justify-between group p-2 hover:bg-white/[0.03] rounded-xl border border-transparent hover:border-line-soft ${SOFT_TRANSITION}`}
                              >
                                  <Link
                                      to={`/public-profile/${user.id}`}
                                      className={`flex items-center gap-3 min-w-0 rounded-lg no-underline ${FOCUS_RING}`}
                                  >
                                      <img
                                          loading="lazy"
                                          decoding="async"
                                          src={avatarUrl(user.imageUrl)}
                                          className="w-10 h-10 rounded-full object-cover border border-line p-0.5 shrink-0 bg-surface-600"
                                          alt={`${user.firstname} ${user.lastname}`}
                                      />
                                      <div className="flex flex-col min-w-0">
                                          <span className="text-[13px] font-black text-white truncate group-hover:text-brand-light transition-colors duration-150 ease-soft tracking-tight">
                                              {user.firstname} {user.lastname}
                                          </span>
                                          <span className="text-[10px] text-ink-300 font-black uppercase tracking-tighter mt-0.5">
                                              New Discovery
                                          </span>
                                      </div>
                                  </Link>
                                  <button
                                      onClick={() => handleConnect(user.id)}
                                      disabled={requested.has(user.id)}
                                      className={`px-4 py-1.5 border border-brand/30 rounded-full text-[12px] font-bold text-brand-light hover:bg-gradient-to-r hover:from-brand hover:to-brand-pink hover:text-white hover:border-transparent bg-brand/10 hover:shadow-glow disabled:opacity-50 disabled:pointer-events-none ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING}`}
                                  >
                                      {requested.has(user.id) ? "Requested" : "Connect"}
                                  </button>
                              </div>
                          ))}
                </div>
            </div>

            {/* FOOTER */}
            <div className="px-2 pb-8 mt-4">
                <nav aria-label="Legal" className="flex items-center gap-4 mb-3">
                    <Link
                        to="/privacy"
                        className={`text-[11px] font-bold text-ink-300 hover:text-brand-light rounded-sm no-underline ${SOFT_TRANSITION} ${FOCUS_RING}`}
                    >
                        Privacy
                    </Link>
                    <Link
                        to="/terms"
                        className={`text-[11px] font-bold text-ink-300 hover:text-brand-light rounded-sm no-underline ${SOFT_TRANSITION} ${FOCUS_RING}`}
                    >
                        Terms
                    </Link>
                </nav>
                <p className="text-[11px] text-ink-500 font-black tracking-widest uppercase">
                    © {new Date().getFullYear()} CLIQ
                </p>
            </div>
        </div>
    );
};

export default HomeSidebar;
