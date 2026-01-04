import { ArrowLeft, ChevronDown, Trash2, Pencil, Ban } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import createSocketConnection from "./socket";
import { useEffect, useState, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import LoadingChat from "./LoadingChat";
import Confirmation from "../../components/Confirmation";

const ChatUI = () => {
    const navigate = useNavigate();
    const { targetuserId } = useParams();

    // State
    const [user, setUser] = useState(null);
    const [targetUser, setTargetUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);

    // UI State
    const [newMessage, setNewMessage] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [updateMessage, setUpdateMessage] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, messageId: null });

    // Fetch Logged In User
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axiosClient.get("/profile", { withCredentials: true });
                setUser(res.data.user);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

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
            if (!targetuserId || !user || !targetUser) return;
            try {
                const res = await axiosClient.get(`/chat/history/${targetuserId}`);
                const mappedMessages = res.data.map(msg => ({
                    id: msg.id || Date.now() + Math.random().toString(),
                    text: msg.isDelete ? "This message is deleted" : msg.text,
                    firstname: msg.senderId === user.id ? user.firstname : targetUser.firstname,
                    isMe: msg.senderId === user.id,
                    date: msg.createdAt,
                    isDelete: msg.isDelete
                }));
                setMessages(mappedMessages);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [targetuserId, user, targetUser]);

    // Socket Connection & Listeners
    useEffect(() => {
        if (!user || !targetuserId) return;
        const userId = user.id;

        const newSocket = createSocketConnection();
        setSocket(newSocket);

        newSocket.emit("joinChat", { firstname: user.firstname, userId, targetuserId });

        // Helper to format incoming messages
        const handleIncomingMessage = ({ firstname, text, isDelete }) => {
            setMessages((prev) => [...prev, {
                id: Date.now() + Math.random(),
                firstname,
                text,
                isMe: false,
                date: new Date(),
                isDelete: isDelete || false
            }]);
        };

        newSocket.on("message", handleIncomingMessage);
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
    }, [user, targetuserId]);

    const handleUpdateMessage = async () => {
        if (!updateMessage || !newMessage.trim()) return;
        try {
            // Optimistic update locally
            setMessages(prev => prev.map(msg => msg.id === updateMessage ? { ...msg, text: newMessage } : msg));

            // Emit socket event for real-time update
            if (socket) {
                socket.emit("editMessage", { id: updateMessage, text: newMessage, targetuserId, userId: user.id });
            }

            // Clear input and exit edit mode immediately
            const currentMsgId = updateMessage;
            setUpdateMessage(null);
            setNewMessage("");

            // Persist change to backend
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
            socket.emit("sendMessage", {
                firstname: user.firstname,
                userId: user.id,
                targetuserId,
                text: newMessage
            });
            setMessages((prev) => [...prev, {
                id: Date.now(),
                firstname: user.firstname,
                text: newMessage,
                isMe: true,
                date: new Date()
            }]);
            setNewMessage("");
        }
    };

    const confirmDelete = async () => {
        const id = deleteConfirmation.messageId;
        if (!id) return;
        try {
            setDeleteConfirmation({ isOpen: false, messageId: null });
            setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isDelete: true, text: "This message is deleted" } : msg));
            await axiosClient.delete(`/chat/message/${id}`);
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    // Auto-scroll to bottom
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Handlers passed to MessageBubble
    const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);
    const handleEditStart = (id, text) => {
        setUpdateMessage(id);
        setNewMessage(text);
        setOpenMenuId(null);
    };
    const handleDeleteStart = (id) => {
        setDeleteConfirmation({ isOpen: true, messageId: id });
        setOpenMenuId(null);
    };

    if (loading) return <LoadingChat />;

    return (
        <div className="h-screen bg-black text-white flex flex-col">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center p-4 border-b border-neutral-800 bg-neutral-900 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="mr-4 text-white hover:text-gray-300">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                        {targetUser?.firstname?.[0] || "?"}
                    </div>
                    <h1 className="text-xl font-bold">{targetUser?.firstname || "Chat"}</h1>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto" onClick={() => setOpenMenuId(null)}>
                {messages.length === 0 && (
                    <div className="text-center mt-6 opacity-70 mb-4">
                        <div className="text-4xl">👋</div>
                        <p>New chat started...</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        openMenuId={openMenuId}
                        toggleMenu={toggleMenu}
                        handleEdit={handleEditStart}
                        handleDelete={handleDeleteStart}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 p-3 border-t border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    type="text"
                    placeholder={updateMessage ? "Edit your message..." : "Type a message..."}
                    className={`flex-1 bg-neutral-800 text-white px-4 py-3 rounded-full outline-none focus:ring-1 transition-all placeholder:text-neutral-500 ${updateMessage ? "focus:ring-yellow-500 ring-1 ring-yellow-500/50" : "focus:ring-green-600"
                        }`}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                    }}
                />
                <button
                    onClick={sendMessage}
                    className={`${updateMessage ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                        } px-4 py-3 rounded-full transition-colors shadow-lg active:scale-95`}
                >
                    {updateMessage ? <Pencil size={18} /> : "➤"}
                </button>
            </div>

            <Confirmation
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, messageId: null })}
                onConfirm={confirmDelete}
                title="Delete Message?"
                confirmText="Delete"
                confirmColor="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};

// Extracted Component for cleaner rendering
const MessageBubble = ({ msg, openMenuId, toggleMenu, handleEdit, handleDelete }) => {
    return (
        <div className={`max-w-[70%] group relative flex ${msg.isMe ? "ml-auto justify-end" : ""}`}>
            <div className={`p-3 relative shadow-md ${msg.isDelete
                ? "bg-neutral-800/50 border border-neutral-800 rounded-2xl italic text-gray-400"
                : msg.isMe
                    ? "bg-gradient-to-br from-green-600 to-green-700 rounded-2xl rounded-tr-none text-white"
                    : "bg-neutral-800 rounded-2xl rounded-tl-none text-white"
                }`}>
                {!msg.isMe && !msg.isDelete && (
                    <p className="text-xs font-bold text-blue-400 mb-1">{msg.firstname}</p>
                )}

                <div className="flex items-center gap-2">
                    {msg.isDelete && <Ban size={12} className="opacity-50" />}
                    <p className="pr-6">{msg.text}</p>
                </div>

                {msg.isMe && !msg.isDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(msg.id);
                        }}
                        className={`absolute top-2 right-2 p-0.5 rounded-full hover:bg-black/20 text-white/70 hover:text-white transition-opacity ${openMenuId === msg.id ? "bg-black/20" : ""
                            }`}
                    >
                        <ChevronDown size={14} />
                    </button>
                )}

                <span className="text-[10px] text-white/50 block text-right mt-1 -mb-1">
                    {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {openMenuId === msg.id && !msg.isDelete && (
                <div className={`absolute top-8 ${msg.isMe ? "right-0" : "left-0"} z-20 bg-neutral-800 border border-neutral-700 shadow-xl rounded-lg overflow-hidden min-w-[140px] animate-in fade-in zoom-in-95 duration-100`}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(msg.id, msg.text);
                        }}
                        className="w-full text-left px-4 py-3 flex items-center gap-2 text-white hover:bg-neutral-700/50 transition-colors text-sm border-b border-neutral-700"
                    >
                        <Pencil size={14} />
                        Edit Message
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(msg.id);
                        }}
                        className="w-full text-left px-4 py-3 flex items-center gap-2 text-red-400 hover:bg-neutral-700/50 transition-colors text-sm"
                    >
                        <Trash2 size={14} />
                        Delete Message
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatUI;
