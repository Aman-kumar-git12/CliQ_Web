/** Rounded card container used by the AI assistant's reply sections. */

export default function AIAssistantSectionCard({ children, className = "" }) {
    return <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 ${className}`}>{children}</div>;
}
