"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, removeToken, removeUser } from "@/app/lib/auth";

export default function SessionManager() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Initial check
        const checkSession = () => {
            const isAuth = isAuthenticated();
            const isAuthPage = pathname.startsWith("/login") || 
                               pathname.startsWith("/register") || 
                               pathname.startsWith("/verify") ||
                               pathname === "/";

            if (!isAuth && !isAuthPage) {
                // Not authenticated and trying to access a protected page
                removeToken();
                removeUser();
                router.push("/login");
            }
        };

        checkSession();

        // Optional: Periodic check every minute to catch token expiration
        const interval = setInterval(checkSession, 60000);
        return () => clearInterval(interval);
    }, [pathname, router]);

    return null;
}
