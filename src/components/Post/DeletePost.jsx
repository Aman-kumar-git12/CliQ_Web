import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import Confirmation from "../Confirmation";

export default function DeletePost({ postId }) {
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            console.log(postId);
            await axiosClient.delete(`/delete/post/${postId}`, { withCredentials: true });
            navigate("/profile");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete post.");
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
            >
                <Trash2 size={18} />
                Delete Post
            </button>

            <Confirmation
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Post?"
                confirmText={loading ? "Deleting..." : "Yes, Delete"}
                confirmColor="bg-red-600 hover:bg-red-700"
            />
        </>
    );
}
