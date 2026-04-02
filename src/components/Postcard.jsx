import { Heart, MessageSquare, Share2, MoreHorizontal, Globe, Repeat2 } from "lucide-react";
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
        <div ref={containerRef} className="cliq-feed-panel rounded-2xl p-3.5 mb-3 relative group transition-all duration-500 hover:border-violet-300/20 max-w-[560px] w-full mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                    <Link
                        to={currentUser?.id === post.userId ? "/profile" : `/public-profile/${post.userId}`}
                        className="relative w-9 h-9 shrink-0 group/avatar"
                        onMouseEnter={(e) => handleProfileMouseEnter(e, post.userId)}
                        onMouseLeave={handleProfileMouseLeave}
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#a78bfa] to-[#f472b6] rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity blur-sm" />
                        <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#f472b6] flex items-center justify-center border-2 border-black text-white font-black text-[11px] shadow-xl">
                            {post.username ? post.username.substring(0, 1).toUpperCase() : "A"}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-black border-2 border-[#0A0A0F] rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        </div>
                    </Link>
                    <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-2">
                            <Link
                                to={currentUser?.id === post.userId ? "/profile" : `/public-profile/${post.userId}`}
                                className="font-black text-[14px] text-white hover:text-[var(--cliq-lilac)] transition-colors tracking-tight"
                            >
                                {post.username || "Anonymous"}
                            </Link>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#8b86a6] uppercase tracking-widest leading-none">
                            <span>{post.time || "4 months ago"}</span>
                            <span className="text-neutral-700">•</span>
                            <div className="flex items-center gap-1 text-blue-500/80">
                                <Globe size={9} strokeWidth={3} />
                                <span className="font-black">Public</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1.5 hover:bg-white/5 rounded-full transition text-[#8b86a6] hover:text-white"
                >
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {/* Content Area */}
            <div className="px-0.5">
                <Link to={`/post/${post.id}`} className="block mb-2">
                    <p className="text-[12.5px] text-[#ebe7f7] leading-[1.6] whitespace-pre-wrap font-medium">
                        {text}
                    </p>
                </Link>

                {/* Media Area */}
                {(() => {
                    const imgSrc = post.image || post.images;
                    const videoSrc = post.video;
                    const images = Array.isArray(imgSrc) ? imgSrc : imgSrc ? [imgSrc] : [];

                    if (images.length === 0 && !videoSrc) return null;

                    return (
                        <Link to={`/post/${post.id}`} className="relative flex justify-center w-full rounded-lg overflow-hidden border border-white/8 bg-[#050505] mb-2 group/media">
                            {videoSrc ? (
                                <video src={videoSrc} controls className="w-full max-h-[400px] object-contain" />
                            ) : (
                                images.map((img, i) => (
                                    <img key={i} src={img} className="w-full max-h-[400px] h-auto object-contain" alt="post" />
                                ))
                            )}

                            {/* Overlay caption concept - making it look like the image */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                                <p className="text-[11px] font-bold text-white/90 drop-shadow-md">
                                    {post.caption || "The face of resilience 🍋"}
                                </p>
                            </div>
                        </Link>
                    );
                })()}

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1 mb-2">
                    {["#motivation", "#growth", "#devlife"].map(tag => (
                        <span key={tag} className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-300/10 rounded-full text-[8.5px] font-black text-[#9e8bff] uppercase tracking-tighter hover:bg-violet-500/15 transition-colors cursor-pointer">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t cliq-feed-divider px-0.5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        onMouseEnter={handleLikesMouseEnter}
                        onMouseLeave={handleLikesMouseLeave}
                        className={`flex items-center gap-2 transition group ${liked ? 'text-[var(--cliq-pink)]' : 'text-[#8b86a6] hover:text-white'}`}
                    >
                        <Heart size={16} fill={liked ? "currentColor" : "none"} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black">{likesCount}</span>
                    </button>

                    <button
                        onClick={() => navigate(`/post/${post.id}`)}
                        onMouseEnter={handleCommentsMouseEnter}
                        onMouseLeave={handleCommentsMouseLeave}
                        className="flex items-center gap-2 text-[#8b86a6] hover:text-white transition group"
                    >
                        <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black">{post.comments}</span>
                    </button>

                    <button className="flex items-center gap-2 text-[#8b86a6] hover:text-white transition group">
                        <Repeat2 size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black">18</span>
                    </button>
                </div>

                <div className="flex items-center gap-1.5 text-[#8b86a6] hover:text-white transition cursor-pointer group">
                    <Share2 size={14} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">Share</span>
                </div>
            </div>

            {/* Toast & Tooltips (Keeping functionality) */}
            {showToast && <Toastbar message={toastMessage} onClose={() => setShowToast(false)} />}
            <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} onReport={handleReportPost} isReporting={isReporting} />
            <ProfileHoverCard userId={hoverUserId} isVisible={showHoverCard} anchorRect={hoverAnchorRect} onMouseEnter={handleCardMouseEnter} onMouseLeave={handleProfileMouseLeave} />
            <CommentsHoverCard postId={post.id} isVisible={showCommentsHover} anchorRect={commentsAnchorRect} onMouseEnter={handleCommentsCardMouseEnter} onMouseLeave={handleCommentsMouseLeave} />
            <LikesHoverCard postId={post.id} isVisible={showLikesHover} anchorRect={likesAnchorRect} onMouseEnter={handleLikesCardMouseEnter} onMouseLeave={handleLikesMouseLeave} />
        </div>
    );
};

export default PostCard;
