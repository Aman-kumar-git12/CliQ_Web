import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useUserContext } from "../../context/UserContext";
import * as connectionsApi from "../../api/connections";
import * as searchApi from "../../api/search";
import * as usersApi from "../../api/users";
import { avatarUrl } from "../../utils/avatar";

const SPARKLINE_COLORS = ["#6600FF", "#FF3399", "#00E0FF", "#7928CA", "#22C55E"];

const Sparkline = ({ color }) => (
    <svg
        width="60"
        height="24"
        viewBox="0 0 60 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-60"
        aria-hidden="true"
    >
        <path
            d="M1 23L12 18L24 21L36 10L48 14L59 1"
            stroke={color}
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
        usersApi
            .getSuggestedUsers()
            .then((data) => setSuggestedUsers(data.slice(0, 3)))
            .catch((err) => console.error("Failed to fetch suggestions:", err))
            .finally(() => setLoading(false));

        // Most-used hashtags of the last 30 days
        searchApi
            .getTrendingHashtags()
            .then((data) => setHashtags(data.hashtags || []))
            .catch((err) => console.error("Failed to fetch trending hashtags:", err))
            .finally(() => setHashtagsLoading(false));
    }, []);

    const handleConnect = async (userId) => {
        try {
            await connectionsApi.sendConnectionRequest(userId);
            setRequested((current) => new Set(current).add(userId));
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
                    <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.25em] flex items-center gap-2">
                        Trending
                    </h3>
                    <Link
                        to="/search?type=hashtags"
                        className="text-[11px] font-bold text-brand-light hover:text-white transition-colors flex items-center gap-1"
                    >
                        See all <ChevronRight size={12} />
                    </Link>
                </div>

                <div className="flex flex-col gap-6">
                    {hashtagsLoading ? (
                        [1, 2, 3].map((i) => <div key={i} className="h-9 bg-white/5 rounded-xl animate-pulse" />)
                    ) : hashtags.length === 0 ? (
                        <p className="px-1 text-[12px] text-white/40">No hashtags yet. Add a #tag to your next post.</p>
                    ) : (
                        hashtags.map((item, idx) => (
                            <Link
                                key={item.tag}
                                to={`/search?q=${encodeURIComponent(`#${item.tag}`)}&type=posts`}
                                className="flex items-center justify-between group cursor-pointer px-1 no-underline"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-[28px] font-black text-white/20 leading-none w-6">
                                        {idx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-[13.5px] font-bold text-white group-hover:text-brand-light transition-colors tracking-tight">
                                            #{item.tag}
                                        </span>
                                        <span className="text-[10px] font-bold text-white/40 mt-0.5 tracking-wide">
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
                    <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.25em]">
                        Discover People
                    </h3>
                    <Link
                        to="/search"
                        className="text-[11px] font-bold text-brand-light hover:text-white transition-colors flex items-center gap-1"
                    >
                        Explore <ChevronRight size={12} />
                    </Link>
                </div>

                <div className="flex flex-col gap-4">
                    {loading
                        ? [1, 2, 3].map((i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)
                        : suggestedUsers.map((user) => (
                              <div
                                  key={user.id}
                                  className="flex items-center justify-between group p-2 hover:bg-white/[0.02] rounded-xl transition-all border border-transparent hover:border-white/5"
                              >
                                  <Link
                                      to={`/public-profile/${user.id}`}
                                      className="flex items-center gap-3 min-w-0 no-underline"
                                  >
                                      <img
                                          src={avatarUrl(user.imageUrl)}
                                          className="w-10 h-10 rounded-full object-cover border border-white/10 p-0.5 shrink-0"
                                          alt={`${user.firstname} ${user.lastname}`}
                                      />
                                      <div className="flex flex-col min-w-0">
                                          <span className="text-[13px] font-black text-white truncate group-hover:text-[var(--cliq-lilac)] transition-colors tracking-tight">
                                              {user.firstname} {user.lastname}
                                          </span>
                                          <span className="text-[10px] text-white/40 font-black uppercase tracking-tighter mt-0.5">
                                              New Discovery
                                          </span>
                                      </div>
                                  </Link>
                                  <button
                                      onClick={() => handleConnect(user.id)}
                                      disabled={requested.has(user.id)}
                                      className="px-4 py-1.5 border border-brand/30 rounded-full text-[12px] font-bold text-brand-light hover:bg-gradient-to-r hover:from-brand hover:to-brand-pink hover:text-white hover:border-transparent transition-all active:scale-95 bg-brand/10 shadow-[0_0_10px_rgba(139,92,246,0.1)] disabled:opacity-50 disabled:pointer-events-none"
                                  >
                                      {requested.has(user.id) ? "Requested" : "Connect"}
                                  </button>
                              </div>
                          ))}
                </div>
            </div>

            {/* FOOTER */}
            <div className="px-2 pb-8 mt-4">
                <p className="text-[11px] text-white/20 font-black tracking-widest uppercase">
                    © {new Date().getFullYear()} CLIQ
                </p>
            </div>
        </div>
    );
};

export default HomeSidebar;
