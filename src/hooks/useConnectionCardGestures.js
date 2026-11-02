/** Pointer gestures on the match card: swipe to decide, and the tilt that follows the mouse. */
import { animate } from "framer-motion";

const SWIPE_THRESHOLD = 180;

/**
 * @param {object} args
 * @param {boolean} args.sending a card action is in flight (the card stops tilting)
 * @param {import("framer-motion").MotionValue<number>} args.dragX horizontal drag offset
 * @param {import("framer-motion").MotionValue<number>} args.mouseX pointer offset from the card centre
 * @param {import("framer-motion").MotionValue<number>} args.mouseY pointer offset from the card centre
 * @param {() => void} args.handleInterested right swipe
 * @param {() => void} args.handleIgnore left swipe
 */
export const useConnectionCardGestures = ({ sending, dragX, mouseX, mouseY, handleInterested, handleIgnore }) => {
    const handleDragEnd = async (_, info) => {
        const swipe = info.offset.x;
        const velocity = info.velocity.x;
        if (swipe > SWIPE_THRESHOLD || velocity > 500) {
            handleInterested();
        } else if (swipe < -SWIPE_THRESHOLD || velocity < -500) {
            handleIgnore();
        } else {
            animate(dragX, 0, { type: "spring", stiffness: 400, damping: 25 });
        }
    };

    const handleMouseMove = (e) => {
        if (sending) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return { handleDragEnd, handleMouseMove, handleMouseLeave };
};
