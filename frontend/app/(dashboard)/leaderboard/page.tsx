"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Star, Crown } from "lucide-react";

interface LeaderboardEntry {
    rank: number;
    student_id: number;
    full_name: string;
    avatar_url: string | null;
    stars: number;
    is_current_user: boolean;
}

interface LeaderboardResponse {
    top_users: LeaderboardEntry[];
    user_rank: LeaderboardEntry | null;
}

export default function LeaderboardPage() {
    const [data, setData] = useState<LeaderboardResponse | null>(null);
    const [period, setPeriod] = useState<"weekly" | "all_time">("weekly");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get("/leaderboard", {
                    params: { period },
                });
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-8 w-8 text-yellow-500 fill-yellow-500 animate-bounce" />;
        if (rank === 2) return <Medal className="h-7 w-7 text-slate-400 fill-slate-300" />;
        if (rank === 3) return <Medal className="h-7 w-7 text-amber-700 fill-amber-600" />;
        return <span className="text-xl font-bold text-slate-500 w-8 text-center">{rank}</span>;
    };

    const getRowStyle = (rank: number, isCurrentUser: boolean) => {
        const baseStyle = "flex items-center p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.01]";

        if (isCurrentUser) return cn(baseStyle, "bg-sky-50 border-sky-200 shadow-md ring-2 ring-sky-100");
        if (rank === 1) return cn(baseStyle, "bg-yellow-50/80 border-yellow-200 shadow-sm");
        if (rank === 2) return cn(baseStyle, "bg-slate-50 border-slate-200");
        if (rank === 3) return cn(baseStyle, "bg-orange-50/50 border-orange-100");

        return cn(baseStyle, "bg-white border-slate-100");
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🏆</span>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bảng Xếp Hạng</h1>
                </div>

                {/* Toggle */}
                <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button
                        onClick={() => setPeriod("weekly")}
                        className={cn(
                            "px-6 py-2 rounded-lg font-bold text-sm transition-all",
                            period === "weekly"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Tuần Này
                    </button>
                    <button
                        onClick={() => setPeriod("all_time")}
                        className={cn(
                            "px-6 py-2 rounded-lg font-bold text-sm transition-all",
                            period === "all_time"
                                ? "bg-white text-amber-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Tất Cả
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Đang tải bảng xếp hạng...</div>
            ) : (
                <div className="space-y-3">
                    {data?.top_users.map((user) => (
                        <div key={user.student_id} className={getRowStyle(user.rank, user.is_current_user)}>
                            <div className="flex items-center justify-center w-12 mr-2">
                                {getRankIcon(user.rank)}
                            </div>

                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={user.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.full_name}`}
                                    alt={user.full_name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="ml-4 flex-1">
                                <p className={cn(
                                    "font-bold text-base md:text-lg truncate",
                                    user.is_current_user ? "text-sky-700" : "text-slate-700"
                                )}>
                                    {user.full_name} {user.is_current_user && "(Bạn)"}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100/50 rounded-full text-yellow-700 font-bold">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span>{user.stars}</span>
                            </div>
                        </div>
                    ))}

                    {/* Empty state */}
                    {data?.top_users.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <span className="text-4xl block mb-2">🏜️</span>
                            <p className="text-slate-500 font-medium">Chưa có dữ liệu xếp hạng tuần này.</p>
                            <p className="text-sm text-slate-400">Hãy là người đầu tiên ghi điểm nhé!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Current User Rank Footer (Fixed) */}
            {data?.user_rank && (
                <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-sky-100 p-2 rounded-full">
                                <Trophy className="h-5 w-5 text-sky-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Thứ hạng của bạn</p>
                                <p className="text-lg font-bold text-slate-800">
                                    Hạng #{data.user_rank.rank}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-center gap-1.5 text-yellow-600 font-bold text-xl">
                                <span>{data.user_rank.stars}</span>
                                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                            </div>
                            {data.user_rank.rank > 10 && (
                                <p className="text-xs text-sky-600 font-medium">Cố lên, sắp lọt Top 10 rồi! 💪</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
