"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import ExpirationModal from "./ExpirationModal";

export default function SessionManager() {
    const isHandling = useRef(false);
    const [isExpired, setIsExpired] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleSessionExpired = () => {
            if (isHandling.current) return;
            if (pathname === '/login') return; // Ignore if already on login page
            isHandling.current = true;

            // 1. Remove token
            Cookies.remove("token", { path: '/' });

            // 2. Show modal
            setIsExpired(true);
        };

        window.addEventListener("auth:session-expired", handleSessionExpired);

        return () => {
            window.removeEventListener("auth:session-expired", handleSessionExpired);
        };
    }, []);

    const handleLogin = () => {
        setIsExpired(false);
        isHandling.current = false;
        router.push("/login");
    };

    return (
        <ExpirationModal
            isOpen={isExpired}
            onLogin={handleLogin}
        />
    );
}
