'use client';

import PaymentModal from "@/components/PaymentModal";
import CheckoutModal from "@/components/CheckoutModal";
import { OrderResponse } from "@/types/schema";
import { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { useStudentStore } from "@/stores/studentStore";
import axiosClient from "@/lib/axiosClient";
import { ShopItem } from "@/types/schema";
import { cn } from "@/lib/utils";
import UserAvatar, { AvatarItem } from "@/components/UserAvatar";

export default function ShopPage() {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const { addRewards, setGems, gems, fetchProfile } = useStudentStore();

    // Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<OrderResponse | null>(null);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [selectedGemPack, setSelectedGemPack] = useState<{ id: string, name: string, price: number, type: string } | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axiosClient.get<ShopItem[]>("/shop/items");
            setItems(res.data);
        } catch (error) {
            console.error("Failed to fetch shop items", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyItem = async (item: ShopItem) => {
        if (item.is_owned) return;

        if (gems < item.price) {
            toast.error("Bạn cần học chăm chỉ hơn để kiếm thêm đá quý! 💎", {
                icon: '😢',
                style: { borderRadius: '20px', background: '#ffe4e6', color: '#be123c' }
            });
            return;
        }

        const confirm = window.confirm(`Bạn có muốn mua "${item.name}" với giá ${item.price} Gems không?`);
        if (!confirm) return;

        try {
            const res = await axiosClient.post("/shop/buy", { item_id: item.id });

            if (res.data.remaining_gems !== undefined) {
                setGems(res.data.remaining_gems);
            } else {
                addRewards(-item.price, 0);
            }

            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_owned: true } : i));

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            toast.success(`Mua thành công "${item.name}"!`, {
                icon: '🎉',
                style: { borderRadius: '20px', background: '#dcfce7', color: '#15803d', fontWeight: 'bold' }
            });
        } catch (error: any) {
            console.error("Buy failed", error);
            toast.error(error.response?.data?.detail || "Giao dịch thất bại");
        }
    };

    const handleEquipItem = async (item: ShopItem) => {
        try {
            const res = await axiosClient.post("/shop/equip/" + item.id);

            // Update local state to reflect equipment change
            setItems(prev => prev.map(i => {
                // If this is the item we equipped, set is_equipped = true
                if (i.id === item.id) return { ...i, is_equipped: true };

                // If same category as equipped item, unequip it
                // We rely on backend response or just client logic. 
                // Backend ensures only 1 per category. Client should reflect that.
                if (i.category === item.category && i.id !== item.id) {
                    return { ...i, is_equipped: false };
                }

                return i;
            }));

            toast.success(`Đã mặc "${item.name}"!`, { icon: '👕' });
        } catch (error: any) {
            console.error("Equip failed", error);
            toast.error("Không thể thay đồ.");
        }
    };

    const handleBuyGems = (amount: number, price: number) => {
        setSelectedGemPack({
            id: `gem_${amount}`,
            name: `Gói ${amount} Gems`,
            price: price,
            type: "gem_pack"
        });
        setIsCheckoutModalOpen(true);
    };

    const handleCheckoutConfirm = async (couponCode?: string) => {
        if (!selectedGemPack) return;
        setIsProcessingPayment(true);

        try {
            // Create Order
            const res = await axiosClient.post<OrderResponse>("/payment/orders", {
                amount: selectedGemPack.price,
                description: `Mua ${selectedGemPack.name}`,
                item_type: selectedGemPack.type,
                item_id: selectedGemPack.id,
                coupon_code: couponCode
            });

            setCurrentOrder(res.data);
            setIsCheckoutModalOpen(false);
            setIsPaymentModalOpen(true);
        } catch (error) {
            console.error("Failed to create order", error);
            toast.error("Không thể tạo đơn hàng.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handlePaymentSuccess = () => {
        // Refresh profile to get new gems
        fetchProfile();
        toast.success("Nạp Gems thành công!", { icon: '💎' });
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#8b5cf6'] // Blue/Purple for Gems
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // Convert ShopItem[] to AvatarItem[] for preview
    const equippedItems: AvatarItem[] = items
        .filter(i => i.is_equipped)
        .map(i => ({
            id: i.id,
            category: i.category,
            layer_order: i.layer_order,
            image_url: i.image_url || ''
        }));

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8 text-center bg-white p-8 rounded-3xl shadow-sm border-2 border-sky-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-sky-800 mb-2">
                        Cửa hàng & Tủ đồ 🎁
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Dùng Gems 💎 để đổi lấy những vật phẩm siêu ngầu nhé!
                    </p>
                </div>
                <div className="absolute top-[-20px] left-[-20px] text-9xl opacity-10 rotate-[-12deg]">🛒</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                {/* Left Column: Avatar Preview */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl border-2 border-indigo-100 shadow-sm sticky top-4 flex flex-col items-center">
                        <h2 className="text-xl font-bold text-slate-700 mb-4">Avatar của bạn</h2>
                        <UserAvatar items={equippedItems} size={250} />
                        <div className="mt-4 text-center">
                            <p className="text-sm text-slate-400">Thay đồ để xem trước nhé!</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Shop Items */}
                <div className="lg:col-span-3">
                    {/* Gem Packs Section */}
                    <div className="mb-10 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-3xl border border-blue-100">
                        <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <span>💎</span> Nạp thêm Gems
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { gems: 100, price: 10000, color: "bg-white border-blue-200 text-blue-600" },
                                { gems: 500, price: 45000, color: "bg-white border-purple-200 text-purple-600" },
                                { gems: 1000, price: 80000, color: "bg-white border-pink-200 text-pink-600" },
                                { gems: 2000, price: 150000, color: "bg-white border-yellow-200 text-yellow-600" },
                            ].map((pack) => (
                                <div key={pack.gems} className={`border-2 rounded-2xl p-4 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform shadow-sm ${pack.color}`}
                                    onClick={() => handleBuyGems(pack.gems, pack.price)}>
                                    <div className="text-3xl mb-1">💎</div>
                                    <div className="font-bold text-lg text-slate-700">{pack.gems}</div>
                                    <button className="bg-slate-50 border hover:bg-slate-100 text-slate-600 font-bold py-1 px-3 rounded-full text-xs mt-2">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pack.price)}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                            <span>🛍️</span> Vật phẩm đổi thưởng
                        </h2>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        {[
                            { id: 'all', label: 'Tất cả', icon: '🌟' },
                            { id: 'hat', label: 'Mũ', icon: '🧢' },
                            { id: 'shirt', label: 'Áo', icon: '👕' },
                            { id: 'glasses', label: 'Kính', icon: '🕶️' },
                            { id: 'background', label: 'Nền', icon: '🏖️' },
                            { id: 'body', label: 'Cơ thể', icon: '🧍' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveCategory(tab.id as any)}
                                className={cn(
                                    "px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
                                    activeCategory === tab.id
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                                        : "bg-white text-slate-500 border-2 border-slate-100 hover:border-indigo-200 hover:text-indigo-500"
                                )}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items
                            .filter(item => activeCategory === 'all' || item.category === activeCategory)
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "relative bg-white rounded-3xl p-6 border-2 flex flex-col items-center transition-all duration-300",
                                        item.is_equipped
                                            ? "border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200"
                                            : item.is_owned
                                                ? "border-green-200 bg-green-50/50"
                                                : "border-slate-100 hover:border-orange-200 hover:shadow-lg hover:-translate-y-1"
                                    )}
                                >
                                    {/* Image/Icon */}
                                    <div className="w-28 h-28 rounded-2xl bg-white flex items-center justify-center text-6xl shadow-sm mb-4 border border-slate-100 overflow-hidden p-2">
                                        {item.image_url ?
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                                            : "🎁"
                                        }
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-700 mb-1 text-center leading-tight min-h-[3rem] flex items-center justify-center">{item.name}</h3>

                                    <div className="mt-auto w-full pt-4">
                                        {item.is_owned ? (
                                            item.is_equipped ? (
                                                <button
                                                    disabled
                                                    className="w-full py-3 rounded-2xl bg-indigo-500 text-white font-bold cursor-default opacity-90 shadow-lg shadow-indigo-200"
                                                >
                                                    Đang mặc ✨
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEquipItem(item)}
                                                    className="w-full py-3 rounded-2xl bg-green-100 text-green-700 font-bold hover:bg-green-200 transition border-2 border-green-200"
                                                >
                                                    Mặc ngay 👕
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                onClick={() => handleBuyItem(item)}
                                                className="w-full py-3 rounded-2xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition flex justify-center items-center gap-2 transform active:scale-95"
                                            >
                                                <span>Mua</span>
                                                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-lg">
                                                    <span>💎</span>
                                                    <span>{item.price}</span>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {currentOrder && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    orderData={currentOrder}
                    onSuccess={handlePaymentSuccess}
                />
            )}

            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                item={selectedGemPack}
                onConfirm={handleCheckoutConfirm}
                isLoading={isProcessingPayment}
            />
        </div>
    );
}
