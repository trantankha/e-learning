import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:8000/api/v1/auth";

export const authService = {
    // Login
    async login(email: string, password: string) {
        // OAuth2PasswordRequestForm needs form-data format
        const formData = new FormData();
        formData.append("username", email);
        formData.append("password", password);

        const response = await axios.post(`${API_URL}/login`, formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        if (response.data.access_token) {
            // 1/24 days = 1 hour. Sync with backend expiration.
            Cookies.set("token", response.data.access_token, { expires: 1 / 24, path: '/' });
        }
        return response.data;
    },

    // Register
    async register(email: string, password: string, fullName: string, refCode?: string) {
        const response = await axios.post(`${API_URL}/register`, {
            email,
            password,
            full_name: fullName,
            ref_code: refCode
        });
        return response.data;
    },

    // Logout
    logout() {
        Cookies.remove("token", { path: '/' });
        window.location.href = "/login";
    },

    // Get Token
    getToken() {
        return Cookies.get("token");
    },

    // Check if logged in
    isAuthenticated() {
        return !!Cookies.get("token");
    }
};
