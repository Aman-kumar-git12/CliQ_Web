/** Posts tab of another user's public profile: heading, empty state and post tile grid. */
import { Link } from "react-router-dom";
import { Play, Repeat2 } from "lucide-react";
import { toProfileTiles } from "../../utils/profilePostTiles";
import PostTileGridShimmering from "../shimmering/PostTileGridShimmering";

export default function PublicProfilePostsTab({ user, posts, loadingPosts }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-3 md:mb-4 px-2">
                <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 uppercase italic tracking-wider">
                    Recent Posts
                    <span className="text-[9px] md:text-[10px] font-black text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 not-italic tracking-widest">
                        {posts.length}
                    </span>
                </h2>
            </div>

            {loadingPosts && posts.length === 0 ? (
                <PostTileGridShimmering />
            ) : !loadingPosts && posts.length === 0 ? (
                <div className="text-center py-20 mx-3 md:mx-0 bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/10">
                    <p className="text-white/30 font-black uppercase tracking-widest italic">No posts yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4 transition-all duration-500">
                    {toProfileTiles(posts).map((post) => (
                        <Link
                            to={`/post/${post.id}`}
                            key={post.tileKey || post.id}
                            className="group relative aspect-square bg-white/[0.03] backdrop-blur-xl rounded-sm md:rounded-[28px] overflow-hidden border border-white/10 shadow-lg hover:border-white/20 transition-all duration-500 active:scale-95"
                        >
                            {post.isRepostTile && (
                                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 border border-white/10 text-[9px] font-black uppercase tracking-wider text-emerald-300 pointer-events-none">
                                    <Repeat2 size={10} /> Repost
                                </div>
                            )}
                            {post.video ? (
                                <>
                                    <video
                                        src={post.video}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        muted
                                        playsInline
                                        preload="metadata"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                                    <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/65 border border-white/10 flex items-center justify-center text-white shadow-lg pointer-events-none">
                                        <Play size={16} fill="currentColor" />
                                    </div>
                                </>
                            ) : post.image ? (
                                <img
                                    loading="lazy"
                                    decoding="async"
                                    src={post.image}
                                    alt={`Post by ${[user.firstname, user.lastname].filter(Boolean).join(" ")}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 p-4 text-center text-sm">
                                    <p className="line-clamp-3 italic opacity-60">"{post.content}"</p>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
