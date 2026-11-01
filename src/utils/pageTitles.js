// Browser-tab titles per route, checked in order; the first matching prefix wins
const PAGE_TITLES = [
    ["/home", "Feed"],
    ["/search", "Search"],
    ["/find", "Explore"],
    ["/requests", "Requests"],
    ["/messages", "Messages"],
    ["/notifications", "Notifications"],
    ["/create/post", "New post"],
    ["/post/", "Post"],
    ["/saved", "Saved"],
    ["/profile", "Your profile"],
    ["/edit-profile", "Edit profile"],
    ["/my-experties", "Expertise Studio"],
    ["/settings", "Settings"],
    ["/public-profile/", "Profile"],
    ["/user/", "Profile"],
    ["/login", "Log in"],
    ["/verify-email", "Verify email"],
    ["/verify-otp", "Verify code"],
    ["/blocked-account", "Account blocked"],
];

export const pageTitle = (pathname) => {
    if (pathname === "/") return "Sign up · CliQ";
    // "/find" matches "/find" and "/find/…"; prefixes ending in "/" ("/post/") only match their sub-paths
    const match = PAGE_TITLES.find(
        ([prefix]) => pathname === prefix || pathname.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`),
    );
    return match ? `${match[1]} · CliQ` : "CliQ";
};
