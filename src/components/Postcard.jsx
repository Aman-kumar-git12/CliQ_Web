import { Heart, MessageCircle, Repeat, Send, MoreHorizontal, Flag, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import Toastbar from "./Chat/Toastbar";
import ReportModal from "./ReportModal";
import ProfileHoverCard from "./Post/ProfileHoverCard";
import CommentsHoverCard from "./Post/CommentsHoverCard";
import LikesHoverCard from "./Post/LikesHoverCard";

// Custom Hook
import { usePostcard } from "./usePostcard";

const PostCard = ({ post }) => {
    const {
        liked, likesCount, showToast, setShowToast, toastMessage, showMenu, setShowMenu,
        showReportModal, setShowReportModal, isReporting, reported,
        hoverUserId, showHoverCard, hoverAnchorRect,
        showCommentsHover, commentsAnchorRect,
        showLikesHover, likesAnchorRect,
        containerRef, currentUser, navigate,

        handleProfileMouseEnter, handleProfileMouseLeave, handleCardMouseEnter,
        handleCommentsMouseEnter, handleCommentsMouseLeave, handleCommentsCardMouseEnter,
        handleLikesMouseEnter, handleLikesMouseLeave, handleLikesCardMouseEnter,
        handleMouseEnterTooltip, handleMouseLeaveTooltip,
        handleLike, handleActionClick, handleReportPost
    } = usePostcard(post);

    if (!post) return null;

    const text = post.text || post.content || "";

    return (
        <div ref={containerRef} className="flex flex-col mb-8 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg relative group p-4">
            <div className="flex gap-4">
                {/* LEFT: Avatar + Line */}
                <div className="flex flex-col items-center">
                    <Link
                        to={currentUser?.id === post.userId ? "/profile" : `/public-profile/${post.userId}`}
                        className="relative w-11 h-11 shrink-0"
                        onMouseEnter={(e) => handleProfileMouseEnter(e, post.userId)}
                        onMouseLeave={handleProfileMouseLeave}
                    >
                        <img
                            src={post.avatar || "https://github.com/shadcn.png"}
                            className="w-11 h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-800 shadow-sm"
                            alt="avatar"
                        />
                    </Link>
                    <div className="w-[2px] flex-1 bg-neutral-200 dark:bg-neutral-800 my-2 rounded-full" />
                </div>

                {/* RIGHT: CONTENT */}
                <div className="flex-1 min-w-0">
                    {/* Header: Username + Time */}
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <Link
                                to={currentUser?.id === post.userId ? "/profile" : `/public-profile/${post.userId}`}
                                className="font-bold text-sm text-black dark:text-white hover:underline transition-all"
                                onMouseEnter={(e) => handleProfileMouseEnter(e, post.userId)}
                                onMouseLeave={handleProfileMouseLeave}
                            >
                                {post.username || "Anonymous"}
                            </Link>
                            <span className="text-neutral-500 text-xs">•</span>
                            <span className="text-neutral-500 text-[11px]">{post.time || "Just now"}</span>
                        </div>

                        <div className="relative post-menu-container">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition text-neutral-500"
                            >
                                <MoreHorizontal size={18} />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!reported) setShowReportModal(true);
                                            setShowMenu(false);
                                        }}
                                        disabled={reported}
                                        className={`w-full px-4 py-3 text-left flex items-center gap-3 text-sm transition ${reported
                                            ? 'text-gray-400 cursor-default'
                                            : 'text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        <Flag size={16} className={reported ? 'text-gray-400' : 'text-red-500'} />
                                        {reported ? "Reported" : "Report"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MAIN CONTENT (Image & Text) */}
                    <Link to={`/post/${post.id}`} className="block">
                        <div className="px-0 py-1">
                            <p className="text-[15px] text-black dark:text-white leading-snug whitespace-pre-wrap mb-3">
                                {text}
                            </p>
                        </div>

                        {/* IMAGE AREA */}
                        {(() => {
                            const imgSrc = post.image || post.images;
                            const images = Array.isArray(imgSrc) ? imgSrc : imgSrc ? [imgSrc] : [];
                            if (images.length === 0) return null;
                            return (
                                <div className="w-full h-[500px] bg-neutral-100 dark:bg-neutral-950 rounded-xl flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-neutral-800 mb-3">
                                    {images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            className="w-full h-full object-contain"
                                            alt={`Post content ${i}`}
                                        />
                                    ))}
                                </div>
                            );
                        })()}
                    </Link>

                    {/* ACTIONS BAR */}
                    <div className="flex items-center gap-5 mt-2 text-neutral-500 dark:text-neutral-400">
                        <button
                            onClick={handleLike}
                            onMouseEnter={(e) => {
                                handleMouseEnterTooltip('like');
                                handleLikesMouseEnter(e);
                            }}
                            onMouseLeave={() => {
                                handleMouseLeaveTooltip();
                                handleLikesMouseLeave();
                            }}
                            className={`transition hover:scale-110 active:scale-90 ${liked ? 'text-rose-500' : 'hover:text-rose-500'}`}
                        >
                            <Heart size={20} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 2} />
                        </button>

                        <button
                            onClick={() => navigate(`/post/${post.id}`)}
                            onMouseEnter={(e) => {
                                handleMouseEnterTooltip('comments');
                                handleCommentsMouseEnter(e);
                            }}
                            onMouseLeave={() => {
                                handleMouseLeaveTooltip();
                                handleCommentsMouseLeave();
                            }}
                            className="hover:scale-110 active:scale-90 transition hover:text-blue-500"
                        >
                            <MessageCircle size={20} />
                        </button>

                        <button
                            onClick={(e) => handleActionClick(e, "Remix is on a break ☕")}
                            className="hover:scale-110 active:scale-90 transition hover:text-green-500"
                        >
                            <Repeat size={18} />
                        </button>

                        <button
                            onClick={(e) => handleActionClick(e, "Sharing... 📤")}
                            className="hover:scale-110 active:scale-90 transition hover:text-yellow-500 -rotate-12"
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    {/* LIKES & COMMENTS INFO */}
                    <div className="mt-3 flex flex-col gap-1">
                        {(likesCount > 0 || post.comments > 0) && (
                            <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium">
                                {likesCount > 0 && (
                                    <button
                                        className="hover:text-black dark:hover:text-white transition-colors"
                                        onMouseEnter={(e) => handleLikesMouseEnter(e)}
                                        onMouseLeave={handleLikesMouseLeave}
                                    >
                                        {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
                                    </button>
                                )}
                                {likesCount > 0 && post.comments > 0 && <span>•</span>}
                                {post.comments > 0 && (
                                    <button
                                        onClick={() => navigate(`/post/${post.id}`)}
                                        className="hover:text-black dark:hover:text-white transition-colors"
                                        onMouseEnter={(e) => handleCommentsMouseEnter(e)}
                                        onMouseLeave={handleCommentsMouseLeave}
                                    >
                                        {post.comments} comments
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showToast && (
                <Toastbar
                    message={toastMessage}
                    onClose={() => setShowToast(false)}
                />
            )}

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onReport={handleReportPost}
                isReporting={isReporting}
            />

            <ProfileHoverCard
                userId={hoverUserId}
                isVisible={showHoverCard}
                anchorRect={hoverAnchorRect}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
            />

            <CommentsHoverCard
                postId={post.id}
                isVisible={showCommentsHover}
                anchorRect={commentsAnchorRect}
                onMouseEnter={handleCommentsCardMouseEnter}
                onMouseLeave={handleCommentsMouseLeave}
            />

            <LikesHoverCard
                postId={post.id}
                isVisible={showLikesHover}
                anchorRect={likesAnchorRect}
                onMouseEnter={handleLikesCardMouseEnter}
                onMouseLeave={handleLikesMouseLeave}
            />
        </div>
    );
};

export default PostCard;
