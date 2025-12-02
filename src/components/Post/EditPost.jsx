import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Confirmation from "../Confirmation";
import CreatePostShimmering from "../shimmering/CreatePostShimmering";

export default function EditPost() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axiosClient.get(`/user/post/${postId}`, { withCredentials: true });
                // Assuming API returns array or object, handle accordingly. 
                // Based on previous interactions, /user/post/:id might return an array of posts for a user OR a single post.
                // The user request says "use /user/post/:id api to get taht post". 
                // If it returns a single post object:
                const postData = Array.isArray(res.data) ? res.data[0] : res.data;
                setContent(postData.content || postData.text || "");
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            console.log(postId);
            console.log("Saving post...");
            await axiosClient.put(`/update/post/${postId}`, { content }, { withCredentials: true });
            navigate("/profile");
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update post.");
        } finally {
            setSaving(false);
            setShowConfirm(false);
        }
    };

    if (loading) return <CreatePostShimmering />;

    return (
        <div className="w-full pt-4 px-4 pb-20 flex justify-center">
            <div className="w-full max-w-2xl bg-[#111] border border-gray-800 rounded-2xl p-6 text-white shadow-xl">
                <h2 className="text-2xl font-bold mb-6">Edit Post</h2>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-40 bg-[#222] border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Edit your post content..."
                />

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-gray-400 hover:text-white transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            <Confirmation
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleSave}
                title="Save Changes?"
                confirmText={saving ? "Saving..." : "Yes, Save"}
                confirmColor="bg-blue-600 hover:bg-blue-700"
            />
        </div>
    );
}
