import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Gift, Sparkles } from 'lucide-react';
import axiosClient from '@/lib/axiosClient';
import PaymentModal from './PaymentModal';
import { GemOrderResponse, GemPackResponse } from '@/types/schema';

interface GemPack extends GemPackResponse { }

const GemShop: React.FC = () => {
    const [gemPacks, setGemPacks] = useState<GemPack[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<GemOrderResponse | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [processingPackId, setProcessingPackId] = useState<number | null>(null);

    // Fetch gem packs
    useEffect(() => {
        const fetchGemPacks = async () => {
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

        fetchGemPacks();
    }, []);

    // Handle buying gem pack
    const handleBuyGems = async (packId: number) => {
        setProcessingPackId(packId);
        try {
            const response = await axiosClient.post('/payment/gem-orders', {
                gem_pack_id: packId,
                coupon_code: couponCode || undefined
            });

            setSelectedOrder(response.data);
            setIsPaymentOpen(true);
            toast.success('Tạo đơn hàng thành công. Vui lòng quét mã QR để thanh toán');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Lỗi tạo đơn hàng';
            toast.error(message);
        } finally {
            setProcessingPackId(null);
        }
    };

    // Handle payment success
    const handlePaymentSuccess = () => {
        setCouponCode('');
        toast.success('Thanh toán thành công! Gems đã được cộng vào ví của bạn');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full mb-4">
                        <Sparkles size={20} />
                        <span className="font-semibold">Cửa Hàng Gem</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Mua Gem Để Mở Khóa Vật Phẩm
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Chọn gói Gem phù hợp và thanh toán qua VietQR
                    </p>
                </div>

                {/* Coupon Section */}
                <div className="mb-8 bg-white rounded-2xl shadow-md p-6 border-2 border-indigo-100">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Nhập mã giảm giá (nếu có)"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Gem Packs Grid */}
                {gemPacks.length === 0 ? (
                    <div className="text-center py-12">
                        <Gift size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600 text-lg">Hiện chưa có gói Gem nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gemPacks.map((pack) => (
                            <div
                                key={pack.id}
                                className={`relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-4 ${pack.bonus_gem_percent > 0
                                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
                                    : 'border-indigo-200 bg-white'
                                    }`}
                            >
                                {/* Bonus Badge */}
                                {pack.bonus_gem_percent > 0 && (
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                        +{pack.bonus_gem_percent.toFixed(0)}%
                                    </div>
                                )}

                                {/* Card Content */}
                                <div className="p-6 flex flex-col h-full">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                            {pack.name}
                                        </h3>
                                        {pack.description && (
                                            <p className="text-gray-600 text-sm">
                                                {pack.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Gems Display */}
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 mb-4 text-white text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Sparkles size={24} />
                                            <span className="text-3xl font-bold">
                                                {pack.total_gems.toLocaleString()}
                                            </span>
                                        </div>
                                        {pack.bonus_gem_percent > 0 && (
                                            <p className="text-sm opacity-90">
                                                ({pack.gem_amount.toLocaleString()} + {(pack.total_gems - pack.gem_amount).toLocaleString()} thưởng)
                                            </p>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6 flex-grow">
                                        <p className="text-gray-600 text-sm mb-2">Giá:</p>
                                        <p className="text-4xl font-bold text-indigo-600">
                                            {pack.price_vnd.toLocaleString()}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1">VND</p>
                                    </div>

                                    {/* Buy Button */}
                                    <button
                                        onClick={() => handleBuyGems(pack.id)}
                                        disabled={processingPackId === pack.id}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        {processingPackId === pack.id ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                <span>Đang xử lý...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Gift size={20} />
                                                <span>Mua Ngay</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Payment Modal */}
                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    orderData={selectedOrder}
                    onSuccess={handlePaymentSuccess}
                />

                {/* Info Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-indigo-500">
                        <h3 className="font-bold text-lg text-indigo-600 mb-2">🔒 An Toàn</h3>
                        <p className="text-gray-600 text-sm">
                            Thanh toán qua VietQR hoàn toàn an toàn và bảo mật
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-purple-500">
                        <h3 className="font-bold text-lg text-purple-600 mb-2">⚡ Nhanh Chóng</h3>
                        <p className="text-gray-600 text-sm">
                            Gems được cộng tự động sau khi thanh toán thành công
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-pink-500">
                        <h3 className="font-bold text-lg text-pink-600 mb-2">💰 Tiết Kiệm</h3>
                        <p className="text-gray-600 text-sm">
                            Các gói lớn có mức giá ưu đãi hơn
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GemShop;
