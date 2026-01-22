import React from 'react';

// Define the structure of an avatar item
export interface AvatarItem {
    id: number;
    category: 'body' | 'hat' | 'shirt' | 'glasses' | 'background';
    image_url: string;
    layer_order: number;
}

interface UserAvatarProps {
    items?: AvatarItem[]; // User's equipped items
    size?: number | string; // Optional size prop
    className?: string; // Additional classes
}

// Default/Mock images to use if user has nothing equipped or image fails
const DEFAULT_ASSETS = {
    background: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80", // Simple gradient/abstract
    body: "https://cdn-icons-png.flaticon.com/512/4825/4825038.png", // Simple cartoon body placeholder
    shirt: "https://cdn-icons-png.flaticon.com/512/9381/9381639.png", // Basic t-shirt
    hat: "https://cdn-icons-png.flaticon.com/512/2665/2665977.png", // Baseball cap
    glasses: "" // No default glasses usually
};

const UserAvatar: React.FC<UserAvatarProps> = ({ items = [], size = 300, className = "" }) => {

    // 1. Prepare Layers
    // We start with defaults for essential layers (Background, Body) if they are missing from props.
    // However, the rule is: If 'items' provided, use them. If a category is missing, we might show default OR nothing.
    // User request: "dữ liệu mẫu chỉ hiển thị khi tôi chưa upload thì sẽ là giá trị mặc định đó" -> Implies defaults are fallbacks.

    const equippedItems = [...items];

    // Ensure we have a body
    if (!equippedItems.some(i => i.category === 'body')) {
        equippedItems.push({
            id: -1,
            category: 'body',
            layer_order: 1,
            image_url: DEFAULT_ASSETS.body
        });
    }

    // Ensure we have a background (optional, but good for visuals)
    if (!equippedItems.some(i => i.category === 'background')) {
        equippedItems.push({
            id: -2,
            category: 'background',
            layer_order: 0,
            image_url: DEFAULT_ASSETS.background
        });
    }

    // Sort by layer order: Background (0) -> Body (1) -> Clothes (2+)
    equippedItems.sort((a, b) => a.layer_order - b.layer_order);

    return (
        <div
            className={`relative overflow-hidden rounded-xl border-2 border-gray-100 bg-white shadow-sm ${className}`}
            style={{ width: size, height: size }}
        >
            {equippedItems.map((item) => (
                <img
                    key={`${item.category}-${item.id}`}
                    src={item.image_url}
                    alt={item.category}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{
                        zIndex: item.layer_order,
                        // Background needs cover, others usually contain/fit
                        objectFit: item.category === 'background' ? 'cover' : 'contain'
                    }}
                    onError={(e) => {
                        // Fallback if specific item image fails? 
                        // Maybe just hide it or use default if it matches category
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                    }}
                />
            ))}
        </div>
    );
};

export default UserAvatar;
