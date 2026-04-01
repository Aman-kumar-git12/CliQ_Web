import { useState, useRef } from "react";
import { Image, Video, Smile, Loader2 } from "lucide-react";
import { useUserContext } from "../context/userContext";
import axiosClient from "../api/axiosClient";

export default function PostInput({ onPostSuccess }) {
    const { user } = useUserContext();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handlePost = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            await axiosClient.post("/create/post", { content }, {
                withCredentials: true
            });
            setContent("");
            if (onPostSuccess) onPostSuccess();
        } catch (err) {
            console.error("Failed to post:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cliq-feed-panel rounded-[1.5rem] p-4 mb-6 transition-all duration-500 max-w-[560px] w-full self-center mx-auto">
            <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-violet-500/20">
                    {user?.firstname?.substring(0, 1).toUpperCase() || "A"}
                </div>
                <div className="flex-1 flex flex-col gap-2.5">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`What's on your mind, ${user?.firstname || 'Aman'}?`}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-[14px] text-[#ece8f8] placeholder-[#6f6a86] focus:outline-none focus:border-[var(--cliq-lilac)]/25 transition-all resize-none min-h-[50px] leading-relaxed"
                    />
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 gap-3 border-t cliq-feed-divider">
                        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                            <button className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full text-[#8e89a8] hover:text-white transition-all group border border-white/5 hover:border-white/10 bg-white/[0.02] shrink-0">
                                <Image size={13} className="text-violet-400" />
                                <span className="text-[10px] md:text-[11px] font-bold">Photo</span>
                            </button>
                            <button className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full text-[#8e89a8] hover:text-white transition-all group border border-white/5 hover:border-white/10 bg-white/[0.02] shrink-0">
                                <Video size={13} className="text-pink-400" />
                                <span className="text-[10px] md:text-[11px] font-bold">Video</span>
                            </button>
                            <button className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full text-[#8e89a8] hover:text-white transition-all group border border-white/5 hover:border-white/10 bg-white/[0.02] shrink-0">
                                <Smile size={13} className="text-yellow-400" />
                                <span className="text-[10px] md:text-[11px] font-bold">Mood</span>
                            </button>
                        </div>

                        <button
                            onClick={handlePost}
                            disabled={loading || !content.trim()}
                            className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white rounded-xl sm:rounded-full font-black text-[11px] md:text-[12px] shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={12} className="animate-spin" /> : "Post Now"}
                        </button>
                    </div>
                </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" />
        </div>
    );
}
