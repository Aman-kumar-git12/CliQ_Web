import { Heart, MessageCircle, Repeat, Send, MoreHorizontal, Plus } from "lucide-react";

const PostCard = ({ post }) => {
    if (!post) return null;

    // Ensure content fallback
    const text = post.text || post.content || "";

    return (
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition cursor-pointer">
            <div className="flex gap-3">

                {/* LEFT: Avatar + Line */}
                <div className="flex flex-col items-center">
                    <div className="relative w-11 h-11">
                        <img
                            src={post.avatar}
                            className="w-11 h-11 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                        />

                        {/* Plus Icon */}
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-[2px] shadow-sm">
                            <div className="bg-black dark:bg-white rounded-full w-4 h-4 flex items-center justify-center">
                                <Plus size={10} className="text-white dark:text-black" />
                            </div>
                        </div>
                    </div>

                    {/* Line */}
                    <div className="w-[2px] flex-1 bg-neutral-200 dark:bg-neutral-800 my-2 rounded-full" />
                </div>

                {/* RIGHT: Content */}
                <div className="flex-1">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-black dark:text-white">
                                {post.username}
                            </span>
                            <span className="text-neutral-400 text-xs">
                                {post.time}
                            </span>
                        </div>
                        <button className="text-neutral-500 hover:text-black dark:hover:text-white">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    {/* Text */}
                    <p className="text-[15px] text-black dark:text-white leading-snug mb-3 whitespace-pre-wrap">
                        {text}
                    </p>

                    {/* IMAGES */}
                    {(() => {
                        const imgSrc = post.image || post.images;
                        const images = Array.isArray(imgSrc) ? imgSrc : imgSrc ? [imgSrc] : [];

                        if (images.length === 0) return null;

                        return (
                            <div
                                className={`
                                    flex gap-2 mb-3 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 
                                    ${images.length > 1 ? "h-60 sm:h-72" : "h-auto"}
                                `}
                            >
                                {images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        className={`
                                            object-cover 
                                            ${images.length === 1 ? "w-full rounded-xl max-h-[450px]" : "w-full h-full"}
                                        `}
                                    />
                                ))}
                            </div>
                        );
                    })()}

                    {/* ACTIONS */}
                    <div className="flex items-center gap-6 mt-3 text-neutral-600 dark:text-neutral-400">

                        <button className="group flex items-center gap-1 hover:text-red-500 transition">
                            <Heart size={20} />
                            {post.likes > 0 && (
                                <span className="text-sm">{post.likes}</span>
                            )}
                        </button>

                        <button className="group flex items-center gap-1 hover:text-blue-500 transition">
                            <MessageCircle size={20} />
                            {post.comments > 0 && (
                                <span className="text-sm">{post.comments}</span>
                            )}
                        </button>

                        <button className="group flex items-center gap-1 hover:text-green-500 transition">
                            <Repeat size={20} />
                            {post.reposts > 0 && (
                                <span className="text-sm">{post.reposts}</span>
                            )}
                        </button>

                        <button className="group flex items-center gap-1 hover:text-yellow-500 transition">
                            <Send size={20} />
                            {post.shares > 0 && (
                                <span className="text-sm">{post.shares}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
