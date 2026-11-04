/** Voice message player shown inside a chat bubble (play/pause, waveform progress, sender avatar). */
import { useRef, useState } from "react";
import { Mic, Pause, Play } from "lucide-react";
import { DEFAULT_AVATAR } from "../../utils/avatar";

const VoicePlayer = ({ src, isMe, avatar, name }) => {
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
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div
            className={`flex items-center gap-3 p-1 rounded-2xl min-w-[210px] ${isMe ? "text-white" : "text-white/85"}`}
        >
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            <button
                type="button"
                aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
                onClick={togglePlay}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition duration-150 ease-soft active:scale-95 shrink-0 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${isMe ? "bg-white text-brand hover:bg-white/90" : "bg-brand text-white hover:brightness-110"}`}
            >
                {isPlaying ? (
                    <Pause size={20} fill="currentColor" />
                ) : (
                    <Play size={20} className="ml-0.5" fill="currentColor" />
                )}
            </button>

            <div className="flex-1 flex flex-col gap-1.5 pt-1">
                <div className="flex items-end gap-[2px] h-6 px-1">
                    {[3, 5, 8, 4, 6, 9, 5, 7, 3, 6, 8, 4, 7, 5, 9, 3, 6].map((h, i) => {
                        const isActive = progress > (i / 17) * 100;
                        return (
                            <div
                                key={i}
                                className={`w-[2px] rounded-full transition-colors duration-150 ${isActive ? (isMe ? "bg-white" : "bg-brand-light") : isMe ? "bg-white/35" : "bg-white/15"}`}
                                style={{ height: `${h * 2}px` }}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between items-center px-0.5">
                    <span className="text-[10px] opacity-70 font-medium tabular-nums">
                        {formatTime(audioRef.current?.currentTime || 0)}
                    </span>
                    <span className="text-[10px] opacity-70 font-medium tracking-tight tabular-nums">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            <div className="relative shrink-0 ml-1">
                <img
                    src={avatar || DEFAULT_AVATAR}
                    alt={name || "User"}
                    className="w-10 h-10 rounded-full object-cover border border-line"
                />
                <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border ${isMe ? "bg-brand border-line-strong" : "bg-ios-gray-light border-line"}`}
                >
                    <Mic size={8} className="text-white" />
                </div>
            </div>
        </div>
    );
};

export default VoicePlayer;
