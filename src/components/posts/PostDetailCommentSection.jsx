/** Post detail page: reply composer and the list of comment threads. */
import { Link } from "react-router-dom";
import MentionTextarea from "./MentionTextarea";
import CommentThread from "./CommentThread";
import { DEFAULT_AVATAR } from "../../utils/avatar";
import { FOCUS_RING, PRESS, SOFT_TRANSITION } from "./postUi";

export default function PostDetailCommentSection({
    commentsRef,
    currentUser,
    comments,
    newComment,
    onNewCommentChange,
    onNewCommentMentionIdsChange,
    isSubmittingComment,
    onAddComment,
    onSubmitReply,
    onDeleteComment,
    onReportComment,
    onProfileMouseEnter,
    onProfileMouseLeave,
}) {
    return (
        <div ref={commentsRef} className="motion-safe:animate-[slideDown_var(--cliq-dur-page)_var(--cliq-ease)]">
            {/* Comment Input */}
            <div className="p-4 border-b border-line-soft bg-transparent z-10 flex space-x-3 w-full relative">
                <form onSubmit={onAddComment} className="flex flex-1 items-start space-x-3 w-full">
                    <Link
                        to="/profile"
                        onMouseEnter={(e) => onProfileMouseEnter(e, currentUser?.id)}
                        onMouseLeave={onProfileMouseLeave}
                        className={`shrink-0 rounded-full ${FOCUS_RING}`}
                    >
                        <img
                            src={currentUser?.imageUrl || DEFAULT_AVATAR}
                            className="w-10 h-10 rounded-full object-cover bg-surface-600 hover:opacity-80 transition-opacity duration-150 ease-soft"
                            alt={
                                [currentUser?.firstname, currentUser?.lastname].filter(Boolean).join(" ") ||
                                "Your profile"
                            }
                        />
                    </Link>
                    <div className="flex-1 flex flex-col gap-2">
                        <MentionTextarea
                            multiline={false}
                            value={newComment}
                            onChange={onNewCommentChange}
                            onMentionIdsChange={onNewCommentMentionIdsChange}
                            aria-label="Write a reply"
                            maxLength={1000}
                            placeholder="Post your reply · @ to mention"
                            className="w-full bg-transparent border-none px-0 py-2 text-[17px] text-white placeholder-ink-400 focus-ring rounded-lg leading-relaxed"
                        />
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmittingComment}
                                className={`px-4 py-1.5 bg-brand hover:bg-brand/85 text-white rounded-full font-bold text-[14px] disabled:opacity-50 disabled:bg-brand/50 disabled:pointer-events-none ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING}`}
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Comments List - Scrollable Area */}
            <div className="divide-y divide-line-soft max-h-[500px] overflow-y-auto custom-scrollbar">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <CommentThread
                            key={comment.id}
                            comment={comment}
                            currentUser={currentUser}
                            onSubmitReply={onSubmitReply}
                            onDelete={onDeleteComment}
                            onReport={onReportComment}
                            onProfileEnter={onProfileMouseEnter}
                            onProfileLeave={onProfileMouseLeave}
                        />
                    ))
                ) : (
                    <div className="p-10 text-center text-ink-300 text-[15px] font-bold">
                        No replies yet. Be the first to answer!
                    </div>
                )}
            </div>
        </div>
    );
}
