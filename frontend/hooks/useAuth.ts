import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth";

export function useAuth(requireAuth = true) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hasToken = authService.isAuthenticated();
        setIsAuthenticated(hasToken);
        setLoading(false);

        if (requireAuth && !hasToken) {
            router.push("/login");
        }

        // We remove the auto-redirect to dashboard here because it causes issues for global components
        // that use useAuth(false) just to check status (like ChatWidget).
        // The redirection logic should be handled by specific pages (like Login/Register pages)
        // or a dedicated HOC/Layout wrapper, not this hook when requireAuth is false.

    }, [router, pathname, requireAuth]);

    return { isAuthenticated, loading };
}
