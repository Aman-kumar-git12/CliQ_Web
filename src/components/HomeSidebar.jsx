import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../context/userContext";
import axiosClient from "../api/axiosClient";
import { Search, TrendingUp, ChevronRight } from "lucide-react";

const Sparkline = ({ color = "#FF3399" }) => (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
        <path d="M1 23L12 18L24 21L36 10L48 14L59 1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const HomeSidebar = () => {
    const { user: currentUser } = useUserContext();
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const trendingItems = [
        { id: 1, tag: "#BuildInPublic", count: "12.4k posts", color: "#6600FF" },
        { id: 2, tag: "#AiArt", count: "8.1k posts", color: "#FF3399" },
        { id: 3, tag: "#motivation", count: "6.7k posts", color: "#00E0FF" },
        { id: 4, tag: "#devlife", count: "4.2k posts", color: "#7928CA" },
    ];

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await axiosClient.get("/user/search/suggested");
                setSuggestedUsers(res.data.slice(0, 3));
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    if (!currentUser) return null;

    return (
        <div className="flex flex-col gap-8 w-full pt-2">

            {/* TRENDING */}
            <div className="px-1">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.25em] flex items-center gap-2">
                        Trending
                    </h3>
                    <Link to="/trending" className="text-[11px] font-bold text-[#a78bfa] hover:text-white transition-colors flex items-center gap-1">
                        See all <ChevronRight size={12} />
                    </Link>
                </div>

                <div className="flex flex-col gap-6">
                    {trendingItems.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between group cursor-pointer px-1">
                            <div className="flex items-center gap-4">
                                <span className="text-[28px] font-black text-white/20 leading-none w-6">{idx + 1}</span>
                                <div className="flex flex-col">
                                    <span className="text-[13.5px] font-bold text-white group-hover:text-[#a78bfa] transition-colors tracking-tight">{item.tag}</span>
                                    <span className="text-[10px] font-bold text-white/40 mt-0.5 tracking-wide">{item.count}</span>
                                </div>
                            </div>
                            <Sparkline color={item.color} />
                        </div>
                    ))}
                </div>
            </div>

            {/* DISCOVER PEOPLE */}
            <div className="px-1">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.25em]">
                        Discover People
                    </h3>
                    <Link to="/find/findpeople" className="text-[11px] font-bold text-[#a78bfa] hover:text-white transition-colors flex items-center gap-1">
                        Explore <ChevronRight size={12} />
                    </Link>
                </div>

                <div className="flex flex-col gap-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)
                    ) : (
                        suggestedUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between group p-2 hover:bg-white/[0.02] rounded-xl transition-all border border-transparent hover:border-white/5">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <img
                                            src={user.imageUrl || "https://github.com/shadcn.png"}
                                            className="w-10 h-10 rounded-full object-cover border border-white/10 p-0.5"
                                            alt=""
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[13px] font-black text-white truncate group-hover:text-[var(--cliq-lilac)] transition-colors tracking-tight">
                                            {user.firstname} {user.lastname}
                                        </span>
                                        <span className="text-[10px] text-white/40 font-black uppercase tracking-tighter mt-0.5">New Discovery</span>
                                    </div>
                                </div>
                                <button className="px-4 py-1.5 border border-[#8b5cf6]/30 rounded-full text-[12px] font-bold text-[#a78bfa] hover:bg-gradient-to-r hover:from-[#8b5cf6] hover:to-[#ec4899] hover:text-white hover:border-transparent transition-all active:scale-95 bg-[#8b5cf6]/10 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                                    Follow
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* FOOTER */}
            <div className="px-2 pb-8 mt-4">
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-5">
                    {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms'].map(link => (
                        <button key={link} className="text-[11px] text-white/30 font-bold hover:text-white transition-colors">
                            {link}
                        </button>
                    ))}
                </div>
                <p className="text-[11px] text-white/20 font-black tracking-widest uppercase">
                    © 2026 CLIQ
                </p>
            </div>
        </div>
    );
};

export default HomeSidebar;
