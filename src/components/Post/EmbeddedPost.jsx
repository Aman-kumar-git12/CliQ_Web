import { useNavigate } from "react-router-dom";
import RichText from "./RichText";
import { timeAgo } from "../../utils/timeAgo";

/** Compact original post shown inside a quote, or a placeholder if it was deleted. */
export default function EmbeddedPost({ post, currentUserId, clickable = true }) {
    const navigate = useNavigate();

    if (!post) {
        return (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[12px] text-[#8b86a6] italic mb-2">
                This post is no longer available.
            </div>
        );
    }

    const open = (e) => {
        if (!clickable) return;
        e.stopPropagation();
        navigate(`/post/${post.id}`);
    };

    return (
        <div
            onClick={open}
            role={clickable ? "link" : undefined}
            className={`rounded-xl border border-white/10 bg-white/[0.02] p-3 mb-2 ${clickable ? "cursor-pointer hover:bg-white/[0.04] transition-colors" : ""}`}
        >
            <div className="flex items-center gap-2 mb-1.5">
                <img src={post.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span className="text-[12px] font-black text-white truncate">{post.username}</span>
                <span className="text-[11px] text-[#8b86a6] truncate">@{post.handle}</span>
                <span className="text-[11px] text-[#8b86a6] shrink-0">· {timeAgo(post.createdAt)}</span>
            </div>
            <RichText text={post.content} mentions={post.mentions} currentUserId={currentUserId}
                className="text-[12px] text-[#d8d3ea] leading-relaxed line-clamp-4" />
            {post.image && <img src={post.image} alt="" className="mt-2 w-full max-h-[200px] object-cover rounded-lg" />}
            {!post.image && post.video && <video src={post.video} className="mt-2 w-full max-h-[200px] rounded-lg" muted />}
        </div>
    );
}
