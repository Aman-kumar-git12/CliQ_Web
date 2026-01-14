import { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import LogoutConfirmation from "./Confirmation";
import MyExperties from "./MyExperties/MyExperties";
import { Plus, Camera, Eye, Upload, X, UserCog } from "lucide-react";
import { useUserContext } from "../context/userContext";
import ProfileShimmering from "./shimmering/ProfileShimmering";

export default function ProfilePage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { setUser: setGlobalUser } = useUserContext();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    // Upload & View States
    const [selectedFile, setSelectedFile] = useState(null);
    const [showUploadConfirm, setShowUploadConfirm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showImageMenu, setShowImageMenu] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);

    // Expertise States
    const [showExpertiseMenu, setShowExpertiseMenu] = useState(false);
    const [showExpertiseModal, setShowExpertiseModal] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get("/profile", {
                    withCredentials: true,
                });
                setUser(res.data.user);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {

        if (!user) return;

        const fetchPosts = async () => {
            try {
                const res = await axiosClient.get(`/user/posts/${user.id}`, {
                    withCredentials: true,
                });
                setPosts(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoadingPosts(false);
            }
        };
        fetchPosts();
    }, [user]);

    const handleLogout = async () => {
        try {
            await axiosClient.post("/logout", {}, { withCredentials: true });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setUser(null);
            setGlobalUser(null); // Clear global user state
        }
    };

    const handleEditProfile = () => {
        setShowEditConfirm(false);
        navigate("/edit-profile");
    };

    // File Selection Handler
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setShowUploadConfirm(true);
        }
    };

    // Upload Handler
    const handleUploadImage = async () => {
        if (!selectedFile) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            console.log("Uploading image...");
            // Assuming endpoint is /profile/image for image upload
            const res = await axiosClient.put("/profile/image", formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log(res)

            // Update user state with new image
            setUser(prev => ({ ...prev, imageUrl: res.data.imageUrl || res.data.user.imageUrl }));
            setShowUploadConfirm(false);
            setSelectedFile(null);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const cancelUpload = () => {
        setShowUploadConfirm(false);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Menu Handlers
    const handleOptionUpload = () => {
        setShowImageMenu(false);
        fileInputRef.current.click();
    };

    const handleOptionView = () => {
        setShowImageMenu(false);
        setShowImageViewer(true);
    };

    if (loading)
        return <ProfileShimmering />;

    if (!user)
        return <div className="text-center text-white mt-10">No user found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white relative overflow-hidden transition-colors duration-300">
            {/* Background Gradients (Subtle Dark Glow) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-800/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-4xl mx-auto pt-4 px-4 pb-20 relative z-10">

                {/* GLASSMORPHIC PROFILE CARD */}
                <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl">

                    {/* Header Banner / Gradient Top */}
                    <div className="h-32 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden rounded-t-3xl">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
                        <button
                            onClick={() => navigate("/edit-profile")}
                            className="absolute bottom-3 right-4 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all border border-white/20 flex items-center gap-2"
                        >
                            <UserCog size={14} /> Edit Profile
                        </button>
                    </div>

                    <div className="px-6 sm:px-10 pb-10">
                        {/* AVATAR & INFO HEADER */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-8 gap-6">

                            {/* Avatar Wrapper */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/40 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                                <img
                                    src={user.imageUrl}
                                    alt="User"
                                    className="relative w-32 h-32 rounded-full object-cover border-4 border-white dark:border-[#111] shadow-2xl"
                                />
                                {/* Upload Button */}
                                <button
                                    onClick={() => setShowImageMenu(!showImageMenu)}
                                    className="absolute bottom-1 right-1 bg-white dark:bg-black text-black dark:text-white p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform z-20"
                                >
                                    <Camera size={18} />
                                </button>

                                {/* Options Menu */}
                                {showImageMenu && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fadeIn">
                                        <button
                                            onClick={handleOptionView}
                                            className="px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-[#2a2a2a] flex items-center gap-2"
                                        >
                                            <Eye size={16} /> View Image
                                        </button>
                                        <button
                                            onClick={handleOptionUpload}
                                            className="px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-[#2a2a2a] flex items-center gap-2"
                                        >
                                            <Upload size={16} /> Upload Image
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {/* User Name & Handle */}
                            <div className="text-center sm:text-left flex-1">
                                <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">
                                    {user.firstname} {user.lastname}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">@{user.firstname.toLowerCase()}_{user.lastname.toLowerCase()}</p>
                            </div>
                        </div>

                        {/* STATS ROW (Grid Layout) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Age</span>
                                <span className="text-xl font-bold dark:text-gray-200">{user.age || "N/A"}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Posts</span>
                                <span className="text-xl font-bold dark:text-gray-200">{posts.length}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center sm:col-span-2">
                                <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Joined</span>
                                <span className="text-lg font-bold dark:text-gray-200">{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="relative flex-1 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                                <button
                                    onClick={() => setShowExpertiseMenu(!showExpertiseMenu)}
                                    className="relative w-full bg-white dark:bg-black text-black dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-all"
                                >
                                    My Expertise
                                </button>

                                {/* Expertise Menu */}
                                {showExpertiseMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-30 overflow-hidden flex flex-col animate-fadeIn">
                                        <button
                                            onClick={() => {
                                                setShowExpertiseMenu(false);
                                                navigate("/my-experties");
                                            }}
                                            className="px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-[#2a2a2a] border-b border-gray-100 dark:border-white/5"
                                        >
                                            Add Expertise
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowExpertiseMenu(false);
                                                setShowExpertiseModal(true);
                                            }}
                                            className="px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                                        >
                                            View Expertise
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative flex-1 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-emerald-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                                <button
                                    onClick={() => navigate("/my-connections")}
                                    className="relative w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl py-3.5 font-bold shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                                >
                                    My Connections
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* POSTS SECTION */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
                            My Posts
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{posts.length}</span>
                        </h2>
                    </div>

                    {!loadingPosts && posts.length === 0 && (
                        <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">You haven't posted anything yet.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {posts.map((post) => (
                            <Link
                                to={`/post/${post.id}`}
                                key={post.id}
                                className="group relative aspect-square bg-gray-100 dark:bg-[#111] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                {post.image ? (
                                    <>
                                        <img
                                            src={post.image}
                                            alt="Post"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 p-4 text-center text-sm">
                                        <p className="line-clamp-3">{post.content}</p>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>

            {/* MODALS */}
            <LogoutConfirmation
                isOpen={showLogoutPopup}
                onClose={() => setShowLogoutPopup(false)}
                onConfirm={handleLogout}
                title="Are you sure you want to logout?"
                confirmText="Yes, Logout"
            />



            <LogoutConfirmation
                isOpen={showUploadConfirm}
                onClose={cancelUpload}
                onConfirm={handleUploadImage}
                title="Update Profile Photo"
                message="Looks good! Want to set this as your new profile picture?"
                confirmText={uploading ? "Uploading..." : "Update"}
                confirmColor="bg-pink-600 hover:bg-pink-700"
            />

            {/* Image Viewer */}
            {showImageViewer && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowImageViewer(false)}
                >
                    <button
                        onClick={() => setShowImageViewer(false)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white p-2 transition-colors"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* My Expertise Modal */}
            {
                showExpertiseModal && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
                        onClick={() => setShowExpertiseModal(false)}
                    >
                        <div
                            className="bg-white dark:bg-[#0f0f0f] w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Gradient Blob */}
                            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <h2 className="text-3xl font-bold text-black dark:text-white">My Expertise</h2>
                                <button
                                    onClick={() => setShowExpertiseModal(false)}
                                    className="bg-gray-100 dark:bg-white/5 p-2 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="relative z-10">
                                {user.expertise ? (
                                    <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                        <MyExperties expertise={user.expertise} />
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                        <p className="text-gray-500 dark:text-gray-400 mb-6">Showcase your skills to the community.</p>
                                        <button
                                            onClick={() => {
                                                setShowExpertiseModal(false);
                                                navigate("/my-experties");
                                            }}
                                            className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                                        >
                                            Add Skills
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
