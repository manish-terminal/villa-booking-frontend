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

type LoginMode = "otp" | "password";

export default function LoginPage() {
    const router = useRouter();
    const { showToast } = useToast();

    const [mode, setMode] = useState<LoginMode>("otp");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [rememberPhone, setRememberPhoneChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

    // Load remembered phone
    useEffect(() => {
        const remembered = getRememberedPhone();
        if (remembered) {
            setPhone(remembered);
            setRememberPhoneChecked(true);
        }
    }, []);

    const validatePhone = (): boolean => {
        if (!phone) {
            setErrors({ phone: "Phone number is required" });
            return false;
        }
        if (phone.length !== 10) {
            setErrors({ phone: "Please enter a valid 10-digit phone number" });
            return false;
        }
        setErrors({});
        return true;
    };

    const validatePassword = (): boolean => {
        if (!password) {
            setErrors((prev) => ({ ...prev, password: "Password is required" }));
            return false;
        }
        if (password.length < 6) {
            setErrors((prev) => ({
                ...prev,
                password: "Password must be at least 6 characters",
            }));
            return false;
        }
        return true;
    };

    const handleSendOTP = async () => {
        if (!validatePhone()) return;

        setLoading(true);
        try {
            const response = await api.sendOTP(phone);

            // Remember phone if checked
            if (rememberPhone) {
                setRememberedPhone(phone);
            }

            showToast(response.message || "OTP sent successfully!", "success");

            // Navigate to verify page with phone in query
            router.push(`/verify?phone=${phone}`);
        } catch (error) {
            const apiError = error as APIError;
            showToast(apiError.error || "Failed to send OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async () => {
        const isPhoneValid = validatePhone();
        const isPasswordValid = validatePassword();

        if (!isPhoneValid || !isPasswordValid) return;

        setLoading(true);
        try {
            const response = await api.login(phone, password);

            // Remember phone if checked
            if (rememberPhone) {
                setRememberedPhone(phone);
            }

            // Store auth data
            setToken(response.token);
            setUser(response.user);

            showToast("Login successful!", "success");

            // Redirect based on role
            const redirectPath = getRedirectPath(response.user);
            router.push(redirectPath);
        } catch (error) {
            const apiError = error as APIError;
            showToast(apiError.error || "Login failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: LoginMode) => {
        setMode(newMode);
        setErrors({});
        setPassword("");
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
                            Welcome Back
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-[var(--foreground-muted)] font-medium px-4">Please enter your details to sign in.</p>
                </div>

                {/* Main Card */}
                <div className="glass-card p-6 sm:p-10 space-y-6 sm:space-y-8 shadow-2xl">
                    {/* Login Form */}
                    <div className="space-y-5 sm:space-y-6">
                        {/* Phone Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--foreground-muted)]">Phone Number</label>
                            </div>
                            <PhoneInput
                                value={phone}
                                onChange={(value) => {
                                    setPhone(value);
                                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                                }}
                                error={errors.phone}
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        {/* Password Input - Only in password mode */}
                        {mode === "password" && (
                            <div className="space-y-2 animate-slide-up">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--foreground-muted)]">Password</label>
                                    <button
                                        type="button"
                                        className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary)] hover:opacity-70 transition-opacity"
                                        onClick={() => showToast("Reset feature coming soon", "info")}
                                    >
                                        Forgot?
                                    </button>
                                </div>
                                <PasswordInput
                                    value={password}
                                    onChange={(value) => {
                                        setPassword(value);
                                        if (errors.password)
                                            setErrors((prev) => ({ ...prev, password: undefined }));
                                    }}
                                    error={errors.password}
                                    disabled={loading}
                                    placeholder="Enter your security phrase"
                                />
                            </div>
                        )}

                        <div className="pt-4 space-y-5">
                            <Button
                                onClick={mode === "otp" ? handleSendOTP : handlePasswordLogin}
                                loading={loading}
                                className="shadow-lg shadow-[var(--primary)]/5 uppercase text-xs tracking-[0.2em]"
                            >
                                {mode === "otp" ? "Send Access Code" : "Sign In"}
                            </Button>

                            <button
                                type="button"
                                onClick={() => switchMode(mode === "otp" ? "password" : "otp")}
                                className="w-full text-center text-xs font-black uppercase tracking-widest text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors py-2"
                            >
                                {mode === "otp"
                                    ? "Login with Password instead"
                                    : "Login with OTP instead"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trust Footer */}
                <div className="mt-12 text-center space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground-muted)] opacity-50">
   
                    </p>
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
