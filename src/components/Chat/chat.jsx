import { ArrowLeft, ChevronDown, Trash2, Pencil, Ban, Plus, Smile, Mic, SendHorizontal } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import createSocketConnection from "./socket";
import { useEffect, useState, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import LoadingChat from "./LoadingChat";
import Confirmation from "../../components/Confirmation";
import Toastbar from "./Toastbar";
import { useUserContext } from "../../context/userContext";

const ChatUI = () => {
    const navigate = useNavigate();
    const { targetuserId } = useParams();
    const { user } = useUserContext();

    // State
    const [targetUser, setTargetUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastSeenId, setLastSeenId] = useState(null);

    // UI State
    const [newMessage, setNewMessage] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [updateMessage, setUpdateMessage] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, messageId: null });
    const [replyTo, setReplyTo] = useState(null);
    const [toast, setToast] = useState(null);

    // Refs
    const scrollContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const observerRef = useRef(null);

    // Fetch Target User
    useEffect(() => {
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

    // Fetch Chat History
    useEffect(() => {
        const fetchHistory = async () => {
            // Wait until both user IDs are available
            if (!targetuserId || !user?.id) return;
            console.log(targetuserId, user.id);
            // Note: We don't necessarily need targetUser object just for history, 
            // but we need it for names/avatars. Let's fetch history anyway to reduce perception of lag.
            try {
                console.log("Fetching history for", targetuserId);
                const res = await axiosClient.get(`/chat/history/${targetuserId}`);
                const mappedMessages = res.data.map(msg => ({
                    id: msg.id,
                    text: msg.isDelete ? "This message is deleted" : msg.text,
                    firstname: msg.senderId === user.id ? user.firstname : (targetUser?.firstname || "User"),
                    isMe: msg.senderId === user.id,
                    date: msg.createdAt,
                    isDelete: msg.isDelete,
                    profileImageUrl: msg.senderId === user.id ? user.profileImageUrl : targetUser?.profileImageUrl,
                    parentMessage: msg.parentMessage
                }));
                setMessages(mappedMessages);

                const savedSeenId = localStorage.getItem(`lastSeen_${user.id}_${targetuserId}`);
                setLastSeenId(savedSeenId);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                // If we have history (or attempted to get it), and we've attempted the profile, stop loading
                setLoading(false);
            }
        };
        fetchHistory();
    }, [targetuserId, user?.id]);

    // Initial Scroll Logic (Run once when messages are loaded)
    const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

    useEffect(() => {
        if (!loading && messages.length > 0 && !hasInitialScrolled) {
            // Use 'auto' behavior for instant jump on load
            scrollToBottom('auto');
            const timer = setTimeout(() => {
                setHasInitialScrolled(true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [loading, messages.length, hasInitialScrolled]);

    // Reset scroll state when partner changes
    useEffect(() => {
        setHasInitialScrolled(false);
    }, [targetuserId]);

    const scrollToBottom = (behavior = 'smooth') => {
        if (!scrollContainerRef.current) return;

        if (behavior === 'auto') {
            // Maximum performance: direct scrollTop manipulation
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        } else {
            // Standard smooth scroll for active chatting
            messagesEndRef.current?.scrollIntoView({ behavior });
        }
    };

    // Intersection Observer to track seen messages
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

    // Socket Connection & Listeners
    useEffect(() => {
        if (!user || !targetuserId) return;
        const userId = user.id;

        const newSocket = createSocketConnection();
        setSocket(newSocket);

        newSocket.emit("joinChat", { firstname: user.firstname, userId, targetuserId });

        // Helper to format incoming messages
        const handleIncomingMessage = (data) => {
            if (String(data.senderId) === String(user.id)) return;

            setMessages((prev) => [...prev, {
                id: data.id || Date.now() + Math.random(),
                firstname: data.firstname,
                text: data.text,
                isMe: false,
                date: data.createdAt || new Date(),
                isDelete: data.isDelete || false,
                profileImageUrl: targetUser?.profileImageUrl,
                parentMessage: data.parentMessage
            }]);

            // Auto scroll to bottom for live messages
            setTimeout(() => scrollToBottom('smooth'), 100);
        };

        newSocket.on("connect", () => console.log("Socket connected:", newSocket.id));
        newSocket.on("connect_error", (err) => console.error("Socket connection error:", err));
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
            await axiosClient.put(`/chat/message/${currentMsgId}`, { text: newMessage });
        } catch (error) {
            console.error("Error updating message:", error);
        }
    };

    const sendMessage = () => {
        if (updateMessage) {
            handleUpdateMessage();
            return;
        }
        if (socket && newMessage.trim()) {
            const tempId = Date.now();
            const currentReplyTo = replyTo; // Capture closure value

            setMessages((prev) => [...prev, {
                id: tempId,
                firstname: user.firstname,
                text: newMessage,
                isMe: true,
                date: new Date(),
                profileImageUrl: user.profileImageUrl,
                parentMessage: currentReplyTo ? {
                    id: currentReplyTo.id,
                    text: currentReplyTo.text,
                    firstname: currentReplyTo.firstname
                } : null
            }]);

            socket.emit("sendMessage", {
                firstname: user.firstname,
                userId: user.id,
                targetuserId,
                text: newMessage,
                parentMessageId: currentReplyTo?.id
            }, (response) => {
                if (response.success && response.id) {
                    setMessages(prev => prev.map(msg =>
                        msg.id === tempId ? { ...msg, id: response.id } : msg
                    ));
                    localStorage.setItem(`lastSeen_${user.id}_${targetuserId}`, response.id);
                }
            });

            setNewMessage("");
            setReplyTo(null);
            setTimeout(() => scrollToBottom(), 50);
        }
    };

    const confirmDelete = async (type) => {
        const id = deleteConfirmation.messageId;
        if (!id) return;
        try {
            setDeleteConfirmation({ isOpen: false, messageId: null, isMe: false });

            if (type === 'everyone') {
                // Optimistic: Soft delete for everyone
                setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isDelete: true, text: "This message is deleted" } : msg));
                await axiosClient.put(`/chat/message/${id}`, { isDelete: true });
            } else {
                // Optimistic: Hide for me only
                setMessages(prev => prev.filter(msg => msg.id !== id));
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
            // If click is in the bottom 40% of the screen, open upwards
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
    };
    const handleDeleteStart = (id, isMe) => {
        setDeleteConfirmation({ isOpen: true, messageId: id, isMe });
        setOpenMenuId(null);
    };

    if (loading) return <LoadingChat />;

    return (
        <div className="h-screen bg-[#000000] text-white flex flex-col relative overflow-hidden" onClick={() => setOpenMenuId(null)}>
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0"
                style={{ backgroundImage: `url('https://w0.peakpx.com/wallpaper/580/671/HD-wallpaper-whatsapp-doodle-pattern-whatsapp-pattern-doodle.jpg')`, backgroundSize: '400px' }}>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#1c1c1e]/90 backdrop-blur-xl border-b border-neutral-800/50 sticky top-0 z-20 h-[60px]">
                <div className="flex items-center gap-1 group">
                    <button onClick={() => navigate('/my-connections')} className="p-1 -ml-1 text-[#007aff] hover:bg-white/5 rounded-full transition-colors active:scale-90">
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#3a3a3c] flex items-center justify-center text-lg font-bold shadow-inner overflow-hidden border border-white/5 ring-1 ring-black/20">
                            {targetUser?.profileImageUrl ? (
                                <img src={targetUser.profileImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                targetUser?.firstname?.[0]?.toUpperCase() || "?"
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[16px] font-semibold leading-tight text-[#f2f2f7]">{targetUser?.firstname || "Chat"}</h1>
                            <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                online
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div
                ref={scrollContainerRef}
                className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide relative z-10 transition-opacity duration-300 ${hasInitialScrolled ? 'opacity-100' : 'opacity-0'}`}
            >
                {messages.length === 0 && (
                    <div className="bg-[#1c1c1e] text-[#8e8e93] text-[12px] px-6 py-3 rounded-2xl mx-auto w-fit mt-12 shadow-xl border border-neutral-800/50 text-center max-w-[240px]">
                        🔒 Messages are end-to-end encrypted. No one outside of this chat can read them.
                    </div>
                )}

                {messages.map((msg, index) => {
                    const prevMsg = messages[index - 1];
                    const showDate = !prevMsg || new Date(msg.date).toDateString() !== new Date(prevMsg.date).toDateString();

                    return (
                        <div key={msg.id} id={`msg-${msg.id}`} data-id={msg.id} className="message-bubble-wrapper w-full flex flex-col">
                            {showDate && (
                                <div className="bg-[#1c1c1e] text-[#8e8e93] text-[11px] px-4 py-1.5 rounded-full shadow-lg mx-auto w-fit my-6 font-semibold uppercase tracking-[0.05em] border border-neutral-800/30 backdrop-blur-md">
                                    {new Date(msg.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                                </div>
                            )}
                            <MessageBubble
                                msg={msg}
                                targetUser={targetUser}
                                openMenuId={openMenuId}
                                toggleMenu={toggleMenu}
                                handleEdit={handleEditStart}
                                handleDelete={handleDeleteStart}
                                handleReply={(msg) => { setReplyTo({ id: msg.id, text: msg.text, firstname: msg.firstname }); scrollToBottom(); }}
                                menuDirection={menuDirection}
                            />
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="relative z-20 flex flex-col pt-2 bg-[#1c1c1e] border-t border-neutral-800/50">
                {replyTo && (
                    <div className="mx-3 mb-2 px-3 py-2 bg-[#2c2c2e] border-l-4 border-[#007aff] rounded-lg animate-in slide-in-from-bottom-2 duration-200 flex items-center justify-between">
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[#007aff] text-[12px] font-bold">{replyTo.firstname}</span>
                            <span className="text-[#8e8e93] text-[13px] truncate">{replyTo.text}</span>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 text-[#8e8e93] hover:text-white transition-colors">
                            <Plus size={20} className="rotate-45" />
                        </button>
                    </div>
                )}
                <div className="flex items-end gap-2 p-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
                    <button
                        onClick={() => setToast("🛠️ “Still under construction.”")}
                        className="p-2 text-[#007aff] hover:bg-white/5 rounded-full transition-all active:scale-90"
                    >
                        <Plus size={26} strokeWidth={2.5} />
                    </button>

                    <div className="flex-1 relative flex items-center bg-[#2c2c2e] rounded-[22px] min-h-[40px] px-3 py-1 ring-1 ring-white/5 border border-white/5 shadow-inner group">
                        <textarea
                            rows={1}
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            placeholder="Message..."
                            className="w-full bg-transparent text-white py-1 px-1 outline-none placeholder:text-[#8e8e93] text-[15px] resize-none max-h-[120px] scrollbar-hide"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                        />
                        <button
                            onClick={() => setToast("🚫 Emoji not available for you")}
                            className="p-1 px-1.5 text-[#8e8e93] hover:text-[#f2f2f7] transition-colors"
                        >
                            <Smile size={24} strokeWidth={2} />
                        </button>
                    </div>

                    <div
                        className={`rounded-full p-2.5 shadow-xl active:scale-90 transition-all cursor-pointer flex items-center justify-center shrink-0 ${newMessage.trim() || updateMessage ? "bg-[#007aff] text-white" : "bg-emerald-600 text-white"
                            }`}
                        onClick={() => (newMessage.trim() || updateMessage ? sendMessage() : setToast("🎤 Mic warming up…"))}
                    >
                        {newMessage.trim() || updateMessage ? (
                            <SendHorizontal size={22} strokeWidth={2.5} />
                        ) : (
                            <Mic size={22} strokeWidth={2.5} />
                        )}
                    </div>
                </div>
            </div>

            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#1c1c1e] w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="p-5 text-center">
                            <h3 className="text-[17px] font-semibold text-white mb-1">Delete message?</h3>
                            <p className="text-[13px] text-[#8e8e93]">This action cannot be undone.</p>
                        </div>

                        <div className="flex flex-col border-t border-white/10">
                            {deleteConfirmation.isMe && (
                                <button
                                    onClick={() => confirmDelete('everyone')}
                                    className="w-full py-3.5 text-[17px] font-medium text-[#ff3b30] hover:bg-white/5 active:bg-white/10 transition-colors border-b border-white/10"
                                >
                                    Delete for everyone
                                </button>
                            )}
                            <button
                                onClick={() => confirmDelete('me')}
                                className="w-full py-3.5 text-[17px] font-medium text-[#007aff] hover:bg-white/5 active:bg-white/10 transition-colors border-b border-white/10"
                            >
                                Delete for me
                            </button>
                            <button
                                onClick={() => setDeleteConfirmation({ isOpen: false, messageId: null, isMe: false })}
                                className="w-full py-3.5 text-[17px] font-semibold text-white/50 hover:bg-white/5 active:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {toast && <Toastbar message={toast} onClose={() => setToast(null)} />}
        </div>
    );
};

const MessageBubble = ({ msg, targetUser, openMenuId, toggleMenu, handleEdit, handleDelete, handleReply, menuDirection }) => {
    // Use targetUser info if message is from them (isMe=false)
    const displayImage = !msg.isMe ? (targetUser?.profileImageUrl || msg.profileImageUrl) : msg.profileImageUrl;
    const displayName = !msg.isMe ? (targetUser?.firstname || msg.firstname) : msg.firstname;

    return (
        <div className={`flex w-full ${msg.isMe ? "justify-end" : "justify-start"} items-end gap-2 group mb-1`}>
            {!msg.isMe && (
                <div className="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0 border border-neutral-800 overflow-hidden mb-1">
                    {displayImage ? (
                        <img src={displayImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] flex items-center justify-center h-full font-bold">
                            {displayName?.[0]?.toUpperCase()}
                        </span>
                    )}
                </div>
            )}

            <div className={`message-bubble max-w-[85%] md:max-w-[70%] px-3 py-1.5 rounded-2xl shadow-sm relative min-w-[80px] ${msg.isDelete
                ? "bg-[#1f2c33]/50 italic text-[#8696a0] border border-neutral-800"
                : msg.isMe
                    ? "bg-[#007aff] text-white rounded-tr-sm"
                    : "bg-[#262626] text-[#e9edef] rounded-tl-sm"
                }`}
                onClick={(e) => { e.stopPropagation(); toggleMenu(msg.id, e); }}
            >

                <div className="flex flex-col">
                    {/* Reply Quote */}
                    {msg.parentMessage && !msg.isDelete && (
                        <div className={`mb-1.5 p-2 rounded-lg border-l-4 ${msg.isMe ? "bg-white/10 border-white/50" : "bg-white/5 border-[#007aff]"} overflow-hidden max-w-full`}>
                            <p className={`text-[11px] font-bold ${msg.isMe ? "text-white/80" : "text-[#007aff]"}`}>{msg.parentMessage.firstname}</p>
                            <p className="text-[12px] opacity-70 truncate line-clamp-1">{msg.parentMessage.text}</p>
                        </div>
                    )}

                    {msg.isDelete ? (
                        <div className="flex items-center gap-1 opacity-60 text-[13px]">
                            <Ban size={12} />
                            <span>This message was deleted</span>
                        </div>
                    ) : (
                        <p className="text-[14.5px] leading-relaxed break-words whitespace-pre-wrap pr-10">{msg.text}</p>
                    )}

                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-medium tracking-tighter ${msg.isMe ? "text-blue-100" : "text-neutral-500"}`}>
                            {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.isMe && !msg.isDelete && (
                            <div className="flex -space-x-1 opacity-80 scale-75 transform -translate-y-px">
                                <svg viewBox="0 0 16 15" width="16" height="15" className="text-white fill-current">
                                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879 5.817 7.7a.374.374 0 0 0-.51.033l-.433.438a.333.333 0 0 0 .013.487l3.58 2.723a.405.405 0 0 0 .58-.04l5.973-7.502a.35.35 0 0 0-.01-.433z" />
                                    <path d="M11.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.666 9.879 1.817 7.7a.374.374 0 0 0-.51.033l-.433.438a.333.333 0 0 0 .013.487l3.58 2.723a.405.405 0 0 0 .58-.04l5.973-7.502a.35.35 0 0 0-.01-.433z" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); toggleMenu(msg.id, e); }}
                    className={`absolute top-1 right-1 p-0.5 rounded-full hover:bg-black/10 text-white/50 transition-all ${openMenuId === msg.id ? "bg-black/10 opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                    <ChevronDown size={14} />
                </button>

                {openMenuId === msg.id && (
                    <div className={`absolute ${menuDirection === 'up' ? "bottom-full mb-1" : "top-full mt-1"} z-[100] bg-[#2c2c2e] shadow-2xl rounded-xl overflow-hidden min-w-[150px] py-1 border border-neutral-700/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ${msg.isMe ? "right-0" : "left-0"}`}>
                        {!msg.isDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleReply(msg); toggleMenu(null); }}
                                className="w-full text-left px-4 py-2.5 flex items-center justify-between text-white hover:bg-neutral-700/30 transition-colors text-sm"
                            >
                                <span>Reply</span>
                                <ChevronDown size={14} className="text-neutral-500 rotate-180" />
                            </button>
                        )}

                        {msg.isMe && !msg.isDelete && (
                            <>
                                <div className="h-px bg-neutral-800 mx-2 my-1" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEdit(msg.id, msg.text); toggleMenu(null); }}
                                    className="w-full text-left px-4 py-2.5 flex items-center justify-between text-white hover:bg-neutral-700/30 transition-colors text-sm"
                                >
                                    <span>Edit</span>
                                    <Pencil size={14} className="text-neutral-500" />
                                </button>
                            </>
                        )}

                        {/* Divider only if there are items above (i.e. not deleted) */}
                        {!msg.isDelete && <div className="h-px bg-neutral-800 mx-2 my-1" />}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(msg.id, msg.isMe); toggleMenu(null); }}
                            className="w-full text-left px-4 py-2.5 flex items-center justify-between text-[#ff453a] hover:bg-neutral-700/30 transition-colors text-sm"
                        >
                            <span>Delete</span>
                            <Trash2 size={14} className="text-[#ff453a]" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


export default ChatUI;
