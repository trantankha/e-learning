"use client";

import { useEffect, useState } from "react";
import { userService, UserProfileResponse } from "@/services/userService";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ChangePassword } from "@/components/profile/ChangePassword";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"info" | "security">("info");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile();
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                // Optionally handle error state
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
        );
    }

    if (!user) {
        return <div className="text-center p-8">Không thể tải thông tin hồ sơ.</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border-b-4 border-slate-100">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center text-4xl">
                    🦄
                </div>
                <div>
                    <h1 className="text-3xl font-black text-sky-800 tracking-tight">Hồ sơ của bé</h1>
                    <p className="text-slate-500 font-medium">Quản lý thông tin và bảo mật tài khoản</p>
                </div>
            </div>

            {/* Colorful Tabs */}
            <div className="flex gap-4 p-2 bg-white rounded-3xl shadow-sm border border-slate-100 w-fit mx-auto">
                <button
                    onClick={() => setActiveTab("info")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-200",
                        activeTab === "info"
                            ? "bg-sky-500 text-white shadow-md scale-105"
                            : "text-slate-500 hover:bg-slate-50"
                    )}
                >
                    <span>📝</span>
                    <span>Thông tin chung</span>
                </button>
                <button
                    onClick={() => setActiveTab("security")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-200",
                        activeTab === "security"
                            ? "bg-rose-500 text-white shadow-md scale-105"
                            : "text-slate-500 hover:bg-slate-50"
                    )}
                >
                    <span>🔒</span>
                    <span>Bảo mật</span>
                </button>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === "info" && <ProfileInfo initialData={user} />}
                {activeTab === "security" && <ChangePassword />}
            </div>
        </div>
    );
}
