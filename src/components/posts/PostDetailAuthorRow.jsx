/** Post detail page: author avatar/name link with profile hover card triggers and the Follow button. */
import { Link } from "react-router-dom";
import { DEFAULT_AVATAR } from "../../utils/avatar";
import { FOCUS_RING, PRESS, SOFT_TRANSITION } from "./postUi";

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
                className={`flex items-center space-x-3 group rounded-full pr-2 ${FOCUS_RING}`}
                onMouseEnter={(e) => onProfileMouseEnter(e, post.userId)}
                onMouseLeave={onProfileMouseLeave}
            >
                <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-brand to-brand-rose rounded-full blur-sm opacity-40 group-hover:opacity-80 transition-opacity duration-200 ease-soft"></div>
                    <img
                        src={post.avatar || DEFAULT_AVATAR}
                        alt={post.username || "Post author"}
                        className="relative w-11 h-11 rounded-full object-cover border-2 border-black bg-surface-600"
                    />
                </div>
                <div>
                    <h3 className="font-black text-[15px] text-white group-hover:text-brand-light transition-colors duration-150 ease-soft tracking-tight">
                        {post.username}
                    </h3>
                    <p className="text-ink-300 text-[14px] leading-tight mt-0.5">
                        @{post.username?.replace(/\s+/g, "").toLowerCase() || "user"}
                    </p>
                </div>
            </Link>
            {!isOwner && (
                <button
                    onClick={onFollow}
                    disabled={connectionStatus === "accepted" || connectionStatus === "interested"}
                    className={`px-4 py-1.5 rounded-full text-[14px] font-bold ${SOFT_TRANSITION} ${FOCUS_RING} ${
                        connectionStatus === "accepted"
                            ? "bg-transparent border border-line-strong text-white cursor-default"
                            : connectionStatus === "interested"
                              ? "bg-transparent border border-line-strong text-white/60 cursor-default"
                              : `bg-white text-black hover:bg-ink-100 ${PRESS}`
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
