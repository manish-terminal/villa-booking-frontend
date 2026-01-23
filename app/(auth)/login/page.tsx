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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#fafaf9] relative overflow-hidden">
            {/* Decors */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-navy-900/10 blur-[120px] rounded-full"></div>

            <div className="max-w-[420px] w-full relative z-10 animate-fade-in stagger-children">
                {/* Brand / Title */}
                <div className="text-center mb-10">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-[2rem] bg-[#0a192f] flex items-center justify-center mb-6 shadow-2xl transition-all hover:scale-110">
                            <svg className="w-8 h-8 text-[#0f766e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🇮🇳</span>
                            <span className="text-[10px] font-black tracking-[0.25em] text-[#0f766e] uppercase">Premiere Luxury Escapes</span>
                        </div>
                        <h1 className="text-4xl font-black text-[#0a192f] tracking-tighter">
                            {showPasswordOption ? "Welcome Back" : "VillaBook"}
                        </h1>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
                    {!showPasswordOption ? (
                        <div className="space-y-6 animate-slide-up">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b7280]">Phone Number</label>
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
                                <p className="text-[10px] text-slate-400 font-medium px-1 text-center font-bold font-bold">We&apos;ll send you an OTP for secure verification.</p>
                            </div>

                            <Button
                                onClick={handleContinue}
                                loading={loading}
                                className="h-14 !rounded-2xl bg-[#0a192f] text-white font-black text-xs uppercase tracking-[0.25em] shadow-xl hover:shadow-2xl transition-all"
                            >
                                Login to Dashboard
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-[#f0fdfa]/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-full bg-[#0a192f] flex items-center justify-center text-white text-[10px] font-black">
                                    {phone.slice(-4)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-[#0f766e] uppercase tracking-widest leading-none mb-1">+91 {phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</p>
                                    <button
                                        onClick={handleBack}
                                        className="text-[10px] font-bold text-[#6b7280] hover:text-[#0a192f] transition-colors underline"
                                    >
                                        Change Number
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b7280]">Account Password</label>
                                </div>
                                <PasswordInput
                                    value={password}
                                    onChange={(value) => {
                                        setPassword(value);
                                        if (passwordError) setPasswordError(undefined);
                                    }}
                                    error={passwordError}
                                    disabled={loading}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={handlePasswordLogin}
                                    loading={loading}
                                    className="h-14 !rounded-2xl bg-[#0a192f] text-white font-black text-xs uppercase tracking-[0.25em] shadow-xl hover:shadow-2xl transition-all"
                                >
                                    Access Account
                                </Button>

                                <div className="relative pt-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-100"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[8px] uppercase tracking-widest font-black">
                                        <span className="bg-white/50 backdrop-blur-lg px-3 text-slate-300">Or Access via Secure</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSendOTPInstead}
                                    disabled={loading}
                                    className="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#0f766e] hover:text-[#0a192f] transition-colors py-2"
                                >
                                    Login with OTP Instead
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 saturate-0 opacity-40">
                        <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em]">End-to-End Secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
