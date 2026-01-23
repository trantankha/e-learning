'use client';

import { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { useStudentStore } from "@/stores/studentStore";
import axiosClient from "@/lib/axiosClient";
import { ShopItem } from "@/types/schema";
import { cn } from "@/lib/utils";
import UserAvatar, { AvatarItem } from "@/components/UserAvatar";
import { ShoppingCart, Check } from "lucide-react";

export default function ShopPage() {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const { addRewards, setGems, gems } = useStudentStore();

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

    const categories = [
        { id: 'all', label: 'Tất cả', icon: '🌟' },
        { id: 'hat', label: 'Mũ', icon: '🧢' },
        { id: 'shirt', label: 'Áo', icon: '👕' },
        { id: 'glasses', label: 'Kính', icon: '🕶️' },
        { id: 'background', label: 'Nền', icon: '🏖️' },
        { id: 'body', label: 'Cơ thể', icon: '🧍' },
    ];

    const filteredItems = items.filter(item => activeCategory === 'all' || item.category === activeCategory);

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-black text-slate-800 mb-2 drop-shadow-sm">
                    Tủ Đồ & Cửa Hàng 🎁
                </h1>
                <p className="text-slate-500 font-medium text-lg">
                    Dùng Gems đổi quà siêu ngầu bé nhé!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column (4/12) - Sticky Avatar */}
                <div className="lg:col-span-4 sticky top-4 z-10 order-1 lg:order-none">
                    <div className="bg-white p-6 rounded-[2.5rem] border-4 border-indigo-100 shadow-xl flex flex-col items-center">
                        <div className="w-full bg-indigo-50 rounded-3xl p-4 mb-4 text-center">
                            <h2 className="text-xl font-bold text-indigo-700">Avatar Của Bé</h2>
                        </div>

                        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300">
                            <UserAvatar items={equippedItems} size={280} className="shadow-2xl border-4 border-white" />
                        </div>

                        <div className="w-full grid grid-cols-2 gap-3">
                            <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 text-center">
                                <p className="text-xs text-orange-400 font-bold uppercase mb-1">Đã sở hữu</p>
                                <p className="text-2xl font-black text-orange-600">{items.filter(i => i.is_owned).length}</p>
                            </div>
                            <div className="bg-sky-50 p-3 rounded-2xl border border-sky-100 text-center">
                                <p className="text-xs text-sky-400 font-bold uppercase mb-1">Đang mặc</p>
                                <p className="text-2xl font-black text-sky-600">{equippedItems.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (8/12) - Shop Items */}
                <div className="lg:col-span-8">

                    {/* Filter Tabs (Pills) */}
                    <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                        {categories.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveCategory(tab.id as any)}
                                className={cn(
                                    "px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 border-2",
                                    activeCategory === tab.id
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-105"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50"
                                )}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "relative bg-white rounded-[2rem] p-5 border-b-[6px] transition-all duration-300 flex flex-col items-center group",
                                    item.is_equipped
                                        ? "border-indigo-500 ring-2 ring-indigo-200 shadow-xl shadow-indigo-100"
                                        : item.is_owned
                                            ? "border-green-400/50 shadow-md"
                                            : "border-slate-200 hover:border-orange-300 hover:shadow-xl hover:-translate-y-2"
                                )}
                            >
                                {/* Status Badge */}
                                {item.is_equipped && (
                                    <div className="absolute top-4 right-4 bg-indigo-500 text-white p-1.5 rounded-full shadow-md z-10">
                                        <Check size={16} strokeWidth={4} />
                                    </div>
                                )}

                                {/* Image Container */}
                                <div className="w-full aspect-square rounded-3xl bg-slate-50 mb-4 flex items-center justify-center p-4 relative overflow-hidden border-2 border-slate-100 group-hover:bg-white transition-colors">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = "https://cdn-icons-png.flaticon.com/512/679/679821.png"; // Fallback box icon
                                            }}
                                        />
                                    ) : (
                                        <div className="text-6xl animate-bounce">🎁</div>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-700 mb-2 text-center line-clamp-1 w-full" title={item.name}>
                                    {item.name}
                                </h3>

                                <div className="mt-auto w-full pt-2">
                                    {item.is_owned ? (
                                        item.is_equipped ? (
                                            <button
                                                disabled
                                                className="w-full py-3 rounded-2xl bg-indigo-100 text-indigo-600 font-extrabold cursor-default border-2 border-indigo-200"
                                            >
                                                Đang Mặc ✨
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEquipItem(item)}
                                                className="w-full py-3 rounded-2xl bg-white text-green-600 font-bold hover:bg-green-50 transition border-2 border-green-200 hover:border-green-400"
                                            >
                                                Mặc Thử 👕
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => handleBuyItem(item)}
                                            className="w-full py-3 rounded-2xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-200 hover:bg-orange-400 hover:shadow-orange-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <div className="bg-white/20 p-1 rounded-lg">
                                                <ShoppingCart size={18} />
                                            </div>
                                            <span>{item.price}</span>
                                            <span className="text-xs">GEM</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredItems.length === 0 && (
                            <div className="col-span-full py-20 text-center text-slate-400">
                                <p className="text-6xl mb-4">🏜️</p>
                                <p className="font-medium">Chưa có vật phẩm nào ở đây cả!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
