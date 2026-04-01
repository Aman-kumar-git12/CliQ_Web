import { Plus } from "lucide-react";
import { useUserContext } from "../context/userContext";

export default function StoriesBar() {
    const { user } = useUserContext();

    // Mock stories data matching the image (static)
    const mockStories = [
        { id: 1, name: "Neha5", initials: "N5", color: "bg-[#7000FF]" },
        { id: 2, name: "Neha2G", initials: "N2", color: "bg-[#00D1FF]" },
        { id: 3, name: "Shail", initials: "SJ", color: "bg-[#FF007A]" },
        { id: 4, name: "Test", initials: "TU", color: "bg-[#9A4DFF]" },
        { id: 5, name: "NaModi", initials: "NM", color: "bg-[#00FFD1]" },
    ];

    return (
        <div className="flex items-center gap-7 overflow-x-auto pb-4 hide-scrollbar mb-8 pt-2 max-w-[560px] w-full mx-auto self-center">
            {/* Add Story */}
            <div className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
                <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center group-hover:border-[var(--cliq-lilac)] transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-[#252331] flex items-center justify-center group-hover:bg-[var(--cliq-lilac)]/10 transition-colors">
                        <Plus size={18} className="text-white/70 group-hover:text-[var(--cliq-lilac)]" />
                    </div>
                </div>
                <span className="text-[10px] font-black text-white/50 group-hover:text-white transition-colors">Add</span>
            </div>

            {mockStories.map((story) => (
                <div key={story.id} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
                    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#9b6bff] via-[#f472b6] to-[#60a5fa] group-hover:scale-110 transition-transform duration-500">
                        <div className={`w-full h-full rounded-full border-2 border-[var(--cliq-bg)] flex items-center justify-center overflow-hidden ${story.color}`}>
                           <span className="text-sm font-black text-white">{story.initials}</span>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-white/60 group-hover:text-white transition-colors">
                        {story.name}
                    </span>
                </div>
            ))}
        </div>
    );
}
