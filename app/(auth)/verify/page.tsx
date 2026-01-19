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

    // Move to profile step or login if existing user
    const handleOTPComplete = async (value: string) => {
        if (value.length !== 6) return;

        setLoading(true);
        setError(false);

        try {
            // Try verifying without name/role first
            const response = await api.verifyOTP(phone, value);

            if (response.token && !response.isNew) {
                // Existing user - Login directly
                setToken(response.token);
                setUser(response.user);
                showToast("Welcome back!", "success");

                const redirectPath = getRedirectPath(response.user);
                router.push(redirectPath);
            } else {
                // New user - move to profile step
                setStep("profile");
            }
        } catch (err) {
            const apiError = err as APIError;
            const errorMsg = apiError.error || "Verification failed";

            // If it's a new user, we expect an error or isNew flag
            // Allow moving to profile step if the error is about missing info
            if (errorMsg.toLowerCase().includes("name") ||
                errorMsg.toLowerCase().includes("role") ||
                errorMsg.toLowerCase().includes("not found") ||
                errorMsg.toLowerCase().includes("required")) {
                setStep("profile");
            } else {
                showToast(errorMsg, "error");
                setError(true);
            }
        } finally {
            setLoading(false);
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
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[var(--background)]">
            <div className="max-w-[420px] w-full animate-fade-in">
                {/* Brand / Title */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-3xl bg-[var(--primary)] flex items-center justify-center mb-4 sm:mb-6 shadow-xl shadow-navy-900/20 rotate-3">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {step === "otp" ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                )}
                            </svg>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl sm:text-2xl">🇮🇳</span>
                            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[var(--secondary)] uppercase">India's Premium Stays</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-[var(--primary)] tracking-tight">
                            {step === "otp" ? "Verify Code" : "Finish Setup"}
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-[var(--foreground-muted)] font-medium px-4">
                        {step === "otp" ? (
                            <>Security code sent to <span className="text-[var(--primary)] font-bold">{maskedPhone}</span></>
                        ) : (
                            "One last step to personalize your experience"
                        )}
                    </p>
                </div>

                {/* Main Card */}
                <div className="glass-card p-6 sm:p-10 space-y-6 sm:space-y-8 shadow-2xl">
                    {/* Back Button - Minimal */}
                    <button
                        onClick={() => step === "profile" ? setStep("otp") : router.push("/login")}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Change {step === "otp" ? "Phone" : "Step"}</span>
                    </button>

                    {/* OTP Step */}
                    {step === "otp" && (
                        <div className="space-y-8 animate-fade-in">
                            <OTPInput
                                value={otp}
                                onChange={(val) => { setOtp(val); setError(false); }}
                                onComplete={handleOTPComplete}
                                error={error}
                                disabled={loading}
                            />

                            <div className="text-center">
                                {canResend ? (
                                    <button onClick={handleResendOTP} className="text-sm font-bold text-[var(--secondary)] hover:text-[var(--primary)] transition-colors underline underline-offset-4 decoration-2">
                                        Resend New Code
                                    </button>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--secondary-muted)] text-[var(--secondary)] text-xs font-bold">
                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Resend in {resendTimer}s
                                    </div>
                                )}
                            </div>

                            <Button onClick={() => handleOTPComplete(otp)} disabled={otp.length !== 6} loading={loading}>
                                <span className="flex items-center justify-center gap-2">
                                    Verify & Continue
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </Button>
                        </div>
                    )}

                    {/* Profile Step */}
                    {step === "profile" && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Role Selection - Modern Radio Blocks */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground-muted)] px-1">Choose Account Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setRole("owner"); setInviteCode(""); setErrors(p => ({ ...p, inviteCode: undefined })); }}
                                        disabled={loading}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group ${role === "owner"
                                            ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg shadow-navy-900/20"
                                            : "border-[var(--border)] bg-transparent text-[var(--foreground-muted)] hover:border-[var(--primary-400)]"
                                            }`}
                                    >
                                        <svg className={`w-6 h-6 ${role === "owner" ? "text-[var(--secondary)]" : "group-hover:text-[var(--primary)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span className="text-sm font-bold">Owner</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole("agent")}
                                        disabled={loading}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group ${role === "agent"
                                            ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg shadow-navy-900/20"
                                            : "border-[var(--border)] bg-transparent text-[var(--foreground-muted)] hover:border-[var(--primary-400)]"
                                            }`}
                                    >
                                        <svg className={`w-6 h-6 ${role === "agent" ? "text-[var(--secondary)]" : "group-hover:text-[var(--primary)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="text-sm font-bold">Agent</span>
                                    </button>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground-muted)] px-1">Personal Details</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                                    placeholder="Enter your full name"
                                    disabled={loading}
                                    autoFocus
                                    className={`w-full glass-input !py-4 px-5 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] font-medium ${errors.name ? "error" : ""}`}
                                />
                                {errors.name && <p className="form-error px-1 text-[10px] font-bold uppercase tracking-tight">{errors.name}</p>}
                            </div>

                            {/* Invite Code for agents */}
                            {role === "agent" && (
                                <div className="space-y-2 animate-slide-up">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground-muted)] px-1">Invite Credentials</label>
                                    <input
                                        type="text"
                                        value={inviteCode}
                                        onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setErrors(p => ({ ...p, inviteCode: undefined })); }}
                                        placeholder="ENTER INVITE CODE"
                                        disabled={loading}
                                        className={`w-full glass-input !py-4 px-5 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] font-black tracking-widest uppercase ${errors.inviteCode ? "error" : ""}`}
                                    />
                                    {errors.inviteCode && <p className="form-error px-1 text-[10px] font-bold uppercase tracking-tight">{errors.inviteCode}</p>}
                                </div>
                            )}

                            <Button onClick={handleSubmit} loading={loading}>
                                <span className="flex items-center justify-center gap-2">
                                    Complete Creation
                                    <svg className="w-5 h-5 text-[var(--secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                            </Button>

                            {/* Description Block */}
                            <div className="p-4 rounded-2xl bg-[var(--secondary-muted)]/30 border border-[var(--border)]">
                                <p className="text-[11px] leading-relaxed text-[var(--foreground-muted)] font-medium">
                                    {role === "owner"
                                        ? <><strong className="text-[var(--primary)] uppercase font-black tracking-tighter mr-1">Owner Access:</strong> List unlimited villas, manage pricing, and invite sub-agents to your portfolio.</>
                                        : <><strong className="text-[var(--primary)] uppercase font-black tracking-tighter mr-1">Agent Access:</strong> Search thousands of verified properties and book instantly for your clients.</>
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <p className="text-xs font-medium text-[var(--foreground-muted)]">
                        {step === "otp" ? (
                            <>Experiencing issues? <Link href="/login" className="text-[var(--primary)] font-bold decoration-[var(--secondary)] decoration-2 underline underline-offset-4">Sign in differently</Link></>
                        ) : (
                            <>Securing your data with <span className="text-[var(--primary)] font-bold">Bank-Grade Encryption</span></>
                        )}
                    </p>
                </div>
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
