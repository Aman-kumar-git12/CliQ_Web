/** Post detail page: post text (or the edit textarea), embedded repost, link preview, media and timestamp. */
import RichText from "./RichText";
import LinkPreviewCard from "./LinkPreviewCard";
import EmbeddedPost from "./EmbeddedPost";
import MentionTextarea from "./MentionTextarea";

export default function PostDetailContent({
    post,
    currentUserId,
    isEditing,
    editContent,
    onEditContentChange,
    onEditMentionIdsChange,
}) {
    return (
        <div className="space-y-4 mt-2">
            {isEditing ? (
                <>
                    <style>
                        {`
                                        .custom-resize-handle::-webkit-resizer {
                                            border-style: solid;
                                            border-width: 0 0 12px 12px;
                                            border-color: transparent transparent #555 transparent;
                                        }
                                        .custom-resize-handle:hover::-webkit-resizer {
                                             border-color: transparent transparent #8b5cf6 transparent;
                                        }
                                    `}
                    </style>
                    <MentionTextarea
                        value={editContent}
                        onChange={onEditContentChange}
                        onMentionIdsChange={onEditMentionIdsChange}
                        aria-label="Edit post content"
                        maxLength={500}
                        className="custom-resize-handle w-full h-24 bg-surface-700 border border-line rounded-xl p-4 text-white placeholder-ink-400 focus:outline-none focus:border-brand-light/50 focus:ring-2 focus:ring-brand-light/10 transition duration-200 ease-soft resize-y text-[15px] md:text-[17px] leading-relaxed"
                        placeholder="Edit your post content..."
                    />
                </>
            ) : (
                <RichText
                    text={post.content}
                    mentions={post.mentions}
                    currentUserId={currentUserId}
                    className="text-[15px] md:text-[17px] leading-[1.65] text-ink-100 font-medium"
                />
            )}

            {post.isRepost && <EmbeddedPost post={post.repostOf} currentUserId={currentUserId} />}
            {!post.image && !post.video && <LinkPreviewCard preview={post.linkPreview} />}

            {(post.image || post.video) && (
                <div className="rounded-3xl overflow-hidden shadow-soft-lg flex items-center justify-center w-full h-[500px] bg-white/[0.02] border border-line-soft mb-2 mt-2">
                    {post.video ? (
                        <video src={post.video} controls className="w-full h-full object-contain" />
                    ) : (
                        <img
                            src={post.image}
                            alt={`Post by ${post.username || "user"}`}
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>
            )}
            <div className="text-[14px] text-ink-300 tabular-nums my-3">
                {new Date(post.createdAt).toLocaleString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })}
            </div>
        </div>
    );
}
