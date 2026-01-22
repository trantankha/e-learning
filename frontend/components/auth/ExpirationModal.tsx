"use client";

import { LogIn } from "lucide-react";
import Image from "next/image";

interface ExpirationModalProps {
    isOpen: boolean;
    onLogin: () => void;
}

export default function ExpirationModal({ isOpen, onLogin }: ExpirationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-6 text-center border-4 border-violet-200 animate-in zoom-in-95 duration-300">

                {/* Mascot Image */}
                <div className="mb-6 relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-violet-100 rounded-full animate-pulse opacity-50"></div>
                    <div className="relative z-10 text-6xl flex items-center justify-center h-full w-full animate-bounce">
                        ⏰
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-black text-violet-600 mb-2">
                    Hết giờ rồi!
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-8 text-lg font-medium leading-relaxed">
                    Bé ơi, mình cần đăng nhập lại <br />
                    để tiếp tục chơi nhé! 🐰
                </p>

                {/* Action Button */}
                <button
                    onClick={onLogin}
                    className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                >
                    <LogIn size={24} />
                    Đăng nhập lại ngay
                </button>
            </div>
        </div>
    );
}
