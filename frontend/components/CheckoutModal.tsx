import React, { useState } from 'react';
import { Loader2, X, Tag } from 'lucide-react';
import axiosClient from '@/lib/axiosClient';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string;
        name: string;
        price: number;
        type: string;
    } | null;
    onConfirm: (couponCode?: string) => void;
    isLoading: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, item, onConfirm, isLoading }) => {
    const [couponCode, setCouponCode] = useState('');
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    if (!isOpen || !item) return null;

    const finalPrice = Math.max(0, item.price - discountAmount);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponMessage({ text: 'Vui lòng nhập mã giảm giá', type: 'error' });
            return;
        }

        setIsCheckingCoupon(true);
        setCouponMessage(null);
        setDiscountAmount(0);

        try {
            const res = await axiosClient.post('/payment/orders/validate-coupon', {
                coupon_code: couponCode,
                original_amount: item.price
            });

            if (res.data.valid) {
                setDiscountAmount(res.data.discount_amount);
                setCouponMessage({
                    text: `Đã giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(res.data.discount_amount)}`,
                    type: 'success'
                });
            } else {
                setCouponMessage({ text: res.data.message || 'Mã không hợp lệ', type: 'error' });
            }
        } catch (error: any) {
            setCouponMessage({ text: error.response?.data?.detail || 'Lỗi kiểm tra mã', type: 'error' });
        } finally {
            setIsCheckingCoupon(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Xác nhận thanh toán</h2>

                <div className="space-y-4 mb-8">
                    {/* Item Info */}
                    <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Sản phẩm</p>
                            <p className="font-bold text-slate-700 text-lg">{item.name}</p>
                        </div>
                        <div className="text-right">
                            {!discountAmount ? (
                                <p className="font-bold text-xl text-indigo-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                </p>
                            ) : (
                                <div className="flex flex-col items-end">
                                    <p className="text-sm text-slate-400 line-through">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                    </p>
                                    <p className="font-bold text-xl text-indigo-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coupon Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Mã giảm giá</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Nhập mã giảm giá..."
                                    className="pl-10 w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition text-[#000000]"
                                />
                            </div>
                            <button
                                onClick={handleApplyCoupon}
                                disabled={isCheckingCoupon || !couponCode}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {isCheckingCoupon ? <Loader2 className="animate-spin" size={20} /> : 'Áp dụng'}
                            </button>
                        </div>
                        {couponMessage && (
                            <p className={`text-sm mt-2 ml-1 font-medium ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {couponMessage.text}
                            </p>
                        )}
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={() => onConfirm(discountAmount > 0 ? couponCode : undefined)}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transform active:scale-95 transition-all text-lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" />
                            <span>Đang xử lý...</span>
                        </>
                    ) : (
                        <span>Thanh toán {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CheckoutModal;
