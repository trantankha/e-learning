'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Gift, Sparkles, X, Ticket } from 'lucide-react';
import axiosClient from '@/lib/axiosClient';
import PaymentModal from './PaymentModal';
import { GemOrderResponse, GemPackResponse } from '@/types/schema';

interface GemPack extends GemPackResponse { }

interface GemModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GemModal: React.FC<GemModalProps> = ({ isOpen, onClose }) => {
    const [gemPacks, setGemPacks] = useState<GemPack[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<GemOrderResponse | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [processingPackId, setProcessingPackId] = useState<number | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchGemPacks();
        }
    }, [isOpen]);

    const fetchGemPacks = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/payment/gem-packs');
            setGemPacks(response.data);
        } catch (error) {
            console.error('Error fetching gem packs:', error);
            toast.error('Không thể tải danh sách gói Gem');
        } finally {
            setLoading(false);
        }
    };

    const handleBuyGems = async (packId: number) => {
        setProcessingPackId(packId);
        try {
            const response = await axiosClient.post('/payment/gem-orders', {
                gem_pack_id: packId,
                coupon_code: couponCode || undefined
            });

            setSelectedOrder(response.data);
            // Close GemModal and open PaymentModal? 
            // Or keep GemModal open and show PaymentModal on top?
            // Requirement says "Modal displays list of gem packages". 
            // Payment logic in GemShop used to open PaymentModal. 
            // We can stack them.
            setIsPaymentOpen(true);
            toast.success('Tạo đơn hàng thành công!');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Lỗi tạo đơn hàng';
            toast.error(message);
        } finally {
            setProcessingPackId(null);
        }
    };

    const handlePaymentSuccess = () => {
        setCouponCode('');
        toast.success('Thanh toán thành công! Gems đã được cộng vào ví của bạn');
        setIsPaymentOpen(false);
        onClose(); // Close the shop modal too on success? Or let user buy more? Let's close for now.
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 border-4 border-indigo-100">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 pb-12 text-center relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full mb-4 border border-white/20">
                            <Sparkles size={18} className="text-yellow-300" />
                            <span className="font-bold text-sm">Cửa Hàng Gem</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-sm">
                            Nạp Gem - Mở Khóa Niềm Vui! 💎
                        </h2>
                        <p className="text-indigo-100 font-medium">Chọn gói Gem yêu thích để mua sắm thỏa thích nha!</p>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 relative -mt-6 rounded-t-[2.5rem]">

                    {/* Coupon Input */}
                    <div className="max-w-md mx-auto mb-8">
                        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-indigo-100 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
                            <div className="pl-3 flex items-center text-slate-400">
                                <Ticket size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Nhập mã giảm giá..."
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="flex-1 px-3 py-2 bg-transparent focus:outline-none font-medium text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 pb-40">
                            <Loader2 className="animate-spin text-indigo-500 w-12 h-12 mb-4" />
                            <p className="text-slate-500 font-medium">Đang tải các gói Gem...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                            {gemPacks.map((pack) => (
                                <div
                                    key={pack.id}
                                    className={`relative bg-white rounded-3xl p-5 border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl flex flex-col
                                        ${pack.bonus_gem_percent > 0
                                            ? 'border-indigo-200 shadow-indigo-100'
                                            : 'border-slate-100 shadow-slate-100'
                                        }`}
                                >
                                    {/* Badge */}
                                    {pack.bonus_gem_percent > 0 && (
                                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform">
                                            +{pack.bonus_gem_percent.toFixed(0)}% BONUS
                                        </div>
                                    )}

                                    <div className="text-center mb-4">
                                        <h3 className="text-lg font-bold text-slate-700">{pack.name}</h3>
                                        <div className="mt-4 mb-2 flex justify-center">
                                            <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center text-5xl relative group-hover:scale-110 transition-transform duration-300">
                                                💎
                                                {pack.bonus_gem_percent > 0 && (
                                                    <span className="absolute -bottom-1 -right-1 text-2xl animate-bounce">🎁</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gems Amount */}
                                    <div className="text-center mb-6">
                                        <div className="text-3xl font-black text-indigo-600 tracking-tight">
                                            {pack.total_gems.toLocaleString()}
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Gems</div>
                                    </div>

                                    {/* Price Button */}
                                    <button
                                        onClick={() => handleBuyGems(pack.id)}
                                        disabled={!!processingPackId}
                                        className="mt-auto w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:bg-indigo-600"
                                    >
                                        {processingPackId === pack.id ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <span>{pack.price_vnd.toLocaleString()} đ</span>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Payment Modal */}
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                orderData={selectedOrder}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default GemModal;
