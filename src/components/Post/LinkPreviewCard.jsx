import { useState } from "react";
import { ExternalLink } from "lucide-react";

export default function LinkPreviewCard({ preview, compact = false }) {
    const [imageFailed, setImageFailed] = useState(false);
    if (!preview?.url) return null;
    const showImage = preview.image && !imageFailed;

    return (
        <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={(e) => e.stopPropagation()}
            className={`flex ${compact || !showImage ? "flex-row" : "flex-col"} overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors no-underline mb-2`}
        >
            {showImage && (
                <img
                    src={preview.image}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                    className={compact ? "w-20 h-20 object-cover shrink-0" : "w-full max-h-[220px] object-cover"}
                />
            )}
            <div className="p-3 min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8b86a6]">
                    <ExternalLink size={10} /> <span className="truncate">{preview.siteName}</span>
                </div>
                {preview.title && <p className="text-[13px] font-bold text-white mt-1 line-clamp-2">{preview.title}</p>}
                {preview.description && !compact && (
                    <p className="text-[12px] text-[#a7a2c3] mt-0.5 line-clamp-2">{preview.description}</p>
                )}
            </div>
        </a>
    );
}
