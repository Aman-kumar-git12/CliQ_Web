import { ArrowLeft, ChevronDown, Trash2, Pencil, Ban, Plus, Smile, Mic, SendHorizontal, FileText, Download, Image as ImageIcon, Loader2, X, Play, Pause, CornerUpLeft, CheckCircle2, Check, Copy, Sparkles, Bot, Phone, Video, MoreHorizontal, Star, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import createSocketConnection from "./socket";
import { useEffect, useState, useRef, useMemo } from "react";
import axiosClient, { apiBaseUrl } from "../../api/axiosClient";
import LoadingChat from "./LoadingChat";
import Confirmation from "../../components/Confirmation";
import Toastbar from "./Toastbar";
import { useUserContext } from "../../context/userContext";
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from "framer-motion";
import AIAssistantOverlay from "./AIAssistantOverlay";

const EMPTY_CHAT_STICKERS = [
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.webp", type: "Hii" },
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/512.webp", type: "Hello" },
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.webp", type: "Hello" },
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.webp", type: "Hii" },
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/512.webp", type: "Hello" },
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f916/512.webp", type: "Hii" }
];

const VoicePlayer = ({ src, isMe, avatar }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        const current = audioRef.current.currentTime;
        const total = audioRef.current.duration;
        setProgress((current / (total || 1)) * 100);
    };

    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-3 p-1 rounded-2xl min-w-[210px] ${isMe ? 'text-white' : 'text-neutral-200'}`}>
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            <button
                onClick={togglePlay}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0 ${isMe ? 'bg-white text-[#007aff]' : 'bg-[#007aff] text-white'}`}
            >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
            </button>

            <div className="flex-1 flex flex-col gap-1.5 pt-1">
                <div className="flex items-end gap-[2px] h-6 px-1">
                    {[3, 5, 8, 4, 6, 9, 5, 7, 3, 6, 8, 4, 7, 5, 9, 3, 6].map((h, i) => {
                        const isActive = progress > (i / 17) * 100;
                        return (
                            <div
                                key={i}
                                className={`w-[2px] rounded-full transition-colors ${isActive ? (isMe ? 'bg-white' : 'bg-[#007aff]') : (isMe ? 'bg-white/30' : 'bg-white/10')}`}
                                style={{ height: `${h * 2}px` }}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between items-center px-0.5">
                    <span className="text-[10px] opacity-70 font-medium">
                        {formatTime(audioRef.current?.currentTime || 0)}
                    </span>
                    <span className="text-[10px] opacity-70 font-medium tracking-tight">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            <div className="relative shrink-0 ml-1">
                <img
                    src={avatar || "https://cdn-icons-png.flaticon.com/512/219/219969.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border ${isMe ? 'bg-[#007aff] border-white/20' : 'bg-[#262626] border-white/10'}`}>
                    <Mic size={8} className="text-white" />
                </div>
            </div>
        </div>
    );
};

const ChatUI = () => {
    const navigate = useNavigate();
    const { targetuserId, actionParam } = useParams();
    const { user } = useUserContext();

    // State
    const [targetUser, setTargetUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastSeenId, setLastSeenId] = useState(null);

    // Online Status State
    const [isTargetOnline, setIsTargetOnline] = useState(false);
    const [targetLastSeen, setTargetLastSeen] = useState(null);

    // UI State
    const [newMessage, setNewMessage] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [updateMessage, setUpdateMessage] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, messageId: null, isMe: false });
    const [replyTo, setReplyTo] = useState(null);
    const [toast, setToast] = useState(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [fileCaption, setFileCaption] = useState("");

    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [assistantLoading, setAssistantLoading] = useState(false);
    const [assistantError, setAssistantError] = useState("");
    const [assistantData, setAssistantData] = useState(null);
    const [assistantHistory, setAssistantHistory] = useState([]);
    const [assistantAskHistory, setAssistantAskHistory] = useState([]);
    const [pendingAssistantHistory, setPendingAssistantHistory] = useState(null);
    const [assistantTone, setAssistantTone] = useState("polite");

    // Multi-Select State
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

    // AI Assistant Overlay State
    const [showAIOverlay, setShowAIOverlay] = useState(() => actionParam === 'ask_ai=true' || actionParam === 'generate_reply=true');
    const [aiMessages, setAiMessages] = useState([]);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiThinkingStep, setAiThinkingStep] = useState('idle');
    const [aiInput, setAiInput] = useState('');
    const [aiOverlayMode, setAiOverlayMode] = useState(() => actionParam === 'generate_reply=true' ? 'replies' : 'ask');

    // Sync UI state changes -> URL
    useEffect(() => {
        if (!targetuserId) return;
        if (showAIOverlay) {
            if (aiOverlayMode === 'ask' && actionParam !== 'ask_ai=true') {
                navigate(`/messages/${targetuserId}/ask_ai=true`, { replace: true });
            } else if (aiOverlayMode === 'replies' && actionParam !== 'generate_reply=true') {
                navigate(`/messages/${targetuserId}/generate_reply=true`, { replace: true });
            }
        } else {
            if (actionParam) {
                navigate(`/messages/${targetuserId}`, { replace: true });
            }
        }
    }, [showAIOverlay, aiOverlayMode, targetuserId, actionParam, navigate]);

    // Sync URL param changes -> UI state (e.g. Browser Back/Forward)
    useEffect(() => {
        if (actionParam === 'ask_ai=true') {
            setShowAIOverlay(true);
            setAiOverlayMode('ask');
        } else if (actionParam === 'generate_reply=true') {
            setShowAIOverlay(true);
            setAiOverlayMode('replies');
        } else if (!actionParam) {
            setShowAIOverlay(false);
        }
    }, [actionParam]);

    const canDeleteForEveryone = useMemo(() => {
        const selectedIds = Array.from(selectedMessages);
        if (selectedIds.length === 0) return false;
        return selectedIds.every(id => {
            const msg = messages.find(m => m.id === id);
            return msg?.isMe === true && !msg?.isDelete; // All must be 'me' AND not already deleted
        });
    }, [selectedMessages, messages]);

    // Randomize sticker for empty chat
    const randomSticker = useMemo(() => {
        return EMPTY_CHAT_STICKERS[Math.floor(Math.random() * EMPTY_CHAT_STICKERS.length)];
    }, [targetuserId]);

    const stickerMessage = useMemo(() => {
        const name = targetUser?.firstname || "";
        return `Say ${randomSticker.type} to ${name}`;
    }, [randomSticker, targetUser]);

    // Refs
    const scrollContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const observerRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const isRecordingCancelledRef = useRef(false);
    const hasAutoLoadedLastChat = useRef(false);

    // Reset auto-load flag when AI Overlay closes
    useEffect(() => {
        if (!showAIOverlay) {
            hasAutoLoadedLastChat.current = false;
        }
    }, [showAIOverlay]);

    // Auto-load last Ask AI chat when overlay opens
    useEffect(() => {
        if (showAIOverlay && aiOverlayMode === 'ask' && !hasAutoLoadedLastChat.current && assistantAskHistory.length > 0 && aiMessages.length === 0) {
            hasAutoLoadedLastChat.current = true;
            const lastChat = assistantAskHistory[0];
            setAiMessages(lastChat.messages || [
                { id: Date.now() + 1, type: 'user', text: lastChat.question },
                { id: Date.now() + 2, type: 'ai', text: lastChat.answer, isComplete: true }
            ]);
        }
    }, [showAIOverlay, aiOverlayMode, assistantAskHistory, aiMessages.length]);

    // Fetch Target User
    useEffect(() => {
        // Reset selection state when switching users
        setIsSelectMode(false);
        setSelectedMessages(new Set());
        setReplyTo(null);
        setNewMessage("");

        const fetchTargetUser = async () => {
            if (!targetuserId) return;
            try {
                const res = await axiosClient.get(`/user/${targetuserId}`, { withCredentials: true });
                setTargetUser(res.data.user);
            } catch (error) {
                console.error("Error fetching target user:", error);
            }
        };
        fetchTargetUser();
    }, [targetuserId]);

    useEffect(() => {
        const loadAssistantHistory = async () => {
            if (!targetuserId || !user?.id) {
                setAssistantHistory([]);
                setAssistantAskHistory([]);
                return;
            }

            try {
                const { data } = await axiosClient.get(`/message-ai/history/${targetuserId}`);
                setAssistantHistory(data.history || []);
            } catch (error) {
                console.error("Failed to load message assistant history:", error);
                setAssistantHistory([]);
            }

            try {
                const { data } = await axiosClient.get(`/message-ai/ask-history/${targetuserId}`);
                setAssistantAskHistory(data.history || []);
            } catch (error) {
                console.error("Failed to load Ask AI history:", error);
                setAssistantAskHistory([]);
            }
        };

        loadAssistantHistory();
    }, [targetuserId, user?.id]);

    // Fetch Chat History
    useEffect(() => {
        const fetchHistory = async () => {
            if (!targetuserId || !user?.id) return;

            setLoading(true);

            try {
                const res = await axiosClient.get(`/chat/history/${targetuserId}`);

                const mappedMessages = res.data.map(msg => ({
                    id: msg.id,
                    text: msg.isDelete ? "This message is deleted" : msg.text,
                    image: msg.image,
                    file: msg.file,
                    firstname: msg.senderId === user.id ? user.firstname : (targetUser?.firstname || "User"),
                    isMe: msg.senderId === user.id,
                    date: msg.createdAt,
                    isDelete: msg.isDelete,
                    imageUrl: msg.senderId === user.id ? user.imageUrl : targetUser?.imageUrl,
                    parentMessage: msg.parentMessage
                }));
                setMessages(mappedMessages);

                const savedSeenId = localStorage.getItem(`lastSeen_${user.id}_${targetuserId}`);
                setLastSeenId(savedSeenId);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [targetuserId, user?.id, targetUser]);

    // Initial Scroll Logic
    const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
    useEffect(() => {
        if (!loading && !hasInitialScrolled) {
            if (messages.length > 0) {
                scrollToBottom('auto');
            }
            setHasInitialScrolled(true);
            return () => {};
        }
    }, [loading, hasInitialScrolled, messages.length]);

    // File Upload Logic
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setFilePreview(url);
        } else {
            setFilePreview(null);
        }
        setFileCaption("");
    };

    const handleCancelFile = () => {
        if (filePreview) URL.revokeObjectURL(filePreview);
        setSelectedFile(null);
        setFilePreview(null);
        setFileCaption("");
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Voice Recording Functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                if (isRecordingCancelledRef.current) {
                    setIsRecording(false);
                    return;
                }
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            isRecordingCancelledRef.current = false;
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Mic error:", error);
            setToast("Permission denied for microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            isRecordingCancelledRef.current = false;
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            clearInterval(recordingTimerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current) {
            isRecordingCancelledRef.current = true;
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setAudioBlob(null);
        setRecordingTime(0);
        clearInterval(recordingTimerRef.current);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (audioBlob) {
            sendVoiceMessage();
        }
    }, [audioBlob]);

    const sendVoiceMessage = async () => {
        if (!audioBlob) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", audioBlob, "voice_message.webm");

        try {
            const res = await axiosClient.post("/chat/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });
            if (res.data?.url) {
                sendDirectMessage("", null, res.data.url, "voice_message.webm");
            } else {
                console.error("Voice Upload Error:", res.data);
                setToast("Cloud upload failed");
            }
            setAudioBlob(null);
            setRecordingTime(0);
        } catch (error) {
            console.error("Upload error:", error);
            setToast("Failed to upload voice message");
        } finally {
            setIsUploading(false);
        }
    };


    const handleSendFile = async () => {
        if (!selectedFile) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await axiosClient.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { url, type, originalName } = res.data;

            // Send with caption
            if (type === 'image') sendDirectMessage(fileCaption, url, null, originalName);
            else sendDirectMessage(fileCaption, null, url, originalName);

            setToast(`✅ Sent!`);
            handleCancelFile();
        } catch (error) {
            console.error("Upload error:", error);
            setToast("❌ Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const sendDirectMessage = (text, image = null, file = null, originalName = null) => {
        if (!socket || !user) return;

        const tempId = Date.now().toString();
        setMessages(prev => [...prev, {
            id: tempId,
            text,
            image,
            file,
            originalName,
            firstname: user.firstname,
            isMe: true,
            date: new Date(),
            imageUrl: user.imageUrl,
            parentMessage: null
        }]);

        socket.emit("sendMessage", {
            firstname: user.firstname,
            userId: user.id,
            targetuserId,
            text,
            image,
            file,
            originalName,
            parentMessageId: null
        }, (response) => {
            if (response.success && response.id) {
                setMessages(prev => prev.map(msg =>
                    msg.id === tempId ? { ...msg, id: response.id } : msg
                ));
                // Notify Inbox to move this user to top
                window.dispatchEvent(new CustomEvent('chatUpdated', {
                    detail: { targetId: targetuserId, lastMessage: text || (image ? "Image" : "File") }
                }));
            }
        });
        setTimeout(() => scrollToBottom(), 50);
    };

    // Emoji Picker Outside Click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const onEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    useEffect(() => {
        setHasInitialScrolled(false);
    }, [targetuserId]);

    useEffect(() => {
        setAssistantData(null);
        setAssistantError("");
        setAssistantTone("polite");
        setAiMessages([]);
        setAiInput('');
        setAiOverlayMode('ask');
    }, [targetuserId]);

    const scrollToBottom = (behavior = 'smooth') => {
        if (!scrollContainerRef.current) return;
        if (behavior === 'auto') {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior });
        }
    };

    // Intersection Observer
    useEffect(() => {
        if (loading || !messages.length) return;
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const msgId = entry.target.dataset.id;
                    localStorage.setItem(`lastSeen_${user.id}_${targetuserId}`, msgId);
                }
            });
        }, { threshold: 0.5, root: scrollContainerRef.current });

        const messageElements = document.querySelectorAll('.message-bubble-wrapper');
        messageElements.forEach(el => observerRef.current.observe(el));
        return () => observerRef.current?.disconnect();
    }, [loading, messages, targetuserId, user?.id]);

    // Socket Connection
    useEffect(() => {
        if (!user || !targetuserId) return;
        const newSocket = createSocketConnection();
        setSocket(newSocket);

        newSocket.emit("joinChat", { firstname: user.firstname, userId: user.id, targetuserId });
        newSocket.emit("userConnected", { userId: user.id });

        newSocket.emit("checkStatus", { userId: targetuserId }, (response) => {
            if (response.status === 'online') setIsTargetOnline(true);
            else {
                setIsTargetOnline(false);
                setTargetLastSeen(response.status);
            }
        });

        const handleIncomingMessage = (data) => {
            if (String(data.senderId) === String(user.id)) return;
            setMessages((prev) => [...prev, {
                id: data.id || Date.now() + Math.random(),
                firstname: data.firstname,
                text: data.text,
                image: data.image,
                file: data.file,
                isMe: false,
                date: data.createdAt || new Date(),
                isDelete: data.isDelete || false,
                imageUrl: targetUser?.imageUrl,
                parentMessage: data.parentMessage
            }]);

            // Notify Inbox to move this user to top
            window.dispatchEvent(new CustomEvent('chatUpdated', {
                detail: { targetId: data.senderId, lastMessage: data.text || (data.image ? "Image" : "File") }
            }));

            setTimeout(() => scrollToBottom('smooth'), 100);
        };

        newSocket.on('receiveMessage', handleIncomingMessage);
        newSocket.on("messageDeleted", ({ messageId }) => {
            setMessages((prev) => prev.map(msg =>
                msg.id === messageId ? { ...msg, isDelete: true, text: "This message is deleted" } : msg
            ));
        });
        newSocket.on("messageUpdated", ({ messageId, text }) => {
            setMessages((prev) => prev.map(msg =>
                msg.id === messageId ? { ...msg, text: text } : msg
            ));
        });
        newSocket.on("statusUpdate", (data) => {
            if (String(data.userId) === String(targetuserId)) {
                if (data.status === 'online') setIsTargetOnline(true);
                else {
                    setIsTargetOnline(false);
                    setTargetLastSeen(data.status);
                }
            }
        });

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user, targetuserId, targetUser]);

    const handleUpdateMessage = async () => {
        if (!updateMessage || !newMessage.trim()) return;
        try {
            setMessages(prev => prev.map(msg => msg.id === updateMessage ? { ...msg, text: newMessage } : msg));
            const currentMsgId = updateMessage;
            setUpdateMessage(null);
            setNewMessage("");
            if (inputRef.current) inputRef.current.style.height = 'auto';
            await axiosClient.put(`/chat/message/${currentMsgId}`, { text: newMessage });
        } catch (error) {
            console.error("Error updating message:", error);
        }
    };

    const applyAssistantText = (text) => {
        if (!text) return;
        setNewMessage(text);
        setShowAIOverlay(false);
        if (assistantData) {
            setPendingAssistantHistory({
                snapshot: assistantData,
                replyText: text,
            });
        }
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.style.height = 'auto';
                inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
            }
        }, 0);
    };

    const buildAssistantGeneratedReplies = (snapshot) => {
        if (!snapshot) return [];

        return [
            snapshot.top_reply,
            ...(snapshot.reply_suggestions || []),
            ...(snapshot.emoji_replies || []),
            ...(snapshot.same_message_variants || []),
            snapshot.grouped_replies?.top_reply,
            snapshot.grouped_replies?.safe_reply,
            snapshot.grouped_replies?.warm_reply,
            snapshot.grouped_replies?.playful_reply,
            snapshot.grouped_replies?.curious_reply,
            snapshot.grouped_replies?.direct_reply,
            snapshot.rewrites?.clean,
            snapshot.rewrites?.short,
            snapshot.rewrites?.warm,
            snapshot.rewrites?.confident,
        ].filter((item, index, arr) => item && arr.indexOf(item) === index);
    };

    const saveAssistantHistory = async (replyText, snapshot) => {
        if (!targetuserId || !replyText?.trim() || !snapshot) return;

        try {
            const { data } = await axiosClient.post(`/message-ai/history/${targetuserId}`, {
                conversationId: snapshot.conversationId || snapshot.conversation_id || null,
                contextSummary: snapshot.context_preview || snapshot.context_focus || snapshot.conversation_summary || "No recent context available.",
                lastMessage: snapshot.last_other_message || "",
                sentReply: replyText,
                tone: snapshot.tone || assistantTone,
                detectedIntent: snapshot.detected_intent || "",
                topReply: snapshot.top_reply || "",
                generatedReplies: buildAssistantGeneratedReplies(snapshot),
            });

            if (data?.history) {
                setAssistantHistory((prev) => [data.history, ...prev].slice(0, 20));
            }
        } catch (error) {
            console.error("Failed to save message assistant history:", error);
        }
    };

    const saveAskAiHistory = async (questionText, answerText) => {
        if (!targetuserId || !user?.id || !questionText?.trim() || !answerText?.trim()) return;
        const historyPayload = {
            question: questionText.trim(),
            answer: answerText.trim(),
            messages: [
                { role: 'user', text: questionText.trim() },
                { role: 'ai', text: answerText.trim() },
            ],
        };
        try {
            const { data } = await axiosClient.post(`/message-ai/ask-history/${targetuserId}`, historyPayload);
            if (data?.history) {
                setAssistantAskHistory((prev) => [data.history, ...prev].slice(0, 20));
            }
        } catch (error) {
            console.error("Failed to save Ask AI history:", error);
        }
    };

    const handleContinueAskHistory = (historyItem) => {
        if (!historyItem) return;

        const restoredMessages = Array.isArray(historyItem.messages) && historyItem.messages.length > 0
            ? historyItem.messages
            : [
                { role: 'user', text: historyItem.question || '' },
                { role: 'ai', text: historyItem.answer || '' },
            ].filter((item) => item.text);

        setAiOverlayMode('ask');
        setAiMessages(restoredMessages);
        setAiInput('');
        setShowAIOverlay(true);
    };

    const handleClearAskHistory = async () => {
        if (!targetuserId || !user?.id) return;

        try {
            await axiosClient.delete(`/message-ai/ask-history/${targetuserId}`);
            setAssistantAskHistory([]);
            setAiMessages([]);
        } catch (error) {
            console.error("Failed to clear Ask AI history:", error);
        }
    };

    const handleClearReplyHistory = async () => {
        if (!targetuserId) return;

        try {
            await axiosClient.delete(`/message-ai/history/${targetuserId}`);
            setAssistantHistory([]);
        } catch (error) {
            console.error("Failed to clear reply history:", error);
        }
    };

    const handleDeleteAskHistoryItem = async (historyId) => {
        if (!historyId || !targetuserId || !user?.id) return;
        try {
            await axiosClient.delete(`/message-ai/ask-history/${targetuserId}/${historyId}`);
            setAssistantAskHistory((prev) => prev.filter((item) => item.id !== historyId));
        } catch (error) {
            console.error("Failed to delete Ask AI history item:", error);
        }
    };

    const handleDeleteReplyHistoryItem = async (historyId) => {
        if (!historyId || !targetuserId) return;

        try {
            await axiosClient.delete(`/message-ai/history/${targetuserId}/${historyId}`);
            setAssistantHistory((prev) => prev.filter((item) => item.id !== historyId));
        } catch (error) {
            console.error("Failed to delete reply history item:", error);
        }
    };

    const sendAssistantReply = (text) => {
        if (!socket || !user || !text?.trim()) return;

        const replyText = text.trim();
        const tempId = Date.now().toString();
        const parentMsg = replyTo ? { ...replyTo } : null;
        const assistantSnapshot = assistantData;
        setPendingAssistantHistory(null);

        setMessages(prev => [...prev, {
            id: tempId,
            text: replyText,
            firstname: user.firstname,
            isMe: true,
            date: new Date(),
            imageUrl: user.imageUrl,
            parentMessage: parentMsg
        }]);

        socket.emit("sendMessage", {
            firstname: user.firstname,
            userId: user.id,
            targetuserId,
            text: replyText,
            image: null,
            file: null,
            parentMessageId: replyTo?.id
        }, (response) => {
            if (response.success && response.id) {
                setMessages(prev => prev.map(msg =>
                    msg.id === tempId ? { ...msg, id: response.id } : msg
                ));
                localStorage.setItem(`lastSeen_${user.id}_${targetuserId}`, response.id);
                window.dispatchEvent(new CustomEvent('chatUpdated', {
                    detail: { targetId: targetuserId, lastMessage: replyText }
                }));
                saveAssistantHistory(replyText, assistantSnapshot);
            }
        });

        setReplyTo(null);
        setShowAIOverlay(false);
        setAssistantData(null);
        setNewMessage("");
        if (inputRef.current) inputRef.current.style.height = 'auto';
        setTimeout(() => scrollToBottom(), 50);
    };

    const buildAskAiContextWindow = () => {
        const recentTurns = [...aiMessages]
            .filter((message) => message?.role === 'user' || message?.role === 'ai')
            .slice(-10)
            .map((message) => ({
                role: message.role === 'user' ? 'user' : 'ai',
                text: String(message.text || '').trim(),
            }))
            .filter((message) => message.text);

        return recentTurns;
    };

    const handleAssistantGenerate = async () => {
        if (!targetuserId) return;
        const activeDraft = showAIOverlay ? aiInput : newMessage;

        setShowAIOverlay(true);
        setAiOverlayMode('replies');
        setAssistantLoading(true);
        setAssistantError("");
        setAssistantData(null);
        setAiThinkingStep('analysing');
        setTimeout(() => setAiThinkingStep('thinking'), 800);

        try {
            const { data } = await axiosClient.post(`/message-ai/conversation/${targetuserId}`, {
                mode: "replies",
                draft: activeDraft,
                tone: assistantTone,
            });
            setAiThinkingStep('generating');
            setAssistantData(data);
            setAiThinkingStep('idle');
        } catch (error) {
            console.error("Message assistant failed:", error);
            setAssistantError("Could not load message suggestions right now.");
            setAiThinkingStep('idle');
        } finally {
            setAssistantLoading(false);
        }
    };

    const handleAISubmit = async (query) => {
        if (!query.trim() || isAILoading) return;

        const userQuery = query.trim();
        setAiInput('');

        setAiMessages(prev => [...prev, { role: 'user', text: userQuery }, { role: 'ai', text: '' }]);
        setIsAILoading(true);
        setAiThinkingStep('analysing');
        setTimeout(() => setAiThinkingStep('thinking'), 800);

        try {

            const response = await fetch(`${apiBaseUrl}/message-ai/conversation/stream/${targetuserId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    mode: 'ask',
                    question: userQuery,
                    tone: assistantTone,
                    assistant_history: buildAskAiContextWindow(),
                })
            });

            if (!response.ok) throw new Error("API request failed");
            if (!response.body) throw new Error("AI stream did not return a readable response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullAiAnswer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (fullAiAnswer === "") {
                    setAiThinkingStep('generating');
                }
                const chunk = decoder.decode(value, { stream: true });
                fullAiAnswer += chunk;

                setAiMessages(prev => {
                    const last = prev[prev.length - 1];
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...last, text: fullAiAnswer };
                    return updated;
                });
                if (fullAiAnswer.length > 50) setAiThinkingStep('refining');
            }
            if (fullAiAnswer.trim()) {
                await saveAskAiHistory(userQuery, fullAiAnswer);
            }
            setAiThinkingStep('idle');
        } catch (error) {
            console.error("AI Assistant Error:", error);
            setAiMessages(prev => {
                const last = prev[prev.length - 1];
                const updated = [...prev];
                updated[updated.length - 1] = { ...last, text: "I encountered an error while processing your request. Please try again later." };
                return updated;
            });
        } finally {
            setIsAILoading(false);
            setAiThinkingStep('idle');
        }
    };

    const sendMessage = () => {
        if (showAIOverlay) {
            handleAISubmit(aiInput);
            return;
        }
        if (updateMessage) {
            handleUpdateMessage();
            return;
        }
        if (socket && (newMessage.trim() || replyTo)) {
            const text = newMessage.trim();
            const tempId = Date.now().toString();
            const parentMsg = replyTo ? { ...replyTo } : null;

            setMessages(prev => [...prev, {
                id: tempId,
                text: text,
                firstname: user.firstname,
                isMe: true,
                date: new Date(),
                imageUrl: user.imageUrl,
                parentMessage: parentMsg
            }]);

            socket.emit("sendMessage", {
                firstname: user.firstname,
                userId: user.id,
                targetuserId,
                text: text,
                image: null,
                file: null,
                parentMessageId: replyTo?.id
            }, (response) => {
                if (response.success && response.id) {
                    setMessages(prev => prev.map(msg =>
                        msg.id === tempId ? { ...msg, id: response.id } : msg
                    ));
                    localStorage.setItem(`lastSeen_${user.id}_${targetuserId}`, response.id);

                    // Notify Inbox to move this user to top
                    window.dispatchEvent(new CustomEvent('chatUpdated', {
                        detail: { targetId: targetuserId, lastMessage: text }
                    }));

                    if (pendingAssistantHistory?.snapshot) {
                        saveAssistantHistory(text, pendingAssistantHistory.snapshot);
                    }
                }
            });

            setNewMessage("");
            setReplyTo(null);
            setPendingAssistantHistory(null);
            if (inputRef.current) inputRef.current.style.height = 'auto';
            setTimeout(() => scrollToBottom(), 50);
        }
    };

    const confirmDelete = async (type) => {
        const id = deleteConfirmation.messageId;
        if (!id) return;
        try {
            setDeleteConfirmation({ isOpen: false, messageId: null, isMe: false });
            if (type === 'everyone') {
                setMessages(prev => {
                    const updated = prev.map(msg => msg.id === id ? { ...msg, isDelete: true, text: "This message is deleted" } : msg);
                    // Notify Inbox of new last message
                    const lastVisible = updated.filter(m => !m.isDelete).at(-1);
                    window.dispatchEvent(new CustomEvent('chatUpdated', {
                        detail: {
                            targetId: targetuserId,
                            lastMessage: lastVisible ? lastVisible.text : "No messages yet"
                        }
                    }));
                    return updated;
                });
                await axiosClient.put(`/chat/message/${id}`, { isDelete: true });
            } else {
                setMessages(prev => {
                    const filtered = prev.filter(msg => msg.id !== id);
                    // Notify Inbox of new last message
                    const lastVisible = filtered.filter(m => !m.isDelete).at(-1);
                    window.dispatchEvent(new CustomEvent('chatUpdated', {
                        detail: {
                            targetId: targetuserId,
                            lastMessage: lastVisible ? lastVisible.text : "No messages yet"
                        }
                    }));
                    return filtered;
                });
                await axiosClient.delete(`/chat/message/${id}`);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const [menuDirection, setMenuDirection] = useState('down');
    const toggleMenu = (id, e) => {
        if (openMenuId === id) {
            setOpenMenuId(null);
            return;
        }
        if (e) {
            const threshold = window.innerHeight * 0.6;
            setMenuDirection(e.clientY > threshold ? 'up' : 'down');
        } else {
            setMenuDirection('down');
        }
        setOpenMenuId(id);
    };

    const handleEditStart = (id, text) => {
        setUpdateMessage(id);
        setNewMessage(text);
        setOpenMenuId(null);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(text.length, text.length);
            }
        }, 10);
    };

    const handleDeleteStart = (id, isMe, isDeleted = false) => {
        // If message is already deleted for everyone, only show "Delete for me"
        const showDeleteForEveryone = isMe && !isDeleted;
        setDeleteConfirmation({ isOpen: true, messageId: id, isMe: showDeleteForEveryone });
        setOpenMenuId(null);
    };

    const handleBulkDelete = async (type = 'me') => {
        if (selectedMessages.size === 0) return;

        if (!bulkDeleteConfirmOpen) {
            setBulkDeleteConfirmOpen(true);
            return;
        }

        try {
            setIsBulkDeleting(true);
            setBulkDeleteConfirmOpen(false);
            const res = await axiosClient.post("/chat/delete-bulk", {
                messageIds: Array.from(selectedMessages),
                deleteType: type
            });

            if (res.data.success) {
                // Update local state based on delete type
                if (type === 'everyone') {
                    // Soft delete: Keep in list but mark as deleted
                    setMessages(prev => prev.map(msg =>
                        selectedMessages.has(msg.id) ? { ...msg, isDelete: true, text: "This message is deleted", image: null, file: null, originalName: null } : msg
                    ));
                } else {
                    // Hard delete (for me): Remove from UI entirely
                    setMessages(prev => prev.filter(msg => !selectedMessages.has(msg.id)));
                }

                setToast(`Deleted ${selectedMessages.size} messages`);
                exitSelectMode();

                // Notify Inbox of new last message
                const lastVisible = messages.filter(m => !selectedMessages.has(m.id) && !m.isDelete).at(-1);
                window.dispatchEvent(new CustomEvent('chatUpdated', {
                    detail: {
                        targetId: targetuserId,
                        lastMessage: lastVisible ? lastVisible.text : "No messages yet"
                    }
                }));
            }
        } catch (error) {
            console.error("Bulk delete failed:", error);
            setToast("Failed to delete messages");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleMessageSelection = (id) => {
        setSelectedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const exitSelectMode = () => {
        setIsSelectMode(false);
        setSelectedMessages(new Set());
    };

    if (loading) return <LoadingChat />;

    return (
        <div className="h-full bg-[#040406] text-white flex flex-col relative overflow-hidden" onClick={() => setOpenMenuId(null)}>
            {/* Extremely Subtle Ambient Purple Light */}
            <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.04),transparent_50%)]" />



            <AnimatePresence>
                {showAIOverlay && (
                    <AIAssistantOverlay
                        isOpen={showAIOverlay}
                        onClose={() => {
                            setShowAIOverlay(false);
                            setAssistantData(null);
                            setAiMessages([]);
                            setAssistantError("");
                            setAiInput('');
                            setAiOverlayMode('ask');
                        }}
                        messages={aiMessages}
                        onNewAskChat={() => setAiMessages([])}
                        isLoading={isAILoading}
                        thinkingStep={aiThinkingStep}
                        title="AI Assistant"
                        subtitle="Messaging Co-pilot"
                        emptyTitle="Ask anything about this chat"
                        emptyDescription="Summaries, reply ideas, or context analysis."
                        inputValue={aiInput}
                        onInputChange={setAiInput}
                        onSubmit={() => handleAISubmit(aiInput)}
                        mode={aiOverlayMode}
                        onModeChange={setAiOverlayMode}
                        replyData={assistantData}
                        replyLoading={assistantLoading}
                        error={aiOverlayMode === 'replies' ? assistantError : ''}
                        selectedTone={assistantTone}
                        onToneChange={setAssistantTone}
                        onGenerateReplies={handleAssistantGenerate}
                        onUseReply={applyAssistantText}
                        onSendReply={sendAssistantReply}
                        history={assistantHistory}
                        askHistory={assistantAskHistory}
                        onContinueAskHistory={handleContinueAskHistory}
                        onClearAskHistory={handleClearAskHistory}
                        onClearReplyHistory={handleClearReplyHistory}
                        onDeleteAskHistoryItem={handleDeleteAskHistoryItem}
                        onDeleteReplyHistoryItem={handleDeleteReplyHistoryItem}
                    />
                )}
            </AnimatePresence>

            {/* Premium Glass Header */}
            <header className="flex items-center justify-between pl-2 pr-6 py-4 bg-white/[0.03] backdrop-blur-3xl border-b border-white/10 sticky top-0 z-20 h-[88px] shadow-[0_10px_50px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/messages')} className="p-2 -ml-1 mr-2 text-white/50 hover:bg-white/10 hover:text-white rounded-full transition-all active:scale-95 group">
                        <ArrowLeft size={24} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <div className="w-[56px] h-[56px] rounded-[24px] overflow-hidden border border-white/20 p-[2px] bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] shadow-2xl transition-all duration-500 group-hover:scale-105">
                                <img src={targetUser?.imageUrl || "https://cdn-icons-png.flaticon.com/512/219/219969.png"} alt="User" className="w-full h-full rounded-[21px] object-cover bg-[#0a0a0f]" />
                            </div>
                            {isTargetOnline && (
                                <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#10b981] border-[3px] border-[#0a0a0f] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20">
                                    <div className="absolute inset-0 bg-white/40 rounded-full animate-ping" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[19px] font-black text-white tracking-tighter leading-none mb-1.5 uppercase italic">
                                {targetUser?.firstname} {targetUser?.lastname}
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isTargetOnline ? "bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"}`} />
                                <p className={`text-[9px] font-black tracking-[0.25em] uppercase transition-colors ${isTargetOnline ? "text-[#10b981]" : "text-white/20"}`}>
                                    {isTargetOnline ? "Active Now" : "Offline"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


            </header>

            {/* Chat Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden pl-2 pr-2 py-4 space-y-1 scrollbar-hide relative z-10 opacity-100">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-500">
                        <div
                            onClick={() => sendDirectMessage(stickerMessage)}
                            className="relative group cursor-pointer active:scale-95 transition-all duration-300"
                        >
                            <div className="absolute -inset-8 bg-violet-500/20 blur-3xl rounded-full animate-pulse z-0"></div>
                            <div className="absolute -inset-4 bg-fuchsia-500/10 blur-xl rounded-full z-0 group-hover:scale-110 transition-transform duration-500"></div>

                            <img
                                src={randomSticker.url}
                                alt="Say Hi"
                                className="w-32 h-32 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.35)] group-hover:rotate-6 transition-transform duration-300"
                            />
                            <div className="absolute -top-2 -right-2 bg-pink-500 p-2 rounded-full text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-bounce duration-1000 z-20 border-2 border-black">
                                <Plus size={18} strokeWidth={4} />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold text-white/90">{stickerMessage}!</h3>
                            <p className="text-sm text-neutral-500">Tap the sticker to start the conversation</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const msgDate = new Date(msg.date).toLocaleDateString();
                        const prevMsgDate = index > 0 ? new Date(messages[index - 1].date).toLocaleDateString() : null;
                        const showDate = msgDate !== prevMsgDate;

                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
                        const sameAsPrev = prevMsg && !showDate && prevMsg.isMe === msg.isMe;
                        const sameAsNext = nextMsg && new Date(nextMsg.date).toLocaleDateString() === msgDate && nextMsg.isMe === msg.isMe;
                        const isFirstInGroup = !sameAsPrev;
                        const isLastInGroup = !sameAsNext;

                        return (
                            <div key={msg.id} data-id={msg.id} className={`message-bubble-wrapper ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}>
                                {showDate && (
                                    <div className="flex items-center gap-6 my-6 px-4">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                        <div className="bg-white/[0.02] backdrop-blur-3xl px-6 py-2 rounded-full text-[10px] font-black text-white/50 border border-white/10 uppercase tracking-[0.2em] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                            {new Date(msg.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            <div className="w-1 h-1 rounded-full bg-pink-500/50 shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
                                        </div>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                    </div>
                                )}
                                <MessageBubble
                                    msg={msg}
                                    targetUser={targetUser}
                                    openMenuId={openMenuId}
                                    toggleMenu={toggleMenu}
                                    handleEdit={handleEditStart}
                                    handleDelete={handleDeleteStart}
                                    handleReply={(m) => { setReplyTo({ id: m.id, text: m.text, firstname: m.firstname }); scrollToBottom(); }}
                                    menuDirection={menuDirection}
                                    isSelectMode={isSelectMode}
                                    isSelected={selectedMessages.has(msg.id)}
                                    onToggleSelect={toggleMessageSelection}
                                    onEnterSelectMode={(id) => {
                                        setIsSelectMode(true);
                                        toggleMessageSelection(id);
                                    }}
                                    setToast={setToast}
                                    setOpenMenuId={setOpenMenuId}
                                    setSelectedMessages={setSelectedMessages}
                                    isFirstInGroup={isFirstInGroup}
                                    isLastInGroup={isLastInGroup}
                                />
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <footer className="sticky bottom-0 z-30 pt-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pl-2 pr-2 bg-white/[0.03] backdrop-blur-3xl border-t border-white/10">
                <div className="w-full flex items-center gap-1 md:gap-1">
                    {/* Plus Action */}
                    {!isRecording && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-[44px] h-[44px] shrink-0 flex items-center justify-center text-[#3b82f6] hover:bg-white/5 rounded-full transition-all active:scale-95 group/plus"
                        >
                            <Plus size={28} strokeWidth={3} className="group-hover/plus:rotate-90 transition-transform duration-300" />
                        </button>
                    )}

                    <div className="flex-1 bg-[#1c1c1e]/90 backdrop-blur-3xl border border-white/5 rounded-[32px] px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex flex-col relative group/input focus-within:border-[#3b82f6]/50 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.2)] focus-within:bg-[#252528] transition-all duration-300">
                        {replyTo && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mx-1 mb-2 px-4 py-3 bg-white/[0.03] backdrop-blur-xl border-l-[4px] border-[#3b82f6] rounded-[20px] flex items-center justify-between shadow-lg"
                            >
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[#3b82f6] text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">Replying to {replyTo.firstname}</span>
                                    <span className="text-white/60 text-[13px] truncate font-medium">{replyTo.text}</span>
                                </div>
                                <button onClick={() => setReplyTo(null)} className="p-1.5 text-white/20 hover:text-white transition-colors">
                                    <X size={18} strokeWidth={3} />
                                </button>
                            </motion.div>
                        )}

                        <div className="flex items-center gap-2">
                            {!isRecording ? (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowAIOverlay(true); }}
                                        className={`ml-3 p-1.5 rounded-xl transition-all duration-300 ${showAIOverlay ? 'text-[#3b82f6] scale-110' : 'text-white/20 hover:text-white/60'}`}
                                    >
                                        <Sparkles size={20} strokeWidth={2.5} />
                                    </button>

                                    <textarea
                                        ref={inputRef}
                                        rows="1"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            e.target.style.height = 'auto';
                                            if (e.target.scrollHeight > 32) {
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent text-white text-[15px] font-medium py-3 px-1 focus:outline-none placeholder-white/20 resize-none max-h-48 transition-all scrollbar-hide"
                                    />

                                    <button onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }} className={`p-1.5 mr-2 transition-all duration-300 ${showEmojiPicker ? "text-[#3b82f6] scale-110" : "text-white/20 hover:text-white/60"}`}>
                                        <Smile size={24} strokeWidth={2.5} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-between px-4 py-2 text-[#3b82f6] font-bold">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                                        <span className="tabular-nums text-lg">{formatTime(recordingTime)}</span>
                                    </div>
                                    <button onClick={cancelRecording} className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors">Cancel</button>
                                </div>
                            )}
                        </div>

                        {showEmojiPicker && (
                            <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-6 z-[100] shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10 ring-1 ring-white/5 animate-in slide-in-from-bottom-4 duration-300">
                                <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={320} height={400} skinTonesDisabled />
                            </div>
                        )}
                    </div>

                    {/* Mic / Send Button */}
                    <button
                        className={`rounded-full w-[48px] h-[48px] shrink-0 flex items-center justify-center active:scale-90 transition-all duration-500 shadow-xl relative overflow-hidden ${isRecording || newMessage.trim() || updateMessage || (isUploading && audioBlob) ? "bg-[#3b82f6] text-white shadow-[0_5px_15px_rgba(59,130,246,0.3)]" : "bg-[#1c1c1e] text-white border border-white/5"}`}
                        onClick={isUploading ? null : (isRecording ? stopRecording : (newMessage.trim() || updateMessage ? sendMessage : startRecording))}
                        disabled={isUploading && !audioBlob}
                    >
                        {isUploading && audioBlob ? <Loader2 size={24} className="animate-spin text-white" /> : (isRecording || newMessage.trim() || updateMessage ? <SendHorizontal size={22} strokeWidth={3} className="ml-1" /> : <Mic size={22} strokeWidth={3} />)}
                    </button>
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />
            </footer>

            {/* Bottom Selection Bar */}
            {isSelectMode && (
                <div className="absolute bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom duration-300">
                    <div className="bg-[#0a0a0f]/80 backdrop-blur-3xl border-t border-white/10 p-3 pb-[calc(env(safe-area-inset-bottom)+20px)] min-h-[90px] flex flex-col justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        <div className="w-full flex items-center justify-between px-6">
                            <div className="flex items-center gap-4">
                                <button onClick={exitSelectMode} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all">
                                    <X size={26} />
                                </button>
                                <span className="text-lg font-black text-white italic uppercase tracking-tight">{selectedMessages.size} selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setBulkDeleteConfirmOpen(true)}
                                    disabled={selectedMessages.size === 0 || isBulkDeleting}
                                    className={`p-3 rounded-2xl transition-all ${selectedMessages.size > 0 ? "text-red-500 hover:bg-red-500/10 active:scale-95" : "text-white/10"} ${isBulkDeleting ? "animate-pulse" : ""}`}
                                    title="Delete"
                                >
                                    {isBulkDeleting ? <Loader2 size={24} className="animate-spin" /> : <Trash2 size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {bulkDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0f]/95 w-full max-w-[320px] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 p-7 animate-in zoom-in-95 duration-300">
                        <h3 className="text-xl font-black text-center mb-2 italic uppercase">Delete Message?</h3>
                        <p className="text-[13px] text-white/40 text-center mb-6 leading-relaxed">Are you sure you want to delete <span className="text-white font-bold">{selectedMessages.size}</span> messages from your history?</p>
                        <div className="flex flex-col gap-3">
                            {canDeleteForEveryone && (
                                <button onClick={() => handleBulkDelete('everyone')} className="w-full py-3.5 bg-red-500/10 text-red-500 font-black uppercase text-[11px] tracking-widest hover:bg-red-500/20 rounded-2xl transition-all active:scale-95">Delete for everyone</button>
                            )}
                            <button onClick={() => handleBulkDelete('me')} className="w-full py-3.5 bg-white/[0.03] text-[#3b82f6] font-black uppercase text-[11px] tracking-widest hover:bg-white/[0.08] rounded-2xl transition-all active:scale-95">Delete for me</button>
                            <button onClick={() => setBulkDeleteConfirmOpen(false)} className="w-full py-3.5 text-white/30 font-black uppercase text-[11px] tracking-widest hover:bg-white/[0.05] rounded-2xl transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0f]/95 w-full max-w-[320px] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 p-7 animate-in zoom-in-95 duration-300">
                        <h3 className="text-xl font-black text-center mb-2 italic uppercase">Delete for Me?</h3>
                        <p className="text-[13px] text-white/40 text-center mb-6 leading-relaxed">This message will be permanently removed from your chat history.</p>
                        <div className="flex flex-col gap-3">
                            {deleteConfirmation.isMe && (
                                <button onClick={() => confirmDelete('everyone')} className="w-full py-3.5 bg-red-500/10 text-red-500 font-black uppercase text-[11px] tracking-widest hover:bg-red-500/20 rounded-2xl transition-all active:scale-95">Delete for everyone</button>
                            )}
                            <button onClick={() => confirmDelete('me')} className="w-full py-3.5 bg-white/[0.03] text-[#3b82f6] font-black uppercase text-[11px] tracking-widest hover:bg-white/[0.08] rounded-2xl transition-all active:scale-95">Delete for me</button>
                            <button onClick={() => setDeleteConfirmation({ isOpen: false, messageId: null, isMe: false })} className="w-full py-3.5 text-white/30 font-black uppercase text-[11px] tracking-widest hover:bg-white/[0.05] rounded-2xl transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toastbar message={toast} onClose={() => setToast(null)} />}

            {/* WhatsApp-style Image/File Preview Overlay */}
            {selectedFile && (
                <div className="absolute inset-0 z-[200] bg-[#000000] flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                        <button onClick={handleCancelFile} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-[15px] font-semibold text-white">{selectedFile.name}</span>
                            <span className="text-[11px] text-neutral-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <div className="w-10" />
                    </div>

                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-[#0c0c0c]">
                        {filePreview ? (
                            <img src={filePreview} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                        ) : (
                            <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                                <div className="w-24 h-24 bg-[#1c1c1e] rounded-2xl flex items-center justify-center text-[#ff3b30] shadow-xl ring-1 ring-white/5">
                                    <FileText size={48} />
                                </div>
                                <span className="text-white text-lg font-medium tracking-tight">Preview not available</span>
                                <span className="text-neutral-500 text-sm">Document: {selectedFile.name.split('.').pop().toUpperCase()}</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5 pb-[calc(env(safe-area-inset-bottom)+16px)]">
                        <div className="max-w-4xl mx-auto flex items-end gap-3">
                            <div className="flex-1 bg-[#2c2c2e] rounded-[24px] px-4 py-2 ring-1 ring-white/5 shadow-inner">
                                <textarea
                                    autoFocus
                                    placeholder="Add a caption..."
                                    value={fileCaption}
                                    onChange={(e) => setFileCaption(e.target.value)}
                                    rows={1}
                                    style={{ height: 'auto' }}
                                    className="w-full bg-transparent text-white py-1 outline-none text-[16px] resize-none scrollbar-hide"
                                />
                            </div>
                            <button
                                onClick={handleSendFile}
                                disabled={isUploading}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${isUploading ? 'bg-neutral-700' : 'bg-[#007aff] hover:bg-[#0066d6]'}`}
                            >
                                {isUploading ? <Loader2 size={24} className="text-white animate-spin" /> : <SendHorizontal size={24} className="text-white ml-0.5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

const downloadFile = async (url, filename) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Download failed:", error);
        window.open(url, '_blank'); // fallback
    }
};

const MessageBubble = ({ msg, targetUser, openMenuId, toggleMenu, handleEdit, handleDelete, handleReply, menuDirection, isSelectMode, isSelected, onToggleSelect, onEnterSelectMode, setToast, setOpenMenuId, setSelectedMessages, isFirstInGroup, isLastInGroup }) => {
    const { user } = useUserContext();
    const displayImage = !msg.isMe ? (targetUser?.imageUrl || msg.imageUrl) : msg.imageUrl;
    const displayName = !msg.isMe ? (targetUser?.firstname || msg.firstname) : msg.firstname;

    // Dynamic rounding based on group position
    const getBubbleRadius = () => {
        const R = '20px'; // full radius
        const r = '6px';  // soft corner
        if (msg.isMe) {
            if (!isFirstInGroup && !isLastInGroup) return { borderRadius: `${R} ${r} ${r} ${R}` };
            if (!isFirstInGroup && isLastInGroup) return { borderRadius: `${R} ${R} ${r} ${R}` };
            return { borderRadius: `${R} ${R} ${r} ${R}` };
        } else {
            if (!isFirstInGroup && !isLastInGroup) return { borderRadius: `${r} ${R} ${R} ${r}` };
            if (!isFirstInGroup && isLastInGroup) return { borderRadius: `${R} ${R} ${R} ${r}` };
            return { borderRadius: `${R} ${R} ${R} ${r}` };
        }
    };

    return (
        <div className={`flex w-full items-end gap-2 group px-3 sm:px-5 transition-all duration-300 ${openMenuId === msg.id ? "z-[50] relative" : "z-0 relative"} ${isSelected ? "bg-white/[0.04]" : ""} ${isLastInGroup ? 'pb-1' : 'pb-0'}`}>
            {isSelectMode && (
                <div
                    onClick={() => onToggleSelect(msg.id)}
                    className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected ? "bg-[#8b5cf6] border-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "border-[#413c58] hover:border-white/40"}`}
                >
                    {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                </div>
            )}
            <div className={`flex flex-1 ${msg.isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                {!msg.isMe && (
                    isLastInGroup ? (
                        <div className="w-8 h-8 rounded-full bg-[#2a2a35] flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/5">
                            {displayImage ? (
                                <img src={displayImage} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-[12px] font-bold text-white/40">{displayName?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                    ) : (
                        <div className="w-8 flex-shrink-0" />
                    )
                )}
                <div
                    className={`max-w-[75%] md:max-w-[65%] px-4 py-2.5 relative min-w-[70px] cursor-pointer transition-all duration-300 shadow-sm ${isSelected ? "opacity-70 scale-[0.98]" : ""
                        } ${msg.isDelete
                            ? "bg-white/5 backdrop-blur-xl italic text-white/20 rounded-[24px] border border-white/5"
                            : msg.isMe
                                ? "bg-gradient-to-br from-blue-600 to-blue-500 rounded-[22px] rounded-br-[4px] text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)]"
                                : "bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-[22px] rounded-bl-[4px] text-white/95"
                        }`}
                    style={getBubbleRadius()}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isSelectMode) {
                            onToggleSelect(msg.id);
                        } else {
                            toggleMenu(msg.id, e);
                        }
                    }}
                >
                    <div className="flex flex-col gap-1">
                        {msg.parentMessage && !msg.isDelete && (
                            <div className={`p-2 rounded-xl border-l-4 text-[11px] mb-1 ${msg.isMe ? "bg-white/10 border-white/50" : "bg-white/5 border-violet-400"}`}>
                                <p className="font-bold">{msg.parentMessage.firstname}</p>
                                <p className="opacity-70 truncate">{msg.parentMessage.text}</p>
                            </div>
                        )}
                        {msg.isDelete ? (
                            <div className="flex items-center gap-1 opacity-60 text-[13px]"><Ban size={12} /><span>Message deleted</span></div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {msg.image && (
                                    <div className="relative group/img">
                                        <img src={msg.image} alt="Sent" className="max-w-full max-h-[300px] rounded-lg cursor-pointer transition-transform active:scale-[0.98]" onClick={() => window.open(msg.image, '_blank')} />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); downloadFile(msg.image, `image_${msg.id}.jpg`); }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/70 active:scale-90"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                )}
                                {msg.file && (
                                    (msg.originalName === "voice_message.webm" || msg.file.includes("voice_message.webm") || msg.file.includes("/video/upload/")) ? (
                                        <VoicePlayer
                                            src={msg.file}
                                            isMe={msg.isMe}
                                            avatar={!msg.isMe ? targetUser?.imageUrl : user?.imageUrl}
                                        />
                                    ) : (
                                        <div
                                            className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer hover:bg-black/10 transition-colors ${msg.isMe ? 'bg-white/10 border-white/20' : 'bg-black/20 border-white/10'}`}
                                            onClick={() => downloadFile(msg.file, msg.originalName || msg.file.split('/').pop().split('?')[0])}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-[#2c2c2e] flex items-center justify-center text-[#ff3b30] shrink-0">
                                                <FileText size={18} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[12px] truncate font-medium">{msg.originalName || msg.file.split('/').pop().split('?')[0]}</span>
                                                <span className="text-[9px] opacity-60 text-emerald-400 font-bold tracking-wider">CLICK TO DOWNLOAD</span>
                                            </div>
                                            <Download size={14} className="shrink-0 opacity-60 ml-auto" />
                                        </div>
                                    )
                                )}
                                {msg.text && <p className="text-[14px] leading-snug break-words whitespace-pre-wrap">{msg.text}</p>}
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span className={`text-[10px] ${msg.isMe ? "text-violet-100/70" : "text-white/30"}`}>{new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    {!isSelectMode && (
                        <button onClick={(e) => { e.stopPropagation(); toggleMenu(msg.id, e); }} className={`absolute top-2 right-2 p-0.5 rounded-full hover:bg-black/10 transition-all ${openMenuId === msg.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                            <ChevronDown size={14} />
                        </button>
                    )}
                    {openMenuId === msg.id && (
                        <div className={`absolute ${menuDirection === 'up' ? "bottom-full mb-2" : "top-full mt-2"} z-[999] bg-[#1c1a24]/95 backdrop-blur-3xl shadow-[0_10px_50px_rgba(0,0,0,0.6)] rounded-xl min-w-[160px] py-1.5 border border-white/10 ${msg.isMe ? "right-0" : "left-0"} animate-in fade-in zoom-in-95 duration-200`}>
                            {!msg.isDelete && <button onClick={() => { handleReply(msg); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm flex items-center gap-2 transition-all active:scale-95 text-white/90 font-medium"><CornerUpLeft size={16} /> Reply</button>}

                            {msg.text && !msg.isDelete && <button onClick={() => { navigator.clipboard.writeText(msg.text); setToast("Message copied"); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm flex items-center gap-2 transition-all active:scale-95 text-white/90 font-medium"><Copy size={16} /> Copy Text</button>}
                            {msg.isMe && !msg.isDelete && <button onClick={() => { handleEdit(msg.id, msg.text); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm flex items-center gap-2 transition-all active:scale-95 text-white/90 font-medium"><Pencil size={16} /> Edit Message</button>}

                            <div className="h-[1px] bg-white/5 mx-2 my-1" />

                            <button onClick={() => { onEnterSelectMode(msg.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-sm text-red-400 flex items-center gap-2 transition-all active:scale-95 font-medium"><Trash2 size={16} /> Delete</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatUI;
