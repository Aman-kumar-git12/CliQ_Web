import {
    Heart,
    MessageSquare,
    Share2,
    MoreHorizontal,
    Globe,
    Repeat2,
    Bookmark,
    Link2,
    Flag,
    ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import Toastbar from "../chat/Toastbar";
import ReportModal from "./ReportModal";
import ProfileHoverCard from "../profile/ProfileHoverCard";
import CommentsHoverCard from "./CommentsHoverCard";
import LikesHoverCard from "./LikesHoverCard";
import RichText from "./RichText";
import LinkPreviewCard from "./LinkPreviewCard";
import EmbeddedPost from "./EmbeddedPost";
import RepostControl from "./RepostControl";
import { usePostActions } from "../../hooks/usePostActions";
import { timeAgo } from "../../utils/timeAgo";

// Custom Hook
import { usePostcard } from "../../hooks/usePostCard";

const PostCard = ({ post }) => {
    // A plain repost renders the original; likes/comments/reposts act on it.
    const isPlainRepost = Boolean(post?.isRepost && !post?.isQuote);
    const target = isPlainRepost ? post.repostOf : post;

    const {
        liked,
        likesCount,
        showToast,
        setShowToast,
        toastMessage,
        toastType,
        notify,
        showMenu,
        setShowMenu,
        showReportModal,
        setShowReportModal,
        isReporting,
        reported,
        hoverUserId,
        showHoverCard,
        hoverAnchorRect,
        showCommentsHover,
        commentsAnchorRect,
        showLikesHover,
        likesAnchorRect,
        containerRef,
        currentUser,
        navigate,

        handleProfileMouseEnter,
        handleProfileMouseLeave,
        handleCardMouseEnter,
        handleCommentsMouseEnter,
        handleCommentsMouseLeave,
        handleCommentsCardMouseEnter,
        handleLikesMouseEnter,
        handleLikesMouseLeave,
        handleLikesCardMouseEnter,
        handleLike,
        handleReportPost,
    } = usePostcard(target || post);
    const actions = usePostActions(target || post, notify);

    if (!post) return null;

    const profilePath = (userId) => (currentUser?.id === userId ? "/profile" : `/public-profile/${userId}`);

    if (isPlainRepost && !target) {
        return (
            <div className="cliq-feed-panel rounded-2xl p-3.5 mb-3 max-w-[560px] w-full mx-auto">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-ink-350">
                    <Repeat2 size={13} /> {post.username} reposted a post that's no longer available.
                </p>
            </div>
        );
    }

    const openPost = () => navigate(`/post/${target.id}`);
    // The content area holds links (mentions, previews), so it can't be a <button>; keep it keyboard-operable
    const handleContentKeyDown = (e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPost();
        }
    };
    const images = target.image ? [target.image] : [];

    return (
        <div
            ref={containerRef}
            className="cliq-feed-panel rounded-2xl p-3.5 mb-3 relative group transition-all duration-500 hover:border-violet-300/20 max-w-[560px] w-full mx-auto"
        >
            {isPlainRepost && (
                <Link
                    to={profilePath(post.userId)}
                    className="flex items-center gap-1.5 mb-2 ml-1 text-[11px] font-bold text-ink-350 hover:text-emerald-400 transition-colors w-fit"
                >
                    <Repeat2 size={13} />
                    {currentUser?.id === post.userId ? "You reposted" : `${post.username} reposted`}
                </Link>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                    <Link
                        to={profilePath(target.userId)}
                        aria-label={`${target.username || "Anonymous"}'s profile`}
                        className="relative w-9 h-9 shrink-0 group/avatar"
                        onMouseEnter={(e) => handleProfileMouseEnter(e, target.userId)}
                        onMouseLeave={handleProfileMouseLeave}
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-tr from-brand-light to-brand-rose rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity blur-sm" />
                        <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-brand to-brand-rose flex items-center justify-center border-2 border-black text-white font-black text-[11px] shadow-xl">
                            {target.username ? target.username.substring(0, 1).toUpperCase() : "A"}
                        </div>
                    </Link>
                    <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-2">
                            <Link
                                to={profilePath(target.userId)}
                                className="font-black text-[14px] text-white hover:text-[var(--cliq-lilac)] transition-colors tracking-tight"
                            >
                                {target.username || "Anonymous"}
                            </Link>
                            <span className="text-[11px] text-ink-350 truncate">@{target.handle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-ink-350 uppercase tracking-widest leading-none">
                            <span title={new Date(target.createdAt).toLocaleString()}>{timeAgo(target.createdAt)}</span>
                            <span className="text-neutral-700">•</span>
                            <div className="flex items-center gap-1 text-blue-500/80">
                                <Globe size={9} strokeWidth={3} />
                                <span className="font-black">Public</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative post-menu-container">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        aria-label="Post options"
                        aria-haspopup="menu"
                        aria-expanded={showMenu}
                        className="p-1.5 hover:bg-white/5 rounded-full transition text-ink-350 hover:text-white"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                    {showMenu && (
                        <div
                            role="menu"
                            className="absolute right-0 mt-1 w-48 bg-surface-750 border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                            <button
                                role="menuitem"
                                onClick={() => {
                                    setShowMenu(false);
                                    actions.toggleSave();
                                }}
                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-[12px] font-bold text-white hover:bg-white/5"
                            >
                                <Bookmark size={14} fill={actions.isSaved ? "currentColor" : "none"} />{" "}
                                {actions.isSaved ? "Remove from saved" : "Save post"}
                            </button>
                            <button
                                role="menuitem"
                                onClick={() => {
                                    setShowMenu(false);
                                    actions.share();
                                }}
                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-[12px] font-bold text-white hover:bg-white/5"
                            >
                                <Link2 size={14} /> Copy link
                            </button>
                            <button
                                role="menuitem"
                                onClick={() => {
                                    setShowMenu(false);
                                    openPost();
                                }}
                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-[12px] font-bold text-white hover:bg-white/5"
                            >
                                <ExternalLink size={14} /> Open post
                            </button>
                            {currentUser?.id !== target.userId && (
                                <button
                                    role="menuitem"
                                    disabled={reported}
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowReportModal(true);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-[12px] font-bold ${reported ? "text-gray-500 cursor-default" : "text-red-400 hover:bg-white/5"}`}
                                >
                                    <Flag size={14} /> {reported ? "Reported" : "Report post"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div
                className="px-0.5 cursor-pointer"
                onClick={openPost}
                onKeyDown={handleContentKeyDown}
                role="link"
                tabIndex={0}
            >
                <RichText
                    text={target.content}
                    mentions={target.mentions}
                    currentUserId={currentUser?.id}
                    className="text-[12.5px] text-ink-100 leading-[1.6] font-medium mb-2"
                />

                {target.isQuote && <EmbeddedPost post={target.repostOf} currentUserId={currentUser?.id} />}

                {(images.length > 0 || target.video) && (
                    <div className="relative flex justify-center w-full rounded-lg overflow-hidden border border-white/8 bg-surface-950 mb-2">
                        {target.video ? (
                            <video
                                src={target.video}
                                controls
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-h-[400px] object-contain"
                            />
                        ) : (
                            images.map((img) => (
                                <img
                                    key={img}
                                    src={img}
                                    className="w-full max-h-[400px] h-auto object-contain"
                                    alt={`Post by ${target.username || "Anonymous"}`}
                                />
                            ))
                        )}
                    </div>
                )}

                {!images.length && !target.video && <LinkPreviewCard preview={target.linkPreview} />}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t cliq-feed-divider px-0.5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        onMouseEnter={handleLikesMouseEnter}
                        onMouseLeave={handleLikesMouseLeave}
                        aria-pressed={liked}
                        aria-label={`Like, ${likesCount} likes`}
                        className={`flex items-center gap-2 transition group ${liked ? "text-[var(--cliq-pink)]" : "text-ink-350 hover:text-white"}`}
                    >
                        <Heart
                            size={16}
                            fill={liked ? "currentColor" : "none"}
                            className="group-hover:scale-110 transition-transform"
                        />
                        <span className="text-[11px] font-black">{likesCount}</span>
                    </button>

                    <button
                        onClick={() => navigate(`/post/${target.id}?comment=true`)}
                        onMouseEnter={handleCommentsMouseEnter}
                        onMouseLeave={handleCommentsMouseLeave}
                        aria-label={`Comments, ${target.comments || 0} comments`}
                        className="flex items-center gap-2 text-ink-350 hover:text-white transition group"
                    >
                        <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black">{target.comments}</span>
                    </button>

                    <RepostControl post={target} actions={actions} currentUserId={currentUser?.id} />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={actions.toggleSave}
                        aria-pressed={actions.isSaved}
                        aria-label={actions.isSaved ? "Remove from saved" : "Save post"}
                        className={`transition group ${actions.isSaved ? "text-brand-light" : "text-ink-350 hover:text-white"}`}
                    >
                        <Bookmark
                            size={15}
                            fill={actions.isSaved ? "currentColor" : "none"}
                            className="group-hover:scale-110 transition-transform"
                        />
                    </button>
                    <button
                        onClick={actions.share}
                        className="flex items-center gap-1.5 text-ink-350 hover:text-white transition group"
                    >
                        <Share2 size={14} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Share</span>
                    </button>
                </div>
            </div>

            {showToast && <Toastbar message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
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
                postId={target.id}
                isVisible={showCommentsHover}
                anchorRect={commentsAnchorRect}
                onMouseEnter={handleCommentsCardMouseEnter}
                onMouseLeave={handleCommentsMouseLeave}
            />
            <LikesHoverCard
                postId={target.id}
                isVisible={showLikesHover}
                anchorRect={likesAnchorRect}
                onMouseEnter={handleLikesCardMouseEnter}
                onMouseLeave={handleLikesMouseLeave}
            />
        </div>
    );
};

export default PostCard;
