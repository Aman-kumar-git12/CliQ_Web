/** A single chat message bubble: avatar, content (text, image, file, voice), timestamp and its options menu. */
import { motion } from "framer-motion";
import { Ban, Check, ChevronDown, Copy, CornerUpLeft, Download, FileText, Pencil, Trash2 } from "lucide-react";
import { useUserContext } from "../../context/UserContext";
import { downloadFile } from "../../utils/chatPageHelpers";
import VoicePlayer from "./VoicePlayer";
import { EASE_SOFT } from "../common/motionPresets";

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

    // Dynamic rounding based on group position: corners facing the neighbouring bubble of the same group are
    // tucked in, and the last bubble of a group keeps a small "tail" corner at the bottom.
    const getBubbleRadius = () => {
        const R = "20px"; // full radius
        const r = "6px"; // tucked corner
        const top = isFirstInGroup ? R : r;
        const bottom = r;
        // CSS order: top-left, top-right, bottom-right, bottom-left
        return { borderRadius: msg.isMe ? `${R} ${top} ${bottom} ${R}` : `${top} ${R} ${R} ${bottom}` };
    };

    const menuItemClass =
        "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 font-medium transition-colors duration-150 ease-soft focus-visible:outline-none focus-visible:bg-white/[0.08]";

    return (
        <div
            className={`flex w-full items-end gap-2 group px-3 sm:px-5 rounded-2xl transition-colors duration-200 ease-soft ${openMenuId === msg.id ? "z-[50] relative" : "z-0 relative"} ${isSelected ? "bg-brand/[0.06]" : ""} ${isLastInGroup ? "pb-1" : "pb-0"}`}
        >
            {isSelectMode && (
                <button
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label="Select message"
                    onClick={() => onToggleSelect(msg.id)}
                    className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center cursor-pointer transition duration-150 ease-soft focus-ring ${isSelected ? "bg-brand border-brand shadow-glow" : "border-ink-600 hover:border-white/40"}`}
                >
                    {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                </button>
            )}
            <div className={`flex flex-1 ${msg.isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                {!msg.isMe &&
                    (isLastInGroup ? (
                        <div className="w-8 h-8 rounded-full bg-ios-gray-light flex-shrink-0 overflow-hidden flex items-center justify-center border border-line-soft">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={displayName || "User"}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-[12px] font-bold text-white/50">
                                    {displayName?.[0]?.toUpperCase()}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="w-8 flex-shrink-0" />
                    ))}
                <div
                    className={`max-w-[75%] md:max-w-[65%] px-4 py-2.5 relative min-w-[70px] cursor-pointer transition-[transform,opacity,filter,box-shadow,background-color] duration-200 ease-soft ${
                        isSelected ? "opacity-70 scale-[0.98]" : ""
                    } ${
                        msg.isDelete
                            ? "bg-white/[0.03] italic text-ink-300 border border-dashed border-line"
                            : msg.isMe
                              ? "bg-gradient-to-br from-brand to-brand-pink/90 text-white shadow-md shadow-brand/20 hover:brightness-[1.04]"
                              : "bg-white/[0.07] border border-line text-white/90 shadow-sm shadow-black/30 hover:bg-white/[0.09]"
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
                                className={`px-2.5 py-1.5 rounded-xl border-l-[3px] text-[11px] mb-1 ${msg.isMe ? "bg-black/15 border-white/60" : "bg-white/[0.05] border-brand-light"}`}
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
                                            className="max-w-full max-h-[300px] rounded-xl cursor-pointer transition-transform duration-150 ease-soft active:scale-[0.98]"
                                            onClick={() => window.open(msg.image, "_blank")}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadFile(msg.image, `image_${msg.id}.jpg`);
                                            }}
                                            type="button"
                                            aria-label="Download image"
                                            className="absolute top-2 right-2 p-1.5 bg-black/45 backdrop-blur-md rounded-full text-white opacity-0 group-hover/img:opacity-100 focus-visible:opacity-100 transition duration-150 ease-soft hover:bg-black/65 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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
                                            className={`w-full text-left flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-colors duration-150 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${msg.isMe ? "bg-white/10 border-line-strong hover:bg-white/15" : "bg-black/20 border-line hover:bg-black/30"}`}
                                            onClick={() =>
                                                downloadFile(
                                                    msg.file,
                                                    msg.originalName || msg.file.split("/").pop().split("?")[0],
                                                )
                                            }
                                        >
                                            <span className="w-8 h-8 rounded-lg bg-ios-gray-light flex items-center justify-center text-red-400 shrink-0">
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
                                    <p className="text-[14px] leading-[1.45] break-words whitespace-pre-wrap">
                                        {msg.text}
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span
                                className={`text-[10px] leading-none tabular-nums ${msg.isMe ? "text-white/70" : "text-ink-300"}`}
                            >
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
                            className={`absolute top-1.5 right-1.5 p-0.5 rounded-full backdrop-blur-sm transition duration-150 ease-soft focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${msg.isMe ? "bg-brand/40 hover:bg-black/20" : "bg-ios-gray-light/70 hover:bg-white/15"} ${openMenuId === msg.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        >
                            <ChevronDown size={14} />
                        </button>
                    )}
                    {openMenuId === msg.id && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: menuDirection === "up" ? 4 : -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.15, ease: EASE_SOFT }}
                            style={{
                                transformOrigin: `${menuDirection === "up" ? "bottom" : "top"} ${msg.isMe ? "right" : "left"}`,
                            }}
                            className={`absolute ${menuDirection === "up" ? "bottom-full mb-2" : "top-full mt-2"} z-popover cliq-popover rounded-2xl min-w-[170px] p-1 not-italic ${msg.isMe ? "right-0" : "left-0"}`}
                        >
                            {!msg.isDelete && (
                                <button
                                    onClick={() => {
                                        handleReply(msg);
                                        setOpenMenuId(null);
                                    }}
                                    className={`${menuItemClass} text-white/90 hover:bg-white/[0.06] active:bg-white/[0.1]`}
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
                                    className={`${menuItemClass} text-white/90 hover:bg-white/[0.06] active:bg-white/[0.1]`}
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
                                    className={`${menuItemClass} text-white/90 hover:bg-white/[0.06] active:bg-white/[0.1]`}
                                >
                                    <Pencil size={16} /> Edit Message
                                </button>
                            )}

                            <div className="h-px bg-white/[0.06] mx-2 my-1" />

                            <button
                                onClick={() => {
                                    onEnterSelectMode(msg.id);
                                    setOpenMenuId(null);
                                }}
                                className={`${menuItemClass} text-red-400 hover:bg-red-500/10 active:bg-red-500/15`}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
