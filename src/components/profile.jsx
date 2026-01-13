import { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import LogoutConfirmation from "./Confirmation";
import MyExperties from "./MyExperties/MyExperties";
import { Plus, Camera, Eye, Upload, X } from "lucide-react";
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
    const [showEditConfirm, setShowEditConfirm] = useState(false);

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
        <div className="w-full mt-0 pt-3 md:pt-4 px-3 pb-10">
            <div className="w-full">

                {/* PROFILE CARD */}
                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-black dark:text-white shadow-xl dark:shadow-2xl rounded-2xl p-6 sm:p-8 transition-colors duration-300">

                    {/* HEADER */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <img
                                src={user.imageUrl}
                                alt="User"
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                            {/* Upload Trigger Button (Pink Segment) */}
                            <button
                                onClick={() => setShowImageMenu(!showImageMenu)}
                                className="absolute bottom-0 right-0 bg-pink-500 hover:bg-pink-600 text-white rounded-full p-1 border-2 border-white dark:border-[#111] transition-colors shadow-lg"
                            >
                                <Plus size={14} strokeWidth={3} />
                            </button>

                            {/* Options Menu */}
                            {showImageMenu && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-fadeIn">
                                    <button
                                        onClick={handleOptionView}
                                        className="px-4 py-3 text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#333] flex items-center gap-2 transition-colors border-b border-gray-200 dark:border-gray-800"
                                    >
                                        <Eye size={16} />
                                        <span className="text-sm">View Profile Image</span>
                                    </button>
                                    <button
                                        onClick={handleOptionUpload}
                                        className="px-4 py-3 text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#333] flex items-center gap-2 transition-colors"
                                    >
                                        <Upload size={16} />
                                        <span className="text-sm">Upload Image</span>
                                    </button>
                                </div>
                            )}

                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                capture="user" // Triggers camera on mobile
                                onChange={handleFileSelect}
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">
                                {user.firstname} {user.lastname}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">{user.email}</p>
                        </div>
                    </div>

                    {/* USER DETAILS */}
                    <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                        <p>
                            <span className="font-medium text-black dark:text-white">User ID:</span>{" "}
                            {`${user.firstname.toLowerCase()}_${user.lastname.toLowerCase()}`}
                        </p>
                        <p>
                            <span className="font-medium text-black dark:text-white">Age:</span> {user.age}
                        </p>
                        <p>
                            <span className="font-medium text-black dark:text-white">Joined:</span>{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-row overflow-x-auto pb-2 sm:overflow-visible gap-4 mt-8 relative w-full sm:w-auto items-center no-scrollbar">


                        {/* My Expertise Button & Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowExpertiseMenu(!showExpertiseMenu)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl text-center shadow-md dark:shadow-none whitespace-nowrap"
                            >
                                My Expertise
                            </button>

                            {showExpertiseMenu && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-fadeIn">
                                    <button
                                        onClick={() => {
                                            setShowExpertiseMenu(false);
                                            navigate("/my-experties");
                                        }}
                                        className="px-4 py-3 text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#333] transition-colors border-b border-gray-200 dark:border-gray-800"
                                    >
                                        Add Expertise
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowExpertiseMenu(false);
                                            setShowExpertiseModal(true);
                                        }}
                                        className="px-4 py-3 text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
                                    >
                                        View Expertise
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate("/my-connections")}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl shadow-md dark:shadow-none whitespace-nowrap"
                        >
                            My Connections
                        </button>


                    </div>
                </div>

                {/* POSTS + GRID */}
                <div className="mt-10">
                    <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                        My Posts
                    </h2>

                    {!loadingPosts && posts.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
                    )}

                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                        {posts.map((post) => (
                            <Link
                                to={`/post/${post.id}`}
                                key={post.id}
                                className="bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex items-center justify-center h-40 sm:h-48 hover:opacity-90 transition"
                            >
                                {post.image && (
                                    <img
                                        src={post.image}
                                        alt="User Post"
                                        className="object-cover w-full h-full"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>

            <LogoutConfirmation
                isOpen={showLogoutPopup}
                onClose={() => setShowLogoutPopup(false)}
                onConfirm={handleLogout}
                title="Are you sure you want to logout?"
                confirmText="Yes, Logout"
            />

            <LogoutConfirmation
                isOpen={showEditConfirm}
                onClose={() => setShowEditConfirm(false)}
                onConfirm={handleEditProfile}
                title="Edit Profile?"
                confirmText="Yes, Edit"
                confirmColor="bg-blue-600 hover:bg-blue-700"
            />

            {/* Upload Confirmation Modal */}
            <LogoutConfirmation
                isOpen={showUploadConfirm}
                onClose={cancelUpload}
                onConfirm={handleUploadImage}
                title="Change Profile Photo?"
                message="Do you want to upload this image as your new profile photo?"
                confirmText={uploading ? "Uploading..." : "Yes, Upload"}
                confirmColor="bg-pink-600 hover:bg-pink-700"
            />

            {/* Image Viewer Modal */}
            {showImageViewer && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowImageViewer(false)}
                >
                    <button
                        onClick={() => setShowImageViewer(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={user.imageUrl}
                        alt="Full Profile"
                        className="max-w-full max-h-[80vh] rounded-full sm:rounded-2xl object-contain shadow-2xl border border-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* View Expertise Modal */}
            {showExpertiseModal && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowExpertiseModal(false)}
                >
                    <div
                        className="bg-white dark:bg-[#111] w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowExpertiseModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">My Expertise</h2>

                        {user.expertise ? (
                            <div className="mt-4 max-h-[80vh] overflow-y-auto">
                                <MyExperties expertise={user.expertise} />
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't added any expertise yet.</p>
                                <button
                                    onClick={() => {
                                        setShowExpertiseModal(false);
                                        navigate("/my-experties");
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
                                >
                                    Add Expertise
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
