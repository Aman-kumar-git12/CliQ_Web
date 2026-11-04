/** Tile grid of a user's posts (own and public profile): images, videos and text posts, with repost badges. */
import { Link } from "react-router-dom";
import { Play, Repeat2 } from "lucide-react";
import { toProfileTiles } from "../../utils/profilePostTiles";

const MEDIA_CLASS =
    "w-full h-full object-cover transition-transform duration-250 ease-soft group-hover:scale-[1.03] motion-reduce:transform-none";

export default function ProfilePostGrid({ user, posts }) {
    const authorName = [user?.firstname, user?.lastname].filter(Boolean).join(" ");

    return (
        <div className="grid grid-cols-3 gap-1.5 md:gap-3">
            {toProfileTiles(posts).map((post) => (
                <Link
                    to={`/post/${post.id}`}
                    key={post.tileKey || post.id}
                    // Video tiles have no text or alt of their own to name the link
                    aria-label={post.video ? `Video post by ${authorName}` : undefined}
                    className="group relative block aspect-square overflow-hidden rounded-2xl border border-line-soft bg-white/[0.03] shadow-soft hover:border-line-strong active:scale-[0.98] cliq-transition focus-ring"
                >
                    {post.video ? (
                        <video src={post.video} className={MEDIA_CLASS} muted playsInline preload="metadata" />
                    ) : post.image ? (
                        <img
                            loading="lazy"
                            decoding="async"
                            src={post.image}
                            alt={`Post by ${authorName}`}
                            className={MEDIA_CLASS}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-3 md:p-5 bg-gradient-to-br from-brand/[0.14] via-brand/[0.05] to-brand-pink/[0.06]">
                            <p className="line-clamp-4 break-words text-center text-xs md:text-sm leading-snug text-ink-200">
                                {post.content}
                            </p>
                        </div>
                    )}

                    {/* Hover/focus veil: a quiet cue that the tile opens the post */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 transition-opacity duration-250 ease-soft group-hover:opacity-100 group-focus-visible:opacity-100"
                    />

                    {post.isRepostTile && (
                        <span className="pointer-events-none absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-line text-[10px] font-medium text-emerald-300">
                            <Repeat2 size={11} aria-hidden="true" /> Repost
                        </span>
                    )}

                    {post.video && (
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute bottom-2 right-2 z-10 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/55 backdrop-blur-sm border border-line flex items-center justify-center text-white"
                        >
                            <Play size={13} fill="currentColor" />
                        </span>
                    )}
                </Link>
            ))}
        </div>
    );
}
