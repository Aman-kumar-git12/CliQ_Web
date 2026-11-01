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
                        className="custom-resize-handle w-full h-24 bg-[#111] border border-[#2f3336] rounded-xl p-4 text-white focus:outline-none focus:border-brand resize-y text-[15px] md:text-[17px] leading-relaxed"
                        placeholder="Edit your post content..."
                    />
                </>
            ) : (
                <RichText
                    text={post.content}
                    mentions={post.mentions}
                    currentUserId={currentUserId}
                    className="text-[15px] md:text-[17px] leading-relaxed text-ink-100 font-medium"
                />
            )}

            {post.isRepost && <EmbeddedPost post={post.repostOf} currentUserId={currentUserId} />}
            {!post.image && !post.video && <LinkPreviewCard preview={post.linkPreview} />}

            {(post.image || post.video) && (
                <div className="rounded-[32px] overflow-hidden shadow-2xl flex items-center justify-center w-full h-[500px] bg-white/[0.02] border border-white/[0.05] mb-2 group/media mt-2">
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
            <div className="text-[15px] text-ink-350 my-3">
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
