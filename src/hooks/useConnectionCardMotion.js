/** Framer-motion values and animation controls for the swipeable smart-connection card. */
import { useMotionValue, useTransform, useAnimation, useSpring } from "framer-motion";

export const useConnectionCardMotion = () => {
    const dragX = useMotionValue(0);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
    const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);
    const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 35 });
    const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 35 });
    const rotate = useTransform(dragX, [-300, 300], [-35, 35]);
    const transformOrigin = useTransform(dragX, (x) => (x >= 0 ? "bottom right" : "bottom left"));

    const likeScale = useTransform(dragX, [0, 150], [0.8, 1.2]);
    const nopeScale = useTransform(dragX, [-150, 0], [1.2, 0.8]);
    const likeOpacity = useTransform(dragX, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(dragX, [-150, -50], [1, 0]);

    const bgGlow = useTransform(
        dragX,
        [-150, 0, 150],
        ["rgba(236, 72, 153, 0.04)", "rgba(255, 255, 255, 0)", "rgba(139, 92, 246, 0.04)"],
    );

    const controls = useAnimation();

    return {
        dragX,
        mouseX,
        mouseY,
        springRotateX,
        springRotateY,
        rotate,
        transformOrigin,
        likeScale,
        nopeScale,
        likeOpacity,
        nopeOpacity,
        bgGlow,
        controls,
    };
};
