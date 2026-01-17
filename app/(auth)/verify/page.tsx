"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import OTPInput from "@/app/components/OTPInput";
import Button from "@/app/components/Button";
import { useToast } from "@/app/components/Toast";
import { api } from "@/app/lib/api";
import { setToken, setUser, getRedirectPath } from "@/app/lib/auth";
import { APIError } from "@/app/types/auth";

type VerifyStep = "otp" | "profile";

function VerifyPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const phone = searchParams.get("phone") || "";
    const maskedPhone = phone ? `+91 ${phone.slice(0, 5)}xxxxx` : "";

    // OTP state
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    // Profile state
    const [step, setStep] = useState<VerifyStep>("otp");
    const [name, setName] = useState("");
    const [role, setRole] = useState<"owner" | "agent">("owner");
    const [inviteCode, setInviteCode] = useState("");
    const [errors, setErrors] = useState<{ name?: string; inviteCode?: string }>({});

    // Redirect if no phone
    useEffect(() => {
        if (!phone) {
            router.replace("/login");
        }
    }, [phone, router]);

    // Resend countdown timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    // Move to profile step (NO API call here)
    const handleOTPComplete = (value: string) => {
        if (value.length === 6) {
            setStep("profile");
        }
    };

    // Validate profile form
    const validateProfile = (): boolean => {
        const newErrors: typeof errors = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        } else if (name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (role === "agent" && !inviteCode) {
            newErrors.inviteCode = "Invite code is required for agents";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Single API call with all data
    const handleSubmit = async () => {
        if (!validateProfile()) return;

        setLoading(true);
        setError(false);

        try {
            // Single API call with phone, otp, name, and role
            const response = await api.verifyOTP(phone, otp, name.trim(), role);

            if (response.token) {
                setToken(response.token);
                setUser(response.user);
                showToast(response.isNew ? "Welcome to VillaBook!" : "Welcome back!", "success");

                // All users are auto-approved, redirect to dashboard
                const redirectPath = getRedirectPath(response.user);
                router.push(redirectPath);
            } else {
                showToast("Authentication failed. Please try again.", "error");
            }
        } catch (err) {
            const apiError = err as APIError;
            const errorMsg = apiError.error || "Verification failed";

            // If OTP error, go back to OTP step
            if (errorMsg.toLowerCase().includes("otp") ||
                errorMsg.toLowerCase().includes("expired") ||
                errorMsg.toLowerCase().includes("invalid code")) {
                setStep("otp");
                setOtp("");
                showToast("OTP expired or invalid. Please request a new one.", "error");
            } else {
                showToast(errorMsg, "error");
            }
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        try {
            await api.sendOTP(phone);
            showToast("OTP resent successfully!", "success");
            setResendTimer(30);
            setCanResend(false);
            setOtp("");
            setError(false);
            setStep("otp");
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Failed to resend OTP", "error");
        }
    };

    if (!phone) return null;

    return (
        <div className="glass-card p-6 sm:p-8">
            {/* Back Button */}
            <button
                onClick={() => step === "profile" ? setStep("otp") : router.push("/login")}
                className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors mb-6"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {step === "otp" ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        )}
                    </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
                    {step === "otp" ? "Verify OTP" : "Complete Your Profile"}
                </h1>
                <p className="text-[var(--foreground-muted)]">
                    {step === "otp" ? `Code sent to ${maskedPhone}` : "Just a few details to get started"}
                </p>
            </div>

            {/* OTP Step */}
            {step === "otp" && (
                <div className="space-y-6 animate-fade-in">
                    <OTPInput
                        value={otp}
                        onChange={(val) => { setOtp(val); setError(false); }}
                        onComplete={handleOTPComplete}
                        error={error}
                        disabled={loading}
                    />

                    <div className="text-center">
                        {canResend ? (
                            <button onClick={handleResendOTP} className="link text-sm">Resend OTP</button>
                        ) : (
                            <p className="text-sm text-[var(--foreground-muted)]">
                                Resend in <span className="font-medium text-[var(--foreground)]">{resendTimer}s</span>
                            </p>
                        )}
                    </div>

                    <Button onClick={() => handleOTPComplete(otp)} disabled={otp.length !== 6}>
                        Continue
                    </Button>
                </div>
            )}

            {/* Profile Step */}
            {step === "profile" && (
                <div className="space-y-5 animate-fade-in">
                    {/* Name */}
                    <div>
                        <label className="form-label">Full Name <span className="text-[var(--error)]">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                            placeholder="Enter your full name"
                            disabled={loading}
                            autoFocus
                            className={`w-full glass-input px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] ${errors.name ? "error" : ""}`}
                        />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="form-label">I am a</label>
                        <div className="role-tabs">
                            <button
                                type="button"
                                onClick={() => { setRole("owner"); setInviteCode(""); setErrors(p => ({ ...p, inviteCode: undefined })); }}
                                disabled={loading}
                                className={`role-tab ${role === "owner" ? "active" : ""}`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Owner
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("agent")}
                                disabled={loading}
                                className={`role-tab ${role === "agent" ? "active" : ""}`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Agent
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Invite Code for agents */}
                    {role === "agent" && (
                        <div className="animate-slide-up">
                            <label className="form-label">Invite Code <span className="text-[var(--error)]">*</span></label>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setErrors(p => ({ ...p, inviteCode: undefined })); }}
                                placeholder="Enter invite code from owner"
                                disabled={loading}
                                className={`w-full glass-input px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] uppercase ${errors.inviteCode ? "error" : ""}`}
                            />
                            {errors.inviteCode && <p className="form-error">{errors.inviteCode}</p>}
                        </div>
                    )}

                    <Button onClick={handleSubmit} loading={loading}>
                        Create Account
                    </Button>

                    <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)]">
                        <p className="text-sm text-[var(--foreground-muted)]">
                            {role === "owner"
                                ? <><strong className="text-[var(--foreground)]">Owners</strong> can list properties and invite agents.</>
                                : <><strong className="text-[var(--foreground)]">Agents</strong> can book properties for clients.</>
                            }
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-[var(--glass-border)] text-center">
                <p className="text-xs text-[var(--foreground-muted)]">
                    {step === "otp"
                        ? <>Didn&apos;t receive the code? <Link href="/login" className="link-muted hover:text-[var(--primary-500)]">Try different number</Link></>
                        : <>By continuing, you agree to our <a href="#" className="link-muted hover:text-[var(--primary-500)]">Terms</a></>
                    }
                </p>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="glass-card p-8 animate-pulse"><div className="h-16 w-16 mx-auto rounded-2xl bg-[var(--input-bg)]" /></div>}>
            <VerifyPageContent />
        </Suspense>
    );
}
