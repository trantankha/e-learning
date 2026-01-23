'use client';

import { useState, useEffect } from "react";
import { useStudentStore } from "@/stores/studentStore";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Plus } from "lucide-react";
import { MENU_ITEMS } from "./Sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import toast from "react-hot-toast";
import GemModal from "./GemModal";

export function TopBar() {
    const { isAuthenticated } = useAuth(true);
    const { fullName, gems, stars, avatarUrl, fetchProfile } = useStudentStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isGemModalOpen, setIsGemModalOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated, fetchProfile]);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        if (window.confirm("Bé có chắc muốn đăng xuất không?")) {
            toast.success("Hẹn gặp lại bé nha! 👋");
            authService.logout();
        }
    };

    if (!isAuthenticated) return null;

    return (
        <>
            <div className="bg-white border-b-2 border-slate-100 px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-30 shadow-sm h-16">
                {/* Left: Mobile Menu Trigger or Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-2 -ml-2 rounded-xl active:bg-slate-100 text-slate-600"
                    >
                        <Menu className="h-7 w-7" />
                    </button>

                    {/* Mobile Logo */}
                    <div className="flex md:hidden items-center gap-1">
                        <span className="text-xl">🐱</span>
                        <span className="text-lg font-black text-sky-800 tracking-tight">KidsEng</span>
                    </div>
                </div>

                {/* Right: Stats & Profile */}
                <div className="flex items-center gap-3 md:gap-6">
                    {/* Gems */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 md:gap-2 bg-sky-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-sky-100">
                            <span className="text-lg md:text-2xl animate-pulse">💎</span>
                            <span className="font-black text-sky-600 text-base md:text-lg">{gems}</span>
                        </div>
                        <button
                            onClick={() => setIsGemModalOpen(true)}
                            className="bg-sky-100 hover:bg-sky-200 text-sky-600 rounded-full p-1 transition-colors"
                            aria-label="Buy Gems"
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1.5 md:gap-2 bg-yellow-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-yellow-100">
                        <span className="text-lg md:text-2xl drop-shadow-sm">⭐</span>
                        <span className="font-black text-yellow-600 text-base md:text-lg">{stars}</span>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-3 pl-2 md:pl-4 md:border-l border-slate-100">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-slate-400 font-bold uppercase">Học viên</p>
                            <p className="font-bold text-slate-700 leading-tight">{fullName}</p>
                        </div>
                        <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-200 border-2 border-white shadow-md flex items-center justify-center text-lg md:text-xl overflow-hidden">
                            <Image
                                src={avatarUrl || "/images/avatar-default.png"}
                                alt="Avatar"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Sidebar Pane */}
                    <div className="relative w-[280px] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
                        <div className="p-4 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🐱</span>
                                <span className="text-xl font-black text-sky-800 tracking-tight">KidsEng</span>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 rounded-xl active:bg-slate-100 text-slate-500"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {MENU_ITEMS.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all text-base",
                                            isActive
                                                ? "bg-orange-50 text-orange-600 border border-orange-100"
                                                : "text-slate-500 active:bg-slate-50"
                                        )}
                                    >
                                        <span className="text-2xl">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="p-4 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 active:bg-red-50 active:text-red-500 transition-colors"
                            >
                                <span className="text-2xl">🚪</span>
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Gem Modal Triggered from Header */}
            <GemModal isOpen={isGemModalOpen} onClose={() => setIsGemModalOpen(false)} />
        </>
    );
}
