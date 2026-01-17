import { User } from "@/app/types/auth";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const PHONE_KEY = "remembered_phone";

// Token Management
export function setToken(token: string): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, token);
    }
}

export function getToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
}

export function removeToken(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
    }
}

// User Management
export function setUser(user: User): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}

export function getUser(): User | null {
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem(USER_KEY);
        if (stored) {
            try {
                return JSON.parse(stored) as User;
            } catch {
                return null;
            }
        }
    }
    return null;
}

export function removeUser(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(USER_KEY);
    }
}

// Phone Number Remember
export function setRememberedPhone(phone: string): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(PHONE_KEY, phone);
    }
}

export function getRememberedPhone(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem(PHONE_KEY);
    }
    return null;
}

export function removeRememberedPhone(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(PHONE_KEY);
    }
}

// Auth Check - all users are auto-approved now
export function isAuthenticated(): boolean {
    const token = getToken();
    const user = getUser();
    return !!token && !!user;
}

// Get user role-based redirect path
export function getRedirectPath(user: User): string {
    switch (user.role) {
        case "admin":
            return "/admin/dashboard";
        case "owner":
            return "/owner/dashboard";
        case "agent":
            return "/agent/dashboard";
        default:
            return "/dashboard";
    }
}

// Logout - clear all auth data
export function logout(): void {
    removeToken();
    removeUser();
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}

// Parse JWT token (without verification - for display purposes only)
export function parseToken(token: string): {
    exp: number;
    phone: string;
    role: string;
} | null {
    try {
        const payload = token.split(".")[1];
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
    const parsed = parseToken(token);
    if (!parsed || !parsed.exp) return true;
    return Date.now() >= parsed.exp * 1000;
}
