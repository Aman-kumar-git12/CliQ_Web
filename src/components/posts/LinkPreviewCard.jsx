import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { FOCUS_RING, SOFT_TRANSITION } from "./postUi";

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
            className={`flex ${compact || !showImage ? "flex-row" : "flex-col"} overflow-hidden rounded-xl border border-line bg-white/[0.03] hover:bg-white/[0.06] hover:border-line-strong no-underline mb-2.5 ${SOFT_TRANSITION} ${FOCUS_RING}`}
        >
            {showImage && (
                <img
                    src={preview.image}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                    className={`bg-surface-950 object-cover ${compact ? "w-20 h-20 shrink-0" : "w-full h-[220px]"}`}
                />
            )}
            <div className="p-3 min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-300">
                    <ExternalLink size={10} /> <span className="truncate">{preview.siteName}</span>
                </div>
                {preview.title && (
                    <p className="text-[13px] font-bold leading-snug text-white mt-1 line-clamp-2">{preview.title}</p>
                )}
                {preview.description && !compact && (
                    <p className="text-[12px] leading-relaxed text-ink-100/70 mt-1 line-clamp-2">
                        {preview.description}
                    </p>
                )}
            </div>
        </a>
    );
}
