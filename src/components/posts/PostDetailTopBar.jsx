/** Post detail page: back button plus owner edit/delete buttons or the non-owner "more" (report) menu. */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, MoreHorizontal, Flag } from "lucide-react";
import { DROP_IN, FOCUS_RING, MENU, MENU_ITEM, PRESS, SOFT_TRANSITION } from "./postUi";

const ROUND_BTN = `p-2 bg-white/5 hover:bg-white/10 rounded-full border border-line-soft hover:border-line ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING}`;

export default function PostDetailTopBar({
    postId,
    isOwner,
    isEditing,
    showPostMenu,
    onTogglePostMenu,
    reportedPost,
    onReportPost,
    onDeletePost,
}) {
    const navigate = useNavigate();

    return (
        <div className="px-4 mb-6 flex items-center justify-between">
            <button
                type="button"
                aria-label="Go back"
                onClick={() => navigate(-1)}
                className={`flex items-center gap-2 text-ink-300 hover:text-white rounded-full pr-2 group ${SOFT_TRANSITION} ${FOCUS_RING}`}
            >
                <div
                    className={`p-2 bg-white/5 rounded-full group-hover:bg-white/10 border border-line-soft group-hover:border-line ${SOFT_TRANSITION}`}
                >
                    <ArrowLeft size={18} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-2">
                {isOwner ? (
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Edit post"
                                    onClick={() => navigate(`/post/${postId}/edit`)}
                                    className={`${ROUND_BTN} text-blue-400/70 hover:text-blue-400`}
                                    title="Edit Post"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Delete post"
                                    onClick={onDeletePost}
                                    className={`${ROUND_BTN} text-red-400/70 hover:text-red-400`}
                                    title="Delete Post"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="relative post-menu-container">
                        <button
                            type="button"
                            aria-label="More options"
                            aria-haspopup="menu"
                            aria-expanded={showPostMenu}
                            onClick={onTogglePostMenu}
                            className={`${ROUND_BTN} text-ink-300 hover:text-white`}
                        >
                            <MoreHorizontal size={18} />
                        </button>
                        {showPostMenu && (
                            <div className={`${MENU} absolute right-0 mt-2 w-48 origin-top-right ${DROP_IN}`}>
                                <button
                                    onClick={reportedPost ? null : onReportPost}
                                    disabled={reportedPost}
                                    className={`${MENU_ITEM} ${
                                        reportedPost
                                            ? "text-ink-400 cursor-default"
                                            : "text-red-400 hover:bg-red-500/10"
                                    }`}
                                >
                                    <Flag size={14} />
                                    <span className="font-bold text-[11px] uppercase tracking-wider">
                                        {reportedPost ? "Reported" : "Report Post"}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
