/** Post detail page: author avatar/name link with profile hover card triggers and the Follow button. */
import { Link } from "react-router-dom";
import { DEFAULT_AVATAR } from "../../utils/avatar";

export default function PostDetailAuthorRow({
    post,
    currentUserId,
    isOwner,
    connectionStatus,
    onFollow,
    onProfileMouseEnter,
    onProfileMouseLeave,
}) {
    return (
        <div className="flex items-center justify-between">
            <Link
                to={currentUserId === post.userId ? "/profile" : `/public-profile/${post.userId}`}
                className="flex items-center space-x-3 group"
                onMouseEnter={(e) => onProfileMouseEnter(e, post.userId)}
                onMouseLeave={onProfileMouseLeave}
            >
                <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-brand to-brand-rose rounded-full blur-sm opacity-50 group-hover:opacity-100 transition duration-300"></div>
                    <img
                        src={post.avatar || DEFAULT_AVATAR}
                        alt={post.username || "Post author"}
                        className="relative w-11 h-11 rounded-full object-cover border-2 border-black"
                    />
                </div>
                <div>
                    <h3 className="font-black text-[15px] text-white group-hover:text-[var(--cliq-lilac)] transition-colors tracking-tight">
                        {post.username}
                    </h3>
                    <p className="text-ink-350 text-[15px] leading-tight">
                        @{post.username?.replace(/\s+/g, "").toLowerCase() || "user"}
                    </p>
                </div>
            </Link>
            {!isOwner && (
                <button
                    onClick={onFollow}
                    disabled={connectionStatus === "accepted" || connectionStatus === "interested"}
                    className={`px-4 py-1.5 rounded-full text-[14px] font-bold transition-all duration-300 ${
                        connectionStatus === "accepted"
                            ? "bg-transparent border border-white/20 text-white cursor-default"
                            : connectionStatus === "interested"
                              ? "bg-transparent border border-white/20 text-white/60 cursor-default"
                              : "bg-white text-black hover:bg-gray-200"
                    }`}
                >
                    {connectionStatus === "accepted"
                        ? "Following"
                        : connectionStatus === "interested"
                          ? "Requested"
                          : "Follow"}
                </button>
            )}
        </div>
    );
}
