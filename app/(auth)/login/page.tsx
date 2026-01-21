"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "@/app/components/PhoneInput";
import PasswordInput from "@/app/components/PasswordInput";
import Button from "@/app/components/Button";
import { useToast } from "@/app/components/Toast";
import { api } from "@/app/lib/api";
import {
    getRememberedPhone,
    setRememberedPhone,
    setToken,
    setUser,
    getRedirectPath,
} from "@/app/lib/auth";
import { APIError } from "@/app/types/auth";

type UserStatus = {
    exists: boolean;
    hasPassword?: boolean;
    role?: "admin" | "owner" | "agent";
    status?: "pending" | "approved" | "rejected";
};

export default function LoginPage() {
    const router = useRouter();
    const { showToast } = useToast();

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [passwordError, setPasswordError] = useState<string | undefined>();

    // User check state
    const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
    const [showPasswordOption, setShowPasswordOption] = useState(false);

    // Load remembered phone
    useEffect(() => {
        const remembered = getRememberedPhone();
        if (remembered) {
            setPhone(remembered);
        }
    }, []);

    const validatePhone = (): boolean => {
        if (!phone) {
            setError("Phone number is required");
            return false;
        }
        if (phone.length !== 10) {
            setError("Please enter a valid 10-digit phone number");
            return false;
        }
        setError(undefined);
        return true;
    };

    // Step 1: Check if user exists
    const handleContinue = async () => {
        if (!validatePhone()) return;

        setLoading(true);
        try {
            // Check if user exists
            const status = await api.checkUser(phone);
            setUserStatus(status);

            if (!status.exists) {
                // New user - send OTP and go to registration
                await api.sendOTP(phone);
                setRememberedPhone(phone);
                showToast("OTP sent! Please complete registration.", "success");
                router.push(`/verify?phone=${phone}&new=true`);
            } else if (status.status === "pending") {
                // User awaiting approval
                showToast("Your account is pending approval. Please wait.", "info");
            } else if (status.status === "rejected") {
                // User rejected
                showToast("Your account has been rejected. Contact support.", "error");
            } else if (status.hasPassword) {
                // Existing user with password - show password option
                setShowPasswordOption(true);
            } else {
                // Existing user without password - send OTP directly
                await api.sendOTP(phone);
                setRememberedPhone(phone);
                showToast("OTP sent!", "success");
                router.push(`/verify?phone=${phone}`);
            }
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    // Login with password
    const handlePasswordLogin = async () => {
        if (!password) {
            setPasswordError("Password is required");
            return;
        }
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }
        setPasswordError(undefined);

        setLoading(true);
        try {
            const response = await api.login(phone, password);
            setRememberedPhone(phone);
            setToken(response.token);
            setUser(response.user);
            showToast("Welcome back!", "success");
            const redirectPath = getRedirectPath(response.user);
            router.push(redirectPath);
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Login failed", "error");
        } finally {
            setLoading(false);
        }
    };

    // Send OTP instead of password
    const handleSendOTPInstead = async () => {
        setLoading(true);
        try {
            await api.sendOTP(phone);
            setRememberedPhone(phone);
            showToast("OTP sent!", "success");
            router.push(`/verify?phone=${phone}`);
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Failed to send OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    // Go back to phone input
    const handleBack = () => {
        setShowPasswordOption(false);
        setUserStatus(null);
        setPassword("");
        setPasswordError(undefined);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[var(--background)]">
            <div className="max-w-[420px] w-full animate-fade-in">
                {/* Brand / Title */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-3xl bg-[var(--primary)] flex items-center justify-center mb-4 sm:mb-6 shadow-xl shadow-navy-900/20 rotate-3 transition-transform hover:rotate-0">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl sm:text-2xl">🇮🇳</span>
                            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[var(--secondary)] uppercase">India's Premium Stays</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-[var(--primary)] tracking-tight">
                            {showPasswordOption ? "Welcome Back" : "Sign In"}
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-[var(--foreground-muted)] font-medium px-4">
                        {showPasswordOption
                            ? `Signing in as +91 ${phone.slice(0, 5)}xxxxx`
                            : "Enter your phone number to continue"}
                    </p>
                </div>

                {/* Main Card */}
                <div className="glass-card p-6 sm:p-10 space-y-6 sm:space-y-8 shadow-2xl">
                    {!showPasswordOption ? (
                        /* Phone Input Screen */
                        <div className="space-y-5 sm:space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--foreground-muted)]">Phone Number</label>
                                </div>
                                <PhoneInput
                                    value={phone}
                                    onChange={(value) => {
                                        setPhone(value);
                                        if (error) setError(undefined);
                                    }}
                                    error={error}
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleContinue}
                                    loading={loading}
                                    className="shadow-lg shadow-[var(--primary)]/5 uppercase text-xs tracking-[0.2em]"
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Password / OTP Choice Screen */
                        <div className="space-y-5 sm:space-y-6 animate-fade-in">
                            {/* Back Button */}
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors group"
                            >
                                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Change Phone</span>
                            </button>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--foreground-muted)]">Password</label>
                                </div>
                                <PasswordInput
                                    value={password}
                                    onChange={(value) => {
                                        setPassword(value);
                                        if (passwordError) setPasswordError(undefined);
                                    }}
                                    error={passwordError}
                                    disabled={loading}
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="pt-2 space-y-4">
                                <Button
                                    onClick={handlePasswordLogin}
                                    loading={loading}
                                    className="shadow-lg shadow-[var(--primary)]/5 uppercase text-xs tracking-[0.2em]"
                                >
                                    Sign In
                                </Button>

                                <button
                                    type="button"
                                    onClick={handleSendOTPInstead}
                                    disabled={loading}
                                    className="w-full text-center text-xs font-black uppercase tracking-widest text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors py-2 disabled:opacity-50"
                                >
                                    Use OTP Instead
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Trust Footer */}
                <div className="mt-12 text-center space-y-4">
                    <div className="flex justify-center gap-6 saturate-0 opacity-30">
                        <div className="flex items-center gap-1.5 grayscale">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Verified Secure</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
