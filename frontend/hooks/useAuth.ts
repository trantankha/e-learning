import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";

export function useAuth(requireAuth = true) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hasToken = authService.isAuthenticated();
        setIsAuthenticated(hasToken);
        setLoading(false);

        if (requireAuth && !hasToken) {
            router.push("/login");
        }

        // If we are on auth pages (login/register) and HAVE token, redirect to dashboard
        if (!requireAuth && hasToken) {
            router.push("/dashboard");
        }

    }, [router, requireAuth]);

    return { isAuthenticated, loading };
}
