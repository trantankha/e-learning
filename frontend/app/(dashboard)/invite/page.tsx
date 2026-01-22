'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Users, CheckCircle } from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function InvitePage() {
    const { profile: user } = useStudentStore();
    const [copied, setCopied] = useState(false);

    // Fallback if profile not loaded yet
    if (!user) return <div className="p-10 text-center">Đang tải...</div>;

    const referralLink = typeof window !== 'undefined'
        ? `${window.location.origin}/register?ref=${user.referral_code || ''}`
        : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success("Đã sao chép link giới thiệu!", { icon: '📋' });
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8 text-center bg-white p-10 rounded-3xl shadow-lg border-4 border-indigo-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-indigo-800 mb-4">
                        Mời bạn thêm vui 🎁
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
                        Mời bạn bè cùng học tiếng Anh tại Kids English và nhận ngay <span className="text-indigo-600 font-bold">100 Gems</span> cho cả hai nhé!
                    </p>
                </div>
                <div className="absolute top-[-20px] left-[-20px] text-9xl opacity-5 rotate-[-12deg]">💌</div>
                <div className="absolute bottom-[-30px] right-[-30px] text-9xl opacity-5 rotate-[12deg] text-indigo-500">🤝</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Referral Link */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <span className="bg-indigo-100 p-2 rounded-xl text-indigo-600">🔗</span>
                        Link giới thiệu của bạn
                    </h2>

                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 mb-6 flex items-center justify-between">
                        <code className="text-indigo-600 font-bold text-lg truncate flex-1 mr-4">
                            {referralLink}
                        </code>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg ${copied ? 'bg-green-500 text-white shadow-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
                    >
                        {copied ? (
                            <>
                                <CheckCircle size={24} />
                                <span>Đã sao chép!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={24} />
                                <span>Sao chép Link</span>
                            </>
                        )}
                    </button>

                    <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-700 text-sm font-medium text-center">
                        💡 Mẹo: Gửi link này cho bạn bè qua Zalo hoặc Facebook nhé!
                    </div>
                </div>

                {/* Right: Stats (Placeholder for now) */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6">
                        <Users size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-700 mb-2">Bạn bè đã mời</h2>
                    <p className="text-slate-400 mb-8">Danh sách những người bạn đã giới thiệu thành công</p>

                    {/* Demo Stats */}
                    <div className="w-full space-y-4">
                        <div className="text-slate-400 italic">
                            Chưa có ai... Hãy mời bạn bè ngay nào! 🚀
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
