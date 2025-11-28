import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Calendar } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import DeletePost from "./DeletePost";

export default function IndividualPost() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axiosClient.get(`/user/post/${postId}`, { withCredentials: true });
                const postData = Array.isArray(res.data) ? res.data[0] : res.data;
                setPost(postData);
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) return <div className="text-center text-white mt-10">Loading...</div>;
    if (!post) return <div className="text-center text-white mt-10">Post not found</div>;

    return (
        <div className="w-full min-h-screen bg-black text-white pb-20">
            {/* Header / Back Button */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-gray-800 transition"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Post</h1>
            </div>

            <div className="max-w-2xl mx-auto mt-4 px-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border border-gray-700">
                        <img
                            src={post.avatar || "https://github.com/shadcn.png"}
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">
                            {post.username || "Anonymous"}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            @{post.username ? post.username.toLowerCase().replace(/\s+/g, '') : "anonymous"}
                        </p>
                    </div>
                </div>

                {/* Post Content */}
                <div className="mb-6">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap mb-4">
                        {post.content || post.text}
                    </p>

                    {post.image && (
                        <div className="rounded-2xl overflow-hidden border border-gray-800 mb-4">
                            <img
                                src={post.image}
                                alt="Post Content"
                                className="w-full h-auto max-h-[600px] object-cover"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-500 text-sm border-b border-gray-800 pb-4">
                        <Calendar size={16} />
                        <span>
                            {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-4">
                        {/* Placeholder for social actions like Like/Comment if needed later */}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/post/edit/${postId}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition font-medium"
                        >
                            <Edit size={18} />
                            Edit
                        </button>

                        <DeletePost postId={postId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
