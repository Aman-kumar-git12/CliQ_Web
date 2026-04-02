import { useState, useRef, useEffect } from "react";
import { Smile, Loader2, X } from "lucide-react";
import { useUserContext } from "../context/userContext";
import axiosClient from "../api/axiosClient";
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PostInput({ onPostSuccess, onTriggerToast }) {
    const { user } = useUserContext();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePost = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            await axiosClient.post("/create/post", { content }, {
                withCredentials: true
            });
            setContent("");
            setShowEmojiPicker(false);
            if (onPostSuccess) onPostSuccess();
        } catch (err) {
            console.error("Failed to post:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cliq-feed-panel rounded-[1.5rem] p-4 mb-6 transition-all duration-500 max-w-[560px] w-full self-center mx-auto relative">
            <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-violet-500/20">
                    {user?.firstname?.substring(0, 1).toUpperCase() || "A"}
                </div>
                <div className="flex-1 flex flex-col gap-2.5">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`What's on your mind, ${user?.firstname || 'Aman'}?`}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-[14px] text-[#ece8f8] placeholder-[#6f6a86] focus:outline-none focus:border-[var(--cliq-lilac)]/25 transition-all resize-none min-h-[60px] leading-relaxed"
                    />
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 gap-3 border-t cliq-feed-divider relative">
                        <div className="flex items-center gap-1.5 md:gap-2">
                             <div className="relative" ref={pickerRef}>
                                <button 
                                    onClick={() => {
                                        setShowEmojiPicker(!showEmojiPicker);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all group border shrink-0 ${
                                        showEmojiPicker 
                                        ? "bg-violet-600/20 border-violet-500/40 text-white" 
                                        : "text-[#8e89a8] hover:text-white border-white/5 hover:border-white/10 bg-white/[0.02]"
                                    }`}
                                >
                                    <Smile size={14} className={showEmojiPicker ? "text-violet-400" : "text-yellow-400"} />
                                    <span className="text-[11px] font-black uppercase tracking-wider">Mood</span>
                                </button>

                                <AnimatePresence>
                                    {showEmojiPicker && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            style={{ pointerEvents: 'auto' }}
                                            className="absolute top-full -left-4 sm:left-0 mt-3 z-[150] shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-[1.5rem] border border-white/10 overflow-hidden w-[280px] sm:w-[320px]"
                                        >
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setShowEmojiPicker(false)}
                                                    className="absolute top-2 right-2 w-7 h-7 bg-[#11111a]/80 hover:bg-white/10 text-white rounded-full flex items-center justify-center z-[160] backdrop-blur-md border border-white/10 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <EmojiPicker 
                                                    onEmojiClick={(emojiData) => {
                                                        setContent(prev => prev + emojiData.emoji);
                                                    }}
                                                    theme="dark"
                                                    width="100%"
                                                    height={300}
                                                    autoFocusSearch={false}
                                                    searchDisabled={true}
                                                    skinTonesDisabled={true}
                                                    previewConfig={{ showPreview: false }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <button
                            onClick={handlePost}
                            disabled={loading || !content.trim()}
                            className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white rounded-full font-black text-[11px] md:text-[12px] shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={12} className="animate-spin" /> : "Post Now"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
