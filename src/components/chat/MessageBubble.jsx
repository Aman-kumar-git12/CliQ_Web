/** A single chat message bubble: avatar, content (text, image, file, voice), timestamp and its options menu. */
import { Ban, Check, ChevronDown, Copy, CornerUpLeft, Download, FileText, Pencil, Trash2 } from "lucide-react";
import { useUserContext } from "../../context/UserContext";
import { downloadFile } from "../../utils/chatPageHelpers";
import VoicePlayer from "./VoicePlayer";

const MessageBubble = ({
    msg,
    targetUser,
    openMenuId,
    toggleMenu,
    handleEdit,
    handleReply,
    menuDirection,
    isSelectMode,
    isSelected,
    onToggleSelect,
    onEnterSelectMode,
    setToast,
    setOpenMenuId,
    isFirstInGroup,
    isLastInGroup,
}) => {
    const { user } = useUserContext();
    const displayImage = !msg.isMe ? targetUser?.imageUrl || msg.imageUrl : msg.imageUrl;
    const displayName = !msg.isMe ? targetUser?.firstname || msg.firstname : msg.firstname;

    // Dynamic rounding based on group position
    const getBubbleRadius = () => {
        const R = "20px"; // full radius
        const r = "6px"; // soft corner
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
        <div
            className={`flex w-full items-end gap-2 group px-3 sm:px-5 transition-all duration-300 ${openMenuId === msg.id ? "z-[50] relative" : "z-0 relative"} ${isSelected ? "bg-white/[0.04]" : ""} ${isLastInGroup ? "pb-1" : "pb-0"}`}
        >
            {isSelectMode && (
                <button
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label="Select message"
                    onClick={() => onToggleSelect(msg.id)}
                    className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected ? "bg-brand border-brand shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "border-ink-600 hover:border-white/40"}`}
                >
                    {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                </button>
            )}
            <div className={`flex flex-1 ${msg.isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                {!msg.isMe &&
                    (isLastInGroup ? (
                        <div className="w-8 h-8 rounded-full bg-[#2a2a35] flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/5">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={displayName || "User"}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-[12px] font-bold text-white/40">
                                    {displayName?.[0]?.toUpperCase()}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="w-8 flex-shrink-0" />
                    ))}
                <div
                    className={`max-w-[75%] md:max-w-[65%] px-4 py-2.5 relative min-w-[70px] cursor-pointer transition-all duration-300 shadow-sm ${
                        isSelected ? "opacity-70 scale-[0.98]" : ""
                    } ${
                        msg.isDelete
                            ? "bg-white/5 backdrop-blur-xl italic text-white/20 rounded-[24px] border border-white/5"
                            : msg.isMe
                              ? "bg-gradient-to-br from-brand to-brand-pink rounded-[22px] rounded-br-[4px] text-white shadow-[0_4px_15px_rgba(139,92,246,0.3)]"
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
                            <div
                                className={`p-2 rounded-xl border-l-4 text-[11px] mb-1 ${msg.isMe ? "bg-white/10 border-white/50" : "bg-white/5 border-violet-400"}`}
                            >
                                <p className="font-bold">{msg.parentMessage.firstname}</p>
                                <p className="opacity-70 truncate">{msg.parentMessage.text}</p>
                            </div>
                        )}
                        {msg.isDelete ? (
                            <div className="flex items-center gap-1 opacity-60 text-[13px]">
                                <Ban size={12} />
                                <span>Message deleted</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {msg.image && (
                                    <div className="relative group/img">
                                        <img
                                            src={msg.image}
                                            alt={`Image from ${displayName || "user"}`}
                                            className="max-w-full max-h-[300px] rounded-lg cursor-pointer transition-transform active:scale-[0.98]"
                                            onClick={() => window.open(msg.image, "_blank")}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadFile(msg.image, `image_${msg.id}.jpg`);
                                            }}
                                            type="button"
                                            aria-label="Download image"
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover/img:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-black/70 active:scale-90"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                )}
                                {msg.file &&
                                    (msg.originalName === "voice_message.webm" ||
                                    msg.file.includes("voice_message.webm") ||
                                    msg.file.includes("/video/upload/") ? (
                                        <VoicePlayer
                                            src={msg.file}
                                            isMe={msg.isMe}
                                            avatar={!msg.isMe ? targetUser?.imageUrl : user?.imageUrl}
                                            name={displayName}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            className={`w-full text-left flex items-center gap-3 p-2 rounded-xl border cursor-pointer hover:bg-black/10 transition-colors ${msg.isMe ? "bg-white/10 border-white/20" : "bg-black/20 border-white/10"}`}
                                            onClick={() =>
                                                downloadFile(
                                                    msg.file,
                                                    msg.originalName || msg.file.split("/").pop().split("?")[0],
                                                )
                                            }
                                        >
                                            <span className="w-8 h-8 rounded-lg bg-ios-gray-light flex items-center justify-center text-[#ff3b30] shrink-0">
                                                <FileText size={18} />
                                            </span>
                                            <span className="flex flex-col min-w-0">
                                                <span className="text-[12px] truncate font-medium">
                                                    {msg.originalName || msg.file.split("/").pop().split("?")[0]}
                                                </span>
                                                <span className="text-[9px] opacity-60 text-emerald-400 font-bold tracking-wider">
                                                    CLICK TO DOWNLOAD
                                                </span>
                                            </span>
                                            <Download size={14} className="shrink-0 opacity-60 ml-auto" />
                                        </button>
                                    ))}
                                {msg.text && (
                                    <p className="text-[14px] leading-snug break-words whitespace-pre-wrap">
                                        {msg.text}
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span className={`text-[10px] ${msg.isMe ? "text-violet-100/70" : "text-white/30"}`}>
                                {new Date(msg.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                    </div>
                    {!isSelectMode && (
                        <button
                            type="button"
                            aria-label="Message options"
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === msg.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(msg.id, e);
                            }}
                            className={`absolute top-2 right-2 p-0.5 rounded-full hover:bg-black/10 focus-visible:opacity-100 transition-all ${openMenuId === msg.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        >
                            <ChevronDown size={14} />
                        </button>
                    )}
                    {openMenuId === msg.id && (
                        <div
                            className={`absolute ${menuDirection === "up" ? "bottom-full mb-2" : "top-full mt-2"} z-[999] bg-surface-600/95 backdrop-blur-3xl shadow-[0_10px_50px_rgba(0,0,0,0.6)] rounded-xl min-w-[160px] py-1.5 border border-white/10 ${msg.isMe ? "right-0" : "left-0"} animate-in fade-in zoom-in-95 duration-200`}
                        >
                            {!msg.isDelete && (
                                <button
                                    onClick={() => {
                                        handleReply(msg);
                                        setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm flex items-center gap-2 transition-all active:scale-95 text-white/90 font-medium"
                                >
                                    <CornerUpLeft size={16} /> Reply
                                </button>
                            )}

                            {msg.text && !msg.isDelete && (
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(msg.text);
                                        setToast("Message copied");
                                        setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm flex items-center gap-2 transition-all active:scale-95 text-white/90 font-medium"
                                >
                                    <Copy size={16} /> Copy Text
                                </button>
                            )}
                            {msg.isMe && !msg.isDelete && (
                                <button
                                    onClick={() => {
                                        handleEdit(msg.id, msg.text);
                                        setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm flex items-center gap-2 transition-all active:scale-95 text-white/90 font-medium"
                                >
                                    <Pencil size={16} /> Edit Message
                                </button>
                            )}

                            <div className="h-[1px] bg-white/5 mx-2 my-1" />

                            <button
                                onClick={() => {
                                    onEnterSelectMode(msg.id);
                                    setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-sm text-red-400 flex items-center gap-2 transition-all active:scale-95 font-medium"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
