/** Row of tappable prompt chips (starter prompts or follow-up suggestions) in the chatbot. */

export default function ChatbotSuggestionChips({ items, onSelect }) {
    return (
        <div className="flex flex-wrap gap-2 self-start max-w-[92%]">
            {items.map((item) => (
                <button
                    key={item}
                    type="button"
                    onClick={() => onSelect(item)}
                    className="px-3 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 text-[12px] text-left transition-colors"
                >
                    {item}
                </button>
            ))}
        </div>
    );
}
