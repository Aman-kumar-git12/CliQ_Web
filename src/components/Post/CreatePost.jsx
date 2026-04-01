import { useState, useRef, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { ImagePlus, X, Loader2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Confirmation from "../Confirmation";
import CreatePostShimmering from "../shimmering/CreatePostShimmering";
import { motion, AnimatePresence } from "framer-motion";

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

    // Handle file selection
    const handleFileSelection = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");

        if (!isVideo && !isImage) {
            showSnack("Only image and video files are supported");
            return;
        }

        // Check file size (Image: 10MB, Video: 50MB)
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showSnack(`${isVideo ? "Video" : "Image"} should be less than ${isVideo ? "50" : "10"} MB`);
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
        if (!content.trim() && !selectedFile) {
            showSnack("Add some text or select media before posting");
            return;
        }
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
                const isVideo = selectedFile.type.startsWith("video/");
                formData.append(isVideo ? "video" : "image", selectedFile);
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

    useEffect(() => {
        const rootElement = document.getElementById("root");
        if (rootElement) {
            if (showConfirm) {
                rootElement.classList.add("global-modal-blur");
            } else {
                rootElement.classList.remove("global-modal-blur");
            }
        }
        return () => {
            if (rootElement) rootElement.classList.remove("global-modal-blur");
        };
    }, [showConfirm]);

    if (initialLoading) return <CreatePostShimmering />;

    return (
        <div className="w-full min-h-screen relative overflow-x-hidden pt-[80px] md:pt-4 bg-transparent text-white transition-all duration-500">
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
            {/* Background elements removed for cleaner matching with global theme */}

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

            <div className="px-4 md:px-0 max-w-full md:max-w-2xl mx-auto w-full pb-20 no-scrollbar">
                {/* Header Section */}
                <div className="flex flex-col items-start justify-start relative z-10 mb-4 px-2">
                    <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="fill-[#8b5cf6] text-[#8b5cf6] drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/80">Creation Hub</span>
                        </div>
                    </div>

                    <div className="flex flex-row items-end justify-between w-full">
                        <div className="flex flex-col">
                            <h1 className="text-[36px] md:text-[42px] font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                Create
                            </h1>
                            <span className="text-[28px] md:text-[34px] text-[#a78bfa] font-black uppercase italic leading-none -mt-2 block drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">
                                Post
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Card - Matching Global Background with Bright Borders */}
                <div className="relative p-6 md:p-8 rounded-[40px] border border-white/20 bg-white/[0.03] backdrop-blur-3xl shadow-2xl transition-all duration-500 overflow-hidden group">
                    {/* Minimal Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none opacity-50" />

                    {/* Description Area */}
                    <div className="mb-6 relative z-10">
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-3 ml-2">
                            Description
                        </label>
                        <textarea
                            className="w-full bg-white/[0.02] border border-white/10 rounded-[24px] px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all resize-none font-medium leading-relaxed backdrop-blur-md"
                            rows={2}
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Media Upload Area */}
                    <div className="mb-8 relative z-10">
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-3 ml-2">
                            Media
                        </label>
                        {!preview ? (
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="border-2 border-dashed border-white/10 bg-white/[0.02] rounded-[32px] p-6 sm:p-10 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/[0.05] transition-all group overflow-hidden relative shadow-inner backdrop-blur-sm"
                            >
                                <div className="bg-white/[0.05] p-4 rounded-[20px] mb-4 group-hover:scale-110 transition-all duration-500 border border-white/20">
                                    <ImagePlus size={28} className="text-white/40 group-hover:text-white transition-colors" />
                                </div>
                                <p className="text-white/50 font-black group-hover:text-white transition-colors text-xl uppercase italic tracking-tighter">
                                    Upload Media
                                </p>
                                <p className="text-[10px] text-white/20 mt-2 font-black uppercase tracking-widest">
                                    Image or Video up to 50MB
                                </p>
                            </div>
                        ) : (
                            <div className="relative rounded-[26px] overflow-hidden border border-white/10 group shadow-2xl bg-black/40 backdrop-blur-md">
                                {selectedFile?.type.startsWith("video/") ? (
                                    <video
                                        src={preview}
                                        controls
                                        className="w-full h-[320px] object-contain"
                                    />
                                ) : (
                                    <img
                                        src={preview}
                                        alt="preview"
                                        className="w-full h-[320px] object-cover group-hover:scale-[1.03] transition-transform duration-700"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview("");
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2 rounded-full transition-all hover:scale-110 active:scale-95 border border-white/10 z-10"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*,video/*"
                            ref={fileInputRef}
                            onChange={handleFileSelection}
                            className="hidden"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2 relative z-10">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full sm:flex-1 px-8 py-4 bg-white/[0.03] hover:bg-white/10 text-white rounded-[20px] font-black uppercase italic tracking-[0.2em] transition-all border border-white/10 active:scale-95 text-xs backdrop-blur-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreatePostClick}
                            disabled={loading || (!content.trim() && !selectedFile)}
                            className="w-full sm:flex-1 px-8 py-3.5 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-[20px] font-black uppercase italic tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95 group/btn text-xs"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <span>Share Post</span>
                                    <Zap size={16} className="group-hover/btn:fill-black group-hover/btn:scale-110 transition-all" />
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreatePost;
