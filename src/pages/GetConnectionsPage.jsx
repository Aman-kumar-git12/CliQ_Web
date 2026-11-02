import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// Custom Hook & Sub-components
import { useConnectionLogic } from "../hooks/useConnectionLogic";
import { useEscapeKey } from "../hooks/useEscapeKey";
import ConnectionsHeader from "../components/connections/ConnectionsHeader";
import ConnectionMatchStage from "../components/connections/ConnectionMatchStage";
import ConnectionPanelModal from "../components/connections/ConnectionPanelModal";
import { ConnectionExpertiseModal } from "../components/connections/ConnectionModals";

export default function GetConnectionsPage() {
    const logic = useConnectionLogic();
    const { user, showExpertise, setShowExpertise, activePanel, updateActivePanel, snack } = logic;

    // Escape closes the open panel (the expertise modal handles its own Escape)
    useEscapeKey(Boolean(activePanel) && !showExpertise, () => updateActivePanel(null));

    return (
        <motion.div className="w-full relative min-h-screen flex flex-col items-center pt-1 md:pt-2 pb-24 md:pb-12 px-4 md:pl-0 md:pr-6 overflow-visible transition-colors duration-500">
            {/* Top Navigation Bar: Integrated Alignment with Split Layout */}
            <ConnectionsHeader updateActivePanel={updateActivePanel} />

            <ConnectionMatchStage logic={logic} />

            {createPortal(
                <AnimatePresence>
                    {showExpertise && <ConnectionExpertiseModal user={user} onClose={() => setShowExpertise(false)} />}
                </AnimatePresence>,
                document.body,
            )}

            <ConnectionPanelModal logic={logic} />

            {createPortal(
                <AnimatePresence>
                    {snack && activePanel && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: 30, x: "-50%" }}
                            className="fixed bottom-12 left-1/2 z-[100] px-10 py-5 bg-white text-black text-[10px] font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-3xl pointer-events-none border border-white/20"
                        >
                            {snack}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </motion.div>
    );
}
