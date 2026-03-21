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
        <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center pt-8 relative transition-colors duration-300">
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

            <div className="w-full max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-purple-500/20">
                        <ImagePlus size={24} className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-white leading-none">Create Post</h2>
                        <p className="text-neutral-500 text-sm font-medium mt-1">Share your thoughts and moments</p>
                    </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 relative overflow-hidden">

                    {/* Subtle Top Glow */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    {/* Description */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
                            Description
                        </label>
                        <textarea
                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white placeholder-neutral-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all resize-none font-medium leading-relaxed"
                            rows={5}
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Upload Image Area */}
                    <div className="mb-10">
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
                            Media
                        </label>

                        {!preview ? (
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="bg-white/5 p-4 rounded-full mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                                    <ImagePlus size={28} className="text-neutral-400 group-hover:text-white transition-colors" />
                                </div>
                                <p className="text-neutral-400 font-bold group-hover:text-white transition-colors text-lg">
                                    Upload Image
                                </p>
                                <p className="text-xs text-neutral-600 mt-2 font-medium">
                                    PNG, JPG up to 10MB
                                </p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 group shadow-2xl">
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-full h-[300px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
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
                            className="flex-1 px-4 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-transparent hover:border-white/10"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleCreatePostClick}
                            disabled={loading || !content.trim()}
                            className="flex-1 px-4 py-3.5 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Posting...
                                </>
                            ) : (
                                "Share Post"
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreatePost;
