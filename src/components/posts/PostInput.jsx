import { useState, useRef, useEffect } from "react";
import { Smile, Loader2, X } from "lucide-react";
import { useUserContext } from "../../context/UserContext";
import * as postsApi from "../../api/posts";
import EmojiPicker from "../common/EmojiPicker";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import MentionTextarea from "./MentionTextarea";
import LinkPreviewCard from "./LinkPreviewCard";
import { useLinkPreview } from "../../hooks/useLinkPreview";
import { popoverMotion } from "../common/motionPresets";
import { FOCUS_RING, PRESS, SOFT_TRANSITION } from "./postUi";

export default function PostInput({ onPostSuccess }) {
    const { user } = useUserContext();
    const [content, setContent] = useState("");
    const [mentionIds, setMentionIds] = useState([]);
    const { preview: linkPreview } = useLinkPreview(content);
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const pickerRef = useRef(null);
    const reduceMotion = useReducedMotion();

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
            await postsApi.createPost({ content, mentionIds });
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
        <div className="cliq-feed-panel rounded-2xl p-4 mb-6 max-w-[560px] w-full self-center mx-auto relative">
            <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-pink flex items-center justify-center text-white font-black text-sm shrink-0 shadow-soft">
                    {user?.firstname?.substring(0, 1).toUpperCase() || "A"}
                </div>
                <div className="flex-1 flex flex-col gap-2.5">
                    <MentionTextarea
                        value={content}
                        onChange={setContent}
                        onMentionIdsChange={setMentionIds}
                        maxLength={500}
                        placeholder={`What's on your mind, ${user?.firstname || "there"}?`}
                        aria-label="Write a post"
                        className="w-full bg-white/[0.02] border border-line-soft rounded-xl px-4 py-3 text-[14px] text-ink-100 placeholder-ink-400 focus:outline-none focus:border-brand-light/30 focus:bg-white/[0.035] focus:ring-2 focus:ring-brand-light/10 transition duration-200 ease-soft resize-none min-h-[60px] leading-relaxed"
                    />
                    {linkPreview && <LinkPreviewCard preview={linkPreview} compact />}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 gap-3 border-t cliq-feed-divider relative">
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <div className="relative" ref={pickerRef}>
                                <button
                                    type="button"
                                    aria-expanded={showEmojiPicker}
                                    onClick={() => {
                                        setShowEmojiPicker(!showEmojiPicker);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full group border shrink-0 ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING} ${
                                        showEmojiPicker
                                            ? "bg-brand/20 border-brand/40 text-white"
                                            : "text-ink-300 hover:text-white border-line-soft hover:border-line bg-white/[0.02] hover:bg-white/[0.05]"
                                    }`}
                                >
                                    <Smile
                                        size={14}
                                        className={showEmojiPicker ? "text-brand-light" : "text-yellow-400"}
                                    />
                                    <span className="text-[11px] font-black uppercase tracking-wider">Mood</span>
                                </button>

                                <AnimatePresence>
                                    {showEmojiPicker && (
                                        <motion.div
                                            {...popoverMotion(reduceMotion)}
                                            style={{ pointerEvents: "auto" }}
                                            className="absolute top-full -left-4 sm:left-0 mt-3 z-popover origin-top-left shadow-pop rounded-2xl border border-line-strong overflow-hidden w-[280px] sm:w-[320px]"
                                        >
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    aria-label="Close emoji picker"
                                                    onClick={() => setShowEmojiPicker(false)}
                                                    className={`absolute top-2 right-2 w-7 h-7 bg-surface-raised/80 hover:bg-white/10 text-white rounded-full flex items-center justify-center z-[160] backdrop-blur-md border border-line ${SOFT_TRANSITION} ${FOCUS_RING}`}
                                                >
                                                    <X size={14} />
                                                </button>
                                                <EmojiPicker
                                                    onEmojiClick={(emojiData) => {
                                                        setContent((prev) => prev + emojiData.emoji);
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
                            className={`w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-brand to-brand-pink text-white rounded-full font-black text-[11px] md:text-[12px] shadow-soft hover:shadow-glow hover:brightness-110 motion-safe:hover:scale-[1.02] ${PRESS} ${SOFT_TRANSITION} ${FOCUS_RING} disabled:opacity-40 disabled:grayscale disabled:scale-100 disabled:shadow-none disabled:brightness-100 flex items-center justify-center gap-2`}
                        >
                            {loading ? <Loader2 size={12} className="animate-spin" /> : "Post Now"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
