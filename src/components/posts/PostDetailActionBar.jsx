/** Post detail page: like / comments / repost / save / share bar, or Cancel / Save buttons while editing. */
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import RepostControl from "./RepostControl";
import { FOCUS_RING, ICON_FEEDBACK, PRESS, SOFT_TRANSITION } from "./postUi";

const TOOLTIP =
    "absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg transition duration-150 ease-soft pointer-events-none whitespace-nowrap z-popover shadow-pop";

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
        <div className="flex items-center justify-between py-3 border-y border-line-soft">
            {isEditing ? (
                <div className="flex justify-end gap-3 w-full">
                    <button
                        onClick={onCancelEdit}
                        disabled={isSavingEdit}
                        className={`px-4 py-2 rounded-full border border-line-strong text-white hover:bg-white/10 font-bold text-sm disabled:opacity-50 ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSaveEdit}
                        disabled={isSavingEdit}
                        className={`px-6 py-2 rounded-full bg-brand hover:bg-brand/85 text-white font-bold shadow-soft hover:shadow-glow disabled:opacity-50 text-sm ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING}`}
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
                        className={`flex items-center gap-1.5 group relative rounded-full ${SOFT_TRANSITION} ${FOCUS_RING} ${liked ? "text-[var(--cliq-pink)]" : "text-ink-300 hover:text-[var(--cliq-pink)]"}`}
                    >
                        <div
                            className={`p-2 rounded-full ${SOFT_TRANSITION} ${liked ? "bg-brand-pink/10" : "group-hover:bg-brand-pink/10"}`}
                        >
                            <Heart
                                size={20}
                                fill={liked ? "currentColor" : "none"}
                                strokeWidth={liked ? 0 : 2}
                                className={ICON_FEEDBACK}
                            />
                        </div>
                        {likesCount > 0 && <span className="text-[13px] font-bold tabular-nums">{likesCount}</span>}
                        {/* Tooltip */}
                        <span
                            className={`${TOOLTIP} ${activeTooltip === "like" ? "opacity-100 motion-safe:-translate-y-1" : "opacity-0"}`}
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
                        className={`flex items-center gap-1.5 group relative rounded-full ${SOFT_TRANSITION} ${FOCUS_RING} ${showComments ? "text-brand-light" : "text-ink-300 hover:text-brand-light"}`}
                    >
                        <div
                            className={`p-2 rounded-full ${SOFT_TRANSITION} ${showComments ? "bg-brand/10" : "group-hover:bg-brand/10"}`}
                        >
                            <MessageCircle
                                size={20}
                                fill={showComments ? "currentColor" : "none"}
                                strokeWidth={showComments ? 0 : 2}
                                className={ICON_FEEDBACK}
                            />
                        </div>
                        {post.comments > 0 && (
                            <span className="text-[13px] font-bold tabular-nums">{post.comments}</span>
                        )}
                        {/* Tooltip */}
                        <span
                            className={`${TOOLTIP} ${activeTooltip === "comments" ? "opacity-100 motion-safe:-translate-y-1" : "opacity-0"}`}
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
                        className={`group p-2 rounded-full ${SOFT_TRANSITION} ${FOCUS_RING} ${actions.isSaved ? "text-brand-light bg-brand/10" : "text-ink-300 hover:text-brand-light hover:bg-brand/10"}`}
                    >
                        <Bookmark
                            size={20}
                            fill={actions.isSaved ? "currentColor" : "none"}
                            className={ICON_FEEDBACK}
                        />
                    </button>

                    <button
                        onClick={actions.share}
                        aria-label="Share"
                        className={`group p-2 rounded-full text-ink-300 hover:text-brand-light hover:bg-brand/10 ${SOFT_TRANSITION} ${FOCUS_RING}`}
                    >
                        <Share2 size={20} className={ICON_FEEDBACK} />
                    </button>
                </>
            )}
        </div>
    );
}
