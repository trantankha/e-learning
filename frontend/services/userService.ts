import axiosClient from "@/lib/axiosClient";

export interface UserProfileResponse {
    id: number;
    email: string;
    full_name: string;
    student_profile: {
        total_gems: number;
        total_stars: number;
        date_of_birth: string | null;
        avatar_url: string | null;
    };
}

export interface UserProfileUpdate {
    full_name?: string;
    date_of_birth?: string; // ISO Date YYYY-MM-DD
    avatar_url?: string;
}

export interface PasswordChange {
    current_password: string;
    new_password: string;
    confirm_password: string; // Used for frontend validation
}

export const userService = {
    getProfile: async (): Promise<UserProfileResponse> => {
        const response = await axiosClient.get("/users/profile");
        return response.data;
    },

    updateProfile: async (data: UserProfileUpdate): Promise<UserProfileResponse> => {
        const response = await axiosClient.put("/users/profile", data);
        return response.data;
    },

    changePassword: async (data: Omit<PasswordChange, 'confirm_password'>): Promise<any> => {
        const response = await axiosClient.put("/users/profile/password", data);
        return response.data;
    }
};
