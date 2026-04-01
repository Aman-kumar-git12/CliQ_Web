import React from "react";
import { Camera, Eye, Upload, UserCog, ShieldCheck, MessageSquare, ArrowLeft } from "lucide-react";

/**
 * Shared Profile Header component for both own profile and public profile views.
 */
const ProfileHeader = ({
    user,
    isOwnProfile = false,
    onEditProfile,
    onBack,
    onImageClick,
    onImageOptionClick, // { view, upload }
    showImageMenu = false,
    connectionStatus = "none",
    onConnect,
    onChat,
    onAvatarMouseEnter,
    onAvatarMouseLeave,
    bannerUrl = "https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?q=80&w=2938&auto=format&fit=crop"
}) => {
    return (
        <div className="relative bg-gradient-to-b from-[#0f041e]/50 to-transparent md:bg-white/[0.03] backdrop-blur-md md:backdrop-blur-2xl md:border md:border-white/10 shadow-2xl rounded-none md:rounded-[36px] overflow-hidden group/header transition-all duration-500">
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            {/* Header Banner */}
            <div className="w-full h-[90px] md:h-[180px] bg-[#1a0b2e] relative overflow-hidden group-hover/header:h-[100px] md:group-hover/header:h-[190px] transition-all duration-700"
                style={{ backgroundImage: `url(${bannerUrl})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/20 backdrop-blur-[1px]"></div>

                {/* Back Button (Public Profile / Mobile) */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-5 left-5 bg-black/60 hover:bg-black/80 backdrop-blur-xl text-white p-2.5 rounded-full border border-white/10 transition-all z-20 md:hidden"
                    >
                        <ArrowLeft size={18} />
                    </button>
                )}

                {/* Banner Content (Optional Overlay) */}
            </div>

            <div className="px-4 md:px-10 pb-4 md:pb-8 pt-6 md:pt-14 relative z-10">
                {/* AVATAR & INFO HEADER */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-[45px] md:-mt-[65px] mb-4 md:mb-6 gap-3 md:gap-6 relative z-10 transition-all duration-500">

                    {/* Avatar Wrapper */}
                    <div
                        className="relative group/avatar cursor-pointer shrink-0"
                        onMouseEnter={onAvatarMouseEnter}
                        onMouseLeave={onAvatarMouseLeave}
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full blur opacity-0 group-hover/avatar:opacity-40 transition duration-500 pointer-events-none"></div>
                        <img
                            src={user.imageUrl || "https://github.com/shadcn.png"}
                            alt="User"
                            className="relative w-[76px] h-[76px] md:w-[130px] md:h-[130px] rounded-full object-cover border-[3px] md:border-[4px] border-[#1a0b2e] md:border-black shadow-2xl transition-all duration-500 bg-[#0f041e]"
                        />

                        {/* Camera/Action button on avatar (Own Profile) */}
                        {isOwnProfile && (
                            <button
                                onClick={onImageClick}
                                className="absolute bottom-2 right-2 bg-white/[0.03] backdrop-blur-xl text-white p-2.5 rounded-full shadow-lg border border-white/20 hover:bg-white/[0.06] transition-all z-20 active:scale-90"
                            >
                                <Camera size={16} />
                            </button>
                        )}

                        {/* Image Options Menu (Own Profile) */}
                        {isOwnProfile && showImageMenu && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-white/[0.03] border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300 backdrop-blur-xl">
                                <button
                                    onClick={() => onImageOptionClick?.('view')}
                                    className="px-4 py-3 text-left hover:bg-white/5 flex items-center gap-2 text-sm font-medium text-white"
                                >
                                    <Eye size={16} className="text-gray-400" /> View Image
                                </button>
                                <button
                                    onClick={() => onImageOptionClick?.('upload')}
                                    className="px-4 py-3 text-left hover:bg-white/5 flex items-center gap-2 text-sm font-medium text-white"
                                >
                                    <Upload size={16} className="text-gray-400" /> Upload Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User Name & Handle */}
                    <div className="text-center sm:text-left flex-1 pb-1 md:pb-2">
                        <h1 className="text-[16px] md:text-[28px] font-black tracking-tight flex items-center gap-1.5 md:gap-3 group-hover/header:scale-105 origin-left md:origin-center transition-transform duration-500 text-white drop-shadow-md">
                            {user.firstname} {user.lastname}
                            {!isOwnProfile && <ShieldCheck className="text-purple-500 w-[16px] h-[16px] md:w-[20px] md:h-[20px]" />}
                        </h1>
                        <code className="text-[11px] md:text-sm text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20 shadow-inner group-hover/header:text-purple-200 transition-colors">
                            @{user.username}
                        </code>
                        <div className="text-[10px] md:text-[13px] font-medium text-gray-500 px-3 py-1 bg-white/[0.02] rounded-full border border-white/5 w-fit mt-0.5 md:mt-1 shadow-inner">
                            {user.email}
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTONS (Public Profile Only) */}
                {!isOwnProfile && (
                    <div className="flex flex-row gap-2 md:gap-4 mt-2 mb-1">
                        <div className="relative flex-1 group">
                            <div className={`absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200 ${connectionStatus === "following" ? "bg-green-500" :
                                    connectionStatus === "interested" ? "bg-gray-500" :
                                        "bg-gradient-to-r from-purple-600 to-fuchsia-600"
                                }`}></div>
                            <button
                                onClick={onConnect}
                                disabled={connectionStatus === "following" || connectionStatus === "interested"}
                                className={`relative w-full py-2 md:py-3.5 rounded-[10px] md:rounded-2xl font-black uppercase tracking-[0.05em] md:tracking-widest text-[10px] md:text-xs shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2
                                    ${connectionStatus === "interested"
                                        ? "bg-neutral-800 text-gray-500 cursor-default"
                                        : connectionStatus === "following"
                                            ? "bg-green-600 text-white cursor-default"
                                            : "bg-white text-black hover:bg-neutral-100 active:scale-95"
                                    }`}
                            >
                                {connectionStatus === "interested" ? "Requested" :
                                    connectionStatus === "following" ? "Connected" : "Connect"}
                            </button>
                        </div>

                        <div className="relative flex-1 group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-xl md:rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                            <button
                                onClick={onChat}
                                className="relative w-full bg-[#150a26] text-purple-100 rounded-[10px] md:rounded-2xl py-2 md:py-3.5 font-black uppercase tracking-[0.05em] md:tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all border border-purple-500/30"
                            >
                                <MessageSquare className="w-4 h-4" /> Chat
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileHeader;
