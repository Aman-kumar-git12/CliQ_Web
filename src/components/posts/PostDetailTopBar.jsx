/** Post detail page: back button plus owner edit/delete buttons or the non-owner "more" (report) menu. */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, MoreHorizontal, Flag } from "lucide-react";

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
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-all border border-white/5">
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
                                    className="p-2 text-blue-400/60 hover:text-blue-400 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                                    title="Edit Post"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Delete post"
                                    onClick={onDeletePost}
                                    className="p-2 text-red-400/60 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
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
                            className="p-2 text-white/30 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                        >
                            <MoreHorizontal size={18} />
                        </button>
                        {showPostMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-surface-750 border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-3xl">
                                <button
                                    onClick={reportedPost ? null : onReportPost}
                                    disabled={reportedPost}
                                    className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                                        reportedPost ? "text-gray-500 cursor-default" : "text-red-500 hover:bg-white/5"
                                    }`}
                                >
                                    <Flag size={14} className={reportedPost ? "text-gray-500" : "text-red-500"} />
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
