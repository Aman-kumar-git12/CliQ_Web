import { useState, useRef, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Confirmation from "../Confirmation";
import CreatePostShimmering from "../shimmering/CreatePostShimmering";

const CreatePost = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [content, setContent] = useState("");
    const [selectedFile, setSelectedFile] = useState(null); // Store raw file
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [snack, setSnack] = useState(""); // SNACK MESSAGE STATE

    // Simulate loading on mount (for smoother transition/shimmer effect)
    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Show snackbar for 3 seconds
    const showSnack = (msg) => {
        setSnack(msg);
        setTimeout(() => setSnack(""), 3000);
    };

    // Handle image selection
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showSnack("Image should be less than 10 MB");
            return;
        }

        setSelectedFile(file); // Save file for upload

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleCreatePostClick = () => {
        if (!content.trim()) return alert("Please add some description");
        setShowConfirm(true);
    };

    const executeCreatePost = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            console.log("Uploading post...");

            const formData = new FormData();
            formData.append("content", content);
            if (selectedFile) {
                formData.append("image", selectedFile);
            }

            await axiosClient.post("/create/post", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Show success snackbar
            showSnack("Post uploaded successfully");

            // Wait a bit before navigating so user sees the message
            setTimeout(() => {
                // Reset and navigate back
                setContent("");
                setSelectedFile(null);
                setPreview("");
                navigate("/profile");
            }, 1500);

        } catch (err) {
            console.log(err);
            showSnack("Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <CreatePostShimmering />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white p-4 flex flex-col items-center pt-10 relative transition-colors duration-300">
            {/* SNACKBAR */}
            {snack && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]
                                px-6 py-3 bg-black/80 dark:bg-white/90 text-white dark:text-black text-sm font-bold
                                rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none whitespace-nowrap backdrop-blur-sm">
                    {snack}
                </div>
            )}

            <Confirmation
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={executeCreatePost}
                title="Create this post?"
                confirmText="Post"
                confirmColor="bg-blue-600 hover:bg-blue-700"
            />

            <div className="w-full max-w-xl">

                <h2 className="text-2xl font-bold mb-6 text-center">Create Post</h2>

                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300">

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Description
                        </label>
                        <textarea
                            className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition-all resize-none"
                            rows={4}
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Upload Image Area */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Image
                        </label>

                        {!preview ? (
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all group"
                            >
                                <div className="bg-gray-100 dark:bg-[#222] p-3 rounded-full mb-3 group-hover:bg-gray-200 dark:group-hover:bg-[#333] transition-colors">
                                    <ImagePlus size={24} className="text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">
                                    Upload Image
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                                    PNG, JPG up to 10MB
                                </p>
                            </div>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group shadow-sm">
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-full h-64 object-cover"
                                />
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview("");
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-[#222] dark:hover:bg-[#333] text-black dark:text-white rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleCreatePostClick}
                            disabled={loading || !content.trim()}
                            className="flex-1 px-4 py-3 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg dark:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black"></div>
                                    Posting...
                                </>
                            ) : (
                                "Post"
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreatePost;
