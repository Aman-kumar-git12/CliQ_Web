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
        <div className="bg-[#111111] border border-white/5 shadow-2xl rounded-[28px] overflow-hidden">
            {/* Header Banner */}
            <div 
                className="h-[140px] bg-cover bg-center relative"
                style={{ backgroundImage: `url(${bannerUrl})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-[#111111]/90"></div>
                
                {/* Back Button (Public Profile / Mobile) */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-5 left-5 bg-black/60 hover:bg-black/80 backdrop-blur-xl text-white p-2.5 rounded-full border border-white/10 transition-all z-20 md:hidden"
                    >
                        <ArrowLeft size={18} />
                    </button>
                )}

                {/* Edit Button (Own Profile) */}
                {isOwnProfile && (
                    <button
                        onClick={onEditProfile}
                        className="absolute top-5 right-5 bg-black/60 hover:bg-black/80 backdrop-blur-xl text-[#f2f2f7] px-5 py-2.5 rounded-full text-sm font-medium transition-all border border-white/10 flex items-center gap-2 shadow-xl z-20"
                    >
                        <UserCog size={16} /> Edit Profile
                    </button>
                )}
            </div>

            <div className="px-6 sm:px-10 pb-10">
                {/* AVATAR & INFO HEADER */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-[76px] mb-8 gap-6 relative z-10">
                    
                    {/* Avatar Wrapper */}
                    <div
                        className="relative group/avatar cursor-pointer"
                        onMouseEnter={onAvatarMouseEnter}
                        onMouseLeave={onAvatarMouseLeave}
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-0 group-hover/avatar:opacity-30 transition duration-300 pointer-events-none"></div>
                        <img
                            src={user.imageUrl || "https://github.com/shadcn.png"}
                            alt="User"
                            className="relative w-[150px] h-[150px] rounded-full object-cover border-[6px] border-[#111111] bg-[#111111] shadow-2xl"
                        />
                        
                        {/* Camera/Action button on avatar (Own Profile) */}
                        {isOwnProfile && (
                            <button
                                onClick={onImageClick}
                                className="absolute bottom-2 right-2 bg-[#1a1a1a] text-white p-2.5 rounded-full shadow-lg border border-white/10 hover:bg-[#2a2a2a] transition-colors z-20"
                            >
                                <Camera size={16} />
                            </button>
                        )}

                        {/* Image Options Menu (Own Profile) */}
                        {isOwnProfile && showImageMenu && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fadeIn">
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
                    <div className="text-center sm:text-left flex-1 pb-2">
                        <h1 className="text-[32px] font-bold text-white tracking-tight leading-none mb-1 flex items-center justify-center sm:justify-start gap-2">
                            {user.firstname} {user.lastname}
                            {!isOwnProfile && <ShieldCheck className="text-blue-500" size={20} />}
                        </h1>
                        <p className="text-[#8e8e93] text-[16px] font-medium mb-3">
                            @{user.username || `${user.firstname?.toLowerCase()}_${user.lastname?.toLowerCase()}`}
                        </p>
                        <p className="text-[#8e8e93] text-[15px] font-medium flex items-center justify-center sm:justify-start gap-2">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* ACTION BUTTONS (Public Profile Only) */}
                {!isOwnProfile && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-2">
                        <div className="relative flex-1 group">
                            <div className={`absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200 ${
                                connectionStatus === "following" ? "bg-green-500" :
                                connectionStatus === "interested" ? "bg-gray-500" :
                                "bg-gradient-to-r from-blue-600 to-indigo-600"
                            }`}></div>
                            <button
                                onClick={onConnect}
                                disabled={connectionStatus === "following" || connectionStatus === "interested"}
                                className={`relative w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-2
                                    ${connectionStatus === "interested"
                                        ? "bg-neutral-800 text-gray-500 cursor-default"
                                        : connectionStatus === "following"
                                            ? "bg-green-600 text-white cursor-default"
                                            : "bg-white text-black hover:bg-neutral-100 active:scale-95"
                                    }`}
                            >
                                {connectionStatus === "interested" ? "Request Sent" :
                                    connectionStatus === "following" ? "Connected" : "Connect"}
                            </button>
                        </div>

                        <div className="relative flex-1 group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                            <button
                                onClick={onChat}
                                className="relative w-full bg-black dark:bg-[#1a1a1a] text-white rounded-xl py-3.5 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all border border-white/5"
                            >
                                <MessageSquare size={16} /> Chat
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileHeader;
