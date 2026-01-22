import { create } from 'zustand';
import axiosClient from "@/lib/axiosClient";

interface StudentState {
    fullName: string;
    avatarUrl: string;
    gems: number;
    stars: number;
    profile: {
        referral_code?: string;
        // other fields if needed
    } | null;

    fetchProfile: () => Promise<void>;
    addRewards: (gems: number, stars: number) => void;
    setGems: (gems: number) => void;
    setStars: (stars: number) => void;
    setUser: (name: string, gems: number, stars: number) => void;
}

export const useStudentStore = create<StudentState>((set) => ({
    fullName: "Bé",
    avatarUrl: "",
    gems: 0,
    stars: 0,
    profile: null,

    fetchProfile: async () => {
        try {
            console.log("Fetching profile...");
            const res = await axiosClient.get("/users/profile");
            const p = res.data;
            set({
                fullName: p.full_name,
                avatarUrl: p.student_profile.avatar_url,
                gems: p.student_profile.total_gems,
                stars: p.student_profile.total_stars,
                profile: p
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    },

    addRewards: (gems, stars) => set((state) => ({
        gems: state.gems + gems,
        stars: state.stars + stars
    })),

    setGems: (gems) => set({ gems }),
    setStars: (stars) => set({ stars }),

    setUser: (name, gems, stars) => set({ fullName: name, gems, stars })
}));
