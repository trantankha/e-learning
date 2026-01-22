"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import toast from "react-hot-toast";

export const MENU_ITEMS = [
    { name: "Bản đồ", href: "/dashboard", icon: "🗺️" },
    { name: "Ôn tập", href: "/study/review", icon: "🧠" },
    { name: "Cửa hàng", href: "/shop", icon: "🛍️" },
    { name: "Báo cáo", href: "/reports", icon: "📊" },
    { name: "BXH", href: "/leaderboard", icon: "🏆" },
    { name: "Mời bạn", href: "/invite", icon: "🎁" },
    { name: "Hồ sơ", href: "/profile", icon: "👤" },
];

export function Sidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        const confirm = window.confirm("Bé có chắc muốn đăng xuất không?");
        if (confirm) {
            toast.success("Hẹn gặp lại bé nha! 👋", {
                duration: 2000,
                style: { borderRadius: '20px', background: '#fef3c7', color: '#d97706', fontWeight: 'bold' }
            });

            // Delay slightly to let the toast show
            setTimeout(() => {
                authService.logout();
            }, 1000);
        }
    };

    return (
        <aside className="w-64 bg-white border-r-2 border-slate-100 flex flex-col h-screen sticky top-0 shadow-lg z-10 hidden md:flex">
            {/* Logo */}
            <div className="p-8 pb-4 flex items-center gap-2">
                <span className="text-3xl">🐱</span>
                <span className="text-2xl font-black text-sky-800 tracking-tight">KidsEng</span>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200",
                                isActive
                                    ? "bg-orange-50 text-orange-600 border-2 border-orange-100 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            )}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User / Logout */}
            <div className="p-6 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <span className="text-2xl">🚪</span>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
