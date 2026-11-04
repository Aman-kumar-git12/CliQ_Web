import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArrowLeft,
    CalendarDays,
    Camera,
    Check,
    Eye,
    Mail,
    MessageSquare,
    PenLine,
    Share2,
    Upload,
} from "lucide-react";
import { DEFAULT_AVATAR } from "../../utils/avatar";
import { popoverMotion } from "../common/motionPresets";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { formatJoinedDate, getProfileHandle, getProfileHeadline, getSkillLabels } from "../../utils/profileDisplay";

const MAX_SKILL_CHIPS = 4;
const COPIED_FEEDBACK_MS = 1500;

const primaryButton =
    "bg-gradient-to-r from-brand to-brand-pink text-white shadow-soft hover:shadow-glow hover:brightness-110";
const secondaryButton =
    "bg-white/[0.04] text-ink-100 border border-line hover:bg-white/[0.07] hover:border-line-strong";
const actionButton =
    "h-10 md:h-11 px-4 md:px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cliq-press focus-ring";

const connectLabels = { requested: "Requested", connected: "Connected", incoming: "Respond" };

/** Token-only banner used when the user has no banner image. */
const DefaultBanner = () => (
    <>
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-surface-night to-brand-pink/10" />
        <div className="absolute -top-20 -left-10 h-56 w-72 rounded-full bg-brand/25 blur-3xl" />
        <div className="absolute -top-16 right-0 h-48 w-64 rounded-full bg-brand-pink/15 blur-3xl" />
        {/* Faint grid that fades out towards the bottom edge */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    </>
);

/**
 * Shared Profile Header component for both own profile and public profile views.
 */
const ProfileHeader = ({
    user,
    isOwnProfile = false,
    onBack,
    onImageClick,
    onImageOptionClick, // { view, upload }
    showImageMenu = false,
    connectionStatus = "none",
    onConnect,
    onChat,
    onAvatarMouseEnter,
    onAvatarMouseLeave,
    bannerUrl,
}) => {
    const reduceMotion = useReducedMotion();
    const avatarRef = useRef(null);
    const copiedTimerRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const isMenuOpen = isOwnProfile && showImageMenu;

    // onImageClick is usually a fresh arrow each render; read it through a ref so the listener isn't re-added
    const toggleMenuRef = useRef(onImageClick);
    toggleMenuRef.current = onImageClick;
    const closeMenu = () => toggleMenuRef.current?.();

    useEscapeKey(isMenuOpen, closeMenu);

    useEffect(() => {
        if (!isMenuOpen) return undefined;
        const handleMouseDown = (event) => {
            // The camera button lives inside avatarRef, so its own click still toggles normally
            if (!avatarRef.current?.contains(event.target)) toggleMenuRef.current?.();
        };
        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, [isMenuOpen]);

    useEffect(() => () => clearTimeout(copiedTimerRef.current), []);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/public-profile/${user.id}`);
            setCopied(true);
            clearTimeout(copiedTimerRef.current);
            copiedTimerRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
        } catch {
            // Clipboard can be blocked (insecure origin, denied permission); nothing useful to show
        }
    };

    const fullName = [user.firstname, user.lastname].filter(Boolean).join(" ");
    const handle = getProfileHandle(user);
    const headline = getProfileHeadline(user.expertise);
    const joined = formatJoinedDate(user.createdAt);
    const skills = getSkillLabels(user.expertise?.skills);
    const visibleSkills = skills.slice(0, MAX_SKILL_CHIPS);
    const hiddenSkills = skills.slice(MAX_SKILL_CHIPS);
    const showEmail = isOwnProfile && user.email;

    const isConnectDisabled = connectionStatus === "connected" || connectionStatus === "requested";
    const connectStyle =
        connectionStatus === "requested"
            ? "bg-surface-600 text-ink-300 border border-line cursor-default"
            : connectionStatus === "connected"
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 cursor-default"
              : primaryButton;

    return (
        <div className="relative md:bg-white/[0.02] md:border md:border-line md:shadow-soft-lg rounded-none md:rounded-3xl overflow-hidden">
            {/* Header Banner */}
            <div
                className={`relative w-full h-[110px] md:h-[180px] overflow-hidden bg-surface-night ${
                    bannerUrl ? "bg-cover bg-center" : ""
                }`}
                style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
            >
                {!bannerUrl && <DefaultBanner />}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-surface-night/40 pointer-events-none" />

                {/* Back Button (Public Profile / Mobile) */}
                {onBack && (
                    <button
                        type="button"
                        aria-label="Go back"
                        onClick={onBack}
                        className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 backdrop-blur-xl text-white p-2.5 rounded-full border border-line cliq-press z-20 md:hidden focus-ring"
                    >
                        <ArrowLeft size={18} />
                    </button>
                )}
            </div>

            <div className="relative z-10 px-4 md:px-8 pb-5 md:pb-7">
                {/* Mobile: one centred column. sm+: avatar with actions on its right, details below. */}
                <div className="flex flex-col items-center gap-4 sm:grid sm:grid-cols-[auto_1fr] sm:items-end sm:gap-x-6 sm:gap-y-4">
                    {/* Avatar Wrapper */}
                    <div
                        ref={avatarRef}
                        className="relative group/avatar cursor-pointer shrink-0 -mt-[44px] md:-mt-[60px] sm:col-start-1 sm:row-start-1"
                        onMouseEnter={onAvatarMouseEnter}
                        onMouseLeave={onAvatarMouseLeave}
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand to-brand-pink rounded-full blur opacity-0 group-hover/avatar:opacity-25 transition-opacity duration-250 ease-soft pointer-events-none"></div>
                        <img
                            src={user.imageUrl || DEFAULT_AVATAR}
                            alt={fullName || "Profile photo"}
                            className="relative w-[88px] h-[88px] md:w-[120px] md:h-[120px] rounded-full object-cover border-4 border-surface-night shadow-soft-lg bg-surface-night"
                        />

                        {/* Camera/Action button on avatar (Own Profile) */}
                        {isOwnProfile && (
                            <button
                                type="button"
                                aria-label="Profile photo options"
                                aria-haspopup="menu"
                                aria-expanded={showImageMenu}
                                onClick={onImageClick}
                                className="absolute bottom-0.5 right-0.5 md:bottom-1.5 md:right-1.5 bg-surface-raised/90 backdrop-blur-xl text-ink-100 p-2 rounded-full shadow-soft border border-line-strong hover:text-white hover:bg-surface-600 cliq-press z-20 focus-ring"
                            >
                                <Camera size={15} />
                            </button>
                        )}

                        {/* Image Options Menu (Own Profile). Outer div positions, inner one animates. */}
                        <AnimatePresence>
                            {isMenuOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 z-50">
                                    <motion.div
                                        {...popoverMotion(reduceMotion)}
                                        role="menu"
                                        className="cliq-popover origin-top sm:origin-top-left w-48 p-1 rounded-2xl flex flex-col"
                                    >
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => onImageOptionClick?.("view")}
                                            className="px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.06] transition-colors duration-150 ease-soft flex items-center gap-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:bg-white/[0.08]"
                                        >
                                            <Eye size={16} className="text-ink-300" /> View Image
                                        </button>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => onImageOptionClick?.("upload")}
                                            className="px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.06] transition-colors duration-150 ease-soft flex items-center gap-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:bg-white/[0.08]"
                                        >
                                            <Upload size={16} className="text-ink-300" /> Upload Image
                                        </button>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User details */}
                    <div className="min-w-0 w-full text-center sm:text-left sm:col-span-2 sm:row-start-2">
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white break-words">
                            {fullName}
                        </h1>
                        {handle && <p className="mt-0.5 text-sm text-brand-light/90 font-medium">@{handle}</p>}
                        {headline && (
                            <p className="mt-2 text-sm md:text-[15px] text-ink-200 truncate" title={headline}>
                                {headline}
                            </p>
                        )}

                        {(joined || showEmail) && (
                            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs md:text-[13px] text-ink-300">
                                {joined && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays size={14} className="text-ink-400" aria-hidden="true" />
                                        Joined {joined}
                                    </span>
                                )}
                                {showEmail && (
                                    <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
                                        <Mail size={14} className="text-ink-400 shrink-0" aria-hidden="true" />
                                        <span className="truncate">{user.email}</span>
                                    </span>
                                )}
                            </div>
                        )}

                        {visibleSkills.length > 0 && (
                            <ul
                                aria-label="Skills"
                                className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5"
                            >
                                {visibleSkills.map((skill, index) => (
                                    <li
                                        key={`${skill}-${index}`}
                                        className="max-w-[12rem] truncate rounded-full bg-brand/10 border border-brand/20 px-2.5 py-1 text-xs font-medium text-brand-light"
                                    >
                                        {skill}
                                    </li>
                                ))}
                                {hiddenSkills.length > 0 && (
                                    <li
                                        title={hiddenSkills.join(", ")}
                                        className="rounded-full bg-white/[0.04] border border-line px-2.5 py-1 text-xs font-medium text-ink-300"
                                    >
                                        +{hiddenSkills.length}
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>

                    {/* ACTION BUTTONS: last on mobile, beside the avatar on sm+ */}
                    <div className="order-last w-full flex gap-2 sm:w-auto sm:col-start-2 sm:row-start-1 sm:justify-self-end sm:self-end">
                        {isOwnProfile ? (
                            <>
                                <Link
                                    to="/edit-profile"
                                    className={`${actionButton} ${secondaryButton} flex-1 sm:flex-none`}
                                >
                                    <PenLine size={16} aria-hidden="true" /> Edit profile
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    aria-label={copied ? "Profile link copied" : "Copy profile link"}
                                    title="Copy profile link"
                                    className={`${actionButton} ${secondaryButton} !px-3 min-w-[2.75rem]`}
                                >
                                    {copied ? (
                                        <>
                                            <Check size={16} className="text-emerald-300" aria-hidden="true" />
                                            <span className="text-emerald-300">Copied</span>
                                        </>
                                    ) : (
                                        <Share2 size={16} aria-hidden="true" />
                                    )}
                                </button>
                                <span className="sr-only" aria-live="polite">
                                    {copied ? "Profile link copied" : ""}
                                </span>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={onConnect}
                                    disabled={isConnectDisabled}
                                    className={`${actionButton} ${connectStyle} flex-1 sm:flex-none sm:min-w-[8.5rem]`}
                                >
                                    {connectLabels[connectionStatus] || "Connect"}
                                </button>
                                {/* Only connections can message each other */}
                                <button
                                    type="button"
                                    onClick={onChat}
                                    disabled={connectionStatus !== "connected"}
                                    title={
                                        connectionStatus === "connected" ? undefined : "Connect first to send messages"
                                    }
                                    className={`${actionButton} ${secondaryButton} flex-1 sm:flex-none sm:min-w-[7rem] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/[0.04] disabled:hover:border-line`}
                                >
                                    <MessageSquare size={16} aria-hidden="true" /> Chat
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
