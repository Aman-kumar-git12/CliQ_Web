/** Post detail page: like / comments / repost / save / share bar, or Cancel / Save buttons while editing. */
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import RepostControl from "./RepostControl";

export default function PostDetailActionBar({
    post,
    actions,
    currentUserId,
    isEditing,
    isSavingEdit,
    onCancelEdit,
    onSaveEdit,
    liked,
    likesCount,
    onToggleLike,
    showComments,
    onToggleComments,
    activeTooltip,
    onTooltipEnter,
    onTooltipLeave,
    onLikesMouseEnter,
    onLikesMouseLeave,
}) {
    return (
        <div className="flex items-center justify-between py-4 border-y border-white/[0.05]">
            {isEditing ? (
                <div className="flex justify-end gap-3 w-full">
                    <button
                        onClick={onCancelEdit}
                        disabled={isSavingEdit}
                        className="px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition font-bold text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSaveEdit}
                        disabled={isSavingEdit}
                        className="px-6 py-2 rounded-full bg-brand hover:bg-[#7c3aed] text-white transition font-bold shadow-lg disabled:opacity-50 text-sm"
                    >
                        {isSavingEdit ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            ) : (
                <>
                    <button
                        type="button"
                        aria-label={liked ? "Unlike" : "Like"}
                        aria-pressed={liked}
                        onClick={onToggleLike}
                        onMouseEnter={(e) => {
                            onTooltipEnter("like");
                            onLikesMouseEnter(e);
                        }}
                        onMouseLeave={() => {
                            onTooltipLeave();
                            onLikesMouseLeave();
                        }}
                        className={`flex items-center gap-1.5 group relative transition-colors ${liked ? "text-[var(--cliq-pink)]" : "text-ink-350 hover:text-[var(--cliq-pink)]"}`}
                    >
                        <div
                            className={`p-2 rounded-full transition-colors ${liked ? "bg-[var(--cliq-pink)]/10" : "group-hover:bg-[var(--cliq-pink)]/10"}`}
                        >
                            <Heart
                                size={20}
                                fill={liked ? "currentColor" : "none"}
                                strokeWidth={liked ? 0 : 2}
                                className="group-hover:scale-110 transition-transform"
                            />
                        </div>
                        {likesCount > 0 && <span className="text-[13px] font-bold">{likesCount}</span>}
                        {/* Tooltip */}
                        <span
                            className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-100 ${activeTooltip === "like" ? "opacity-100 -translate-y-1" : "opacity-0 translate-y-0"}`}
                        >
                            Like
                        </span>
                    </button>

                    <button
                        type="button"
                        aria-label={showComments ? "Hide comments" : "Show comments"}
                        aria-expanded={showComments}
                        onClick={onToggleComments}
                        onMouseEnter={() => onTooltipEnter("comments")}
                        onMouseLeave={onTooltipLeave}
                        className={`flex items-center gap-1.5 group relative transition-colors ${showComments ? "text-brand" : "text-ink-350 hover:text-brand"}`}
                    >
                        <div
                            className={`p-2 rounded-full transition-colors ${showComments ? "bg-brand/10" : "group-hover:bg-brand/10"}`}
                        >
                            <MessageCircle
                                size={20}
                                fill={showComments ? "currentColor" : "none"}
                                strokeWidth={showComments ? 0 : 2}
                                className="group-hover:scale-110 transition-transform"
                            />
                        </div>
                        {post.comments > 0 && <span className="text-[13px] font-bold">{post.comments}</span>}
                        {/* Tooltip */}
                        <span
                            className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-100 ${activeTooltip === "comments" ? "opacity-100 -translate-y-1" : "opacity-0 translate-y-0"}`}
                        >
                            Comments
                        </span>
                    </button>

                    <RepostControl
                        post={post}
                        actions={actions}
                        currentUserId={currentUserId}
                        size={20}
                        className="p-2 rounded-full hover:bg-emerald-500/10"
                    />

                    <button
                        onClick={actions.toggleSave}
                        aria-pressed={actions.isSaved}
                        aria-label={actions.isSaved ? "Remove from saved" : "Save post"}
                        className={`p-2 rounded-full transition-colors ${actions.isSaved ? "text-brand-light bg-brand/10" : "text-ink-350 hover:text-brand-light hover:bg-brand/10"}`}
                    >
                        <Bookmark size={20} fill={actions.isSaved ? "currentColor" : "none"} />
                    </button>

                    <button
                        onClick={actions.share}
                        aria-label="Share"
                        className="p-2 rounded-full text-ink-350 hover:text-brand hover:bg-brand/10 transition-colors"
                    >
                        <Share2 size={20} />
                    </button>
                </>
            )}
        </div>
    );
}
