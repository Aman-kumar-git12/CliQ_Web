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
import { useState } from "react";
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
import { DROP_IN, FADE_IN, FOCUS_RING, ICON_FEEDBACK, MENU, MENU_ITEM, SOFT_TRANSITION } from "./postUi";

// Custom Hook
import { usePostcard } from "../../hooks/usePostCard";

// Feed panel frame shared by the card and the "no longer available" repost placeholder
const CARD_FRAME = `cliq-feed-panel rounded-2xl p-4 mb-3 max-w-[560px] w-full mx-auto ${FADE_IN}`;

// Like / comment / repost / save / share: a soft pill that tints on hover and dips on press
const ACTION_BTN = `group flex items-center gap-1.5 -mx-1.5 px-1.5 py-1 rounded-full ${SOFT_TRANSITION} ${FOCUS_RING}`;
const COUNT = "text-[12px] font-bold tabular-nums";

/**
 * Post photo or video. Until the media has a size the frame keeps a placeholder height (instead of collapsing and
 * then jumping open), and the photo fades in once it has loaded.
 */
const FeedMedia = ({ image, video, alt }) => {
    const [ready, setReady] = useState(false);
    const markReady = () => setReady(true);

    return (
        <div
            className={`relative flex items-center justify-center w-full rounded-xl overflow-hidden border border-line bg-surface-950 mb-2.5 ${ready ? "" : "min-h-[240px]"}`}
        >
            {!ready && (
                <div aria-hidden="true" className="absolute inset-0 bg-brand-light/[0.04] motion-safe:animate-pulse" />
            )}
            {video ? (
                <video
                    src={video}
                    controls
                    preload="metadata"
                    onLoadedMetadata={markReady}
                    onError={markReady}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-h-[400px] object-contain"
                />
            ) : (
                <img
                    loading="lazy"
                    decoding="async"
                    src={image}
                    // A photo already in the browser cache may be complete before onLoad is attached
                    ref={(el) => {
                        if (el?.complete && el.naturalWidth > 0 && !ready) setReady(true);
                    }}
                    onLoad={markReady}
                    onError={markReady}
                    className={`relative w-full max-h-[400px] h-auto object-contain transition-opacity duration-300 ease-soft ${ready ? "opacity-100" : "opacity-0"}`}
                    alt={alt}
                />
            )}
        </div>
    );
};

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
            <div className={CARD_FRAME}>
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-ink-300">
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
            className={`${CARD_FRAME} relative transition-[border-color] duration-200 ease-soft hover:border-brand-light/20`}
        >
            {isPlainRepost && (
                <Link
                    to={profilePath(post.userId)}
                    className={`flex items-center gap-1.5 mb-2.5 ml-1 text-[11px] font-bold text-ink-300 hover:text-emerald-400 rounded-md w-fit ${SOFT_TRANSITION} ${FOCUS_RING}`}
                >
                    <Repeat2 size={13} />
                    {currentUser?.id === post.userId ? "You reposted" : `${post.username} reposted`}
                </Link>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                    <Link
                        to={profilePath(target.userId)}
                        aria-label={`${target.username || "Anonymous"}'s profile`}
                        className={`relative w-9 h-9 shrink-0 rounded-full group/avatar ${FOCUS_RING}`}
                        onMouseEnter={(e) => handleProfileMouseEnter(e, target.userId)}
                        onMouseLeave={handleProfileMouseLeave}
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-tr from-brand-light to-brand-rose rounded-full opacity-0 group-hover/avatar:opacity-70 transition-opacity duration-200 ease-soft blur-sm" />
                        <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-brand to-brand-rose flex items-center justify-center border-2 border-black text-white font-black text-[11px] shadow-soft">
                            {target.username ? target.username.substring(0, 1).toUpperCase() : "A"}
                        </div>
                    </Link>
                    <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <Link
                                to={profilePath(target.userId)}
                                className={`font-black text-[14px] leading-tight text-white hover:text-brand-light tracking-tight rounded-sm truncate ${SOFT_TRANSITION} ${FOCUS_RING}`}
                            >
                                {target.username || "Anonymous"}
                            </Link>
                            <span className="text-[11.5px] text-ink-300 truncate">@{target.handle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-ink-300 uppercase tracking-wider leading-none">
                            <span title={new Date(target.createdAt).toLocaleString()}>{timeAgo(target.createdAt)}</span>
                            <span className="text-ink-550" aria-hidden="true">
                                •
                            </span>
                            <div className="flex items-center gap-1 text-blue-400/70">
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
                        className={`p-1.5 rounded-full text-ink-300 hover:text-white hover:bg-white/[0.06] ${SOFT_TRANSITION} ${FOCUS_RING}`}
                    >
                        <MoreHorizontal size={18} />
                    </button>
                    {showMenu && (
                        <div role="menu" className={`${MENU} absolute right-0 mt-1 w-48 origin-top-right ${DROP_IN}`}>
                            <button
                                role="menuitem"
                                onClick={() => {
                                    setShowMenu(false);
                                    actions.toggleSave();
                                }}
                                className={`${MENU_ITEM} text-white hover:bg-white/[0.06]`}
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
                                className={`${MENU_ITEM} text-white hover:bg-white/[0.06]`}
                            >
                                <Link2 size={14} /> Copy link
                            </button>
                            <button
                                role="menuitem"
                                onClick={() => {
                                    setShowMenu(false);
                                    openPost();
                                }}
                                className={`${MENU_ITEM} text-white hover:bg-white/[0.06]`}
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
                                    className={`${MENU_ITEM} ${reported ? "text-ink-400 cursor-default" : "text-red-400 hover:bg-red-500/10"}`}
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
                className={`px-0.5 -mx-0.5 cursor-pointer rounded-lg ${FOCUS_RING}`}
                onClick={openPost}
                onKeyDown={handleContentKeyDown}
                role="link"
                tabIndex={0}
            >
                <RichText
                    text={target.content}
                    mentions={target.mentions}
                    currentUserId={currentUser?.id}
                    className="text-[13.5px] text-ink-100 leading-[1.65] font-medium mb-2.5"
                />

                {target.isQuote && <EmbeddedPost post={target.repostOf} currentUserId={currentUser?.id} />}

                {(images.length > 0 || target.video) && (
                    <FeedMedia
                        key={target.video || images[0]}
                        image={images[0]}
                        video={target.video}
                        alt={`Post by ${target.username || "Anonymous"}`}
                    />
                )}

                {!images.length && !target.video && <LinkPreviewCard preview={target.linkPreview} />}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2.5 border-t cliq-feed-divider px-0.5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        onMouseEnter={handleLikesMouseEnter}
                        onMouseLeave={handleLikesMouseLeave}
                        aria-pressed={liked}
                        aria-label={`Like, ${likesCount} likes`}
                        className={`${ACTION_BTN} ${liked ? "text-[var(--cliq-pink)]" : "text-ink-300 hover:text-[var(--cliq-pink)]"} hover:bg-brand-pink/10`}
                    >
                        <Heart size={16} fill={liked ? "currentColor" : "none"} className={ICON_FEEDBACK} />
                        <span className={COUNT}>{likesCount}</span>
                    </button>

                    <button
                        onClick={() => navigate(`/post/${target.id}?comment=true`)}
                        onMouseEnter={handleCommentsMouseEnter}
                        onMouseLeave={handleCommentsMouseLeave}
                        aria-label={`Comments, ${target.comments || 0} comments`}
                        className={`${ACTION_BTN} text-ink-300 hover:text-brand-light hover:bg-brand/10`}
                    >
                        <MessageSquare size={16} className={ICON_FEEDBACK} />
                        <span className={COUNT}>{target.comments}</span>
                    </button>

                    <RepostControl post={target} actions={actions} currentUserId={currentUser?.id} />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={actions.toggleSave}
                        aria-pressed={actions.isSaved}
                        aria-label={actions.isSaved ? "Remove from saved" : "Save post"}
                        className={`${ACTION_BTN} ${actions.isSaved ? "text-brand-light" : "text-ink-300 hover:text-brand-light"} hover:bg-brand/10`}
                    >
                        <Bookmark
                            size={15}
                            fill={actions.isSaved ? "currentColor" : "none"}
                            className={ICON_FEEDBACK}
                        />
                    </button>
                    <button
                        onClick={actions.share}
                        className={`${ACTION_BTN} text-ink-300 hover:text-white hover:bg-white/[0.06]`}
                    >
                        <Share2 size={14} className={ICON_FEEDBACK} />
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
