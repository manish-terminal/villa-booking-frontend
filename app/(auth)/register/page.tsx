"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/app/components/Button";
import { useToast } from "@/app/components/Toast";
import { api } from "@/app/lib/api";
import { setToken, setUser, getRedirectPath } from "@/app/lib/auth";
import { APIError } from "@/app/types/auth";

type UserRole = "owner" | "agent";

function RegisterPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const phone = searchParams.get("phone") || "";
    const otpCode = searchParams.get("code") || "";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<UserRole>("owner");
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [validatingCode, setValidatingCode] = useState(false);
    const [inviteCodeValid, setInviteCodeValid] = useState<boolean | null>(null);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        inviteCode?: string;
    }>({});

    // Redirect if no phone or code
    useEffect(() => {
        if (!phone || !otpCode) {
            router.replace("/login");
        }
    }, [phone, otpCode, router]);

    // Validate invite code when it changes (debounced)
    useEffect(() => {
        if (role !== "agent" || !inviteCode || inviteCode.length < 4) {
            setInviteCodeValid(null);
            return;
        }

        const timer = setTimeout(async () => {
            setValidatingCode(true);
            try {
                const response = await api.validateInviteCode(inviteCode);
                setInviteCodeValid(response.valid);
                if (!response.valid) {
                    setErrors((prev) => ({
                        ...prev,
                        inviteCode: "Invalid invite code",
                    }));
                } else {
                    setErrors((prev) => ({ ...prev, inviteCode: undefined }));
                }
            } catch {
                setInviteCodeValid(false);
                setErrors((prev) => ({
                    ...prev,
                    inviteCode: "Could not validate code",
                }));
            } finally {
                setValidatingCode(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [inviteCode, role]);

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        } else if (name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (role === "agent") {
            if (!inviteCode) {
                newErrors.inviteCode = "Invite code is required for agents";
            } else if (inviteCodeValid === false) {
                newErrors.inviteCode = "Invalid invite code";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Complete registration by verifying OTP with user details
            const response = await api.verifyOTP(phone, otpCode, name.trim(), role);

            if (response.token) {
                setToken(response.token);
                setUser(response.user);
                showToast("Registration successful!", "success");

                const redirectPath = getRedirectPath(response.user);
                router.push(redirectPath);
            } else {
                // Pending approval
                showToast(
                    response.message || "Registration submitted for approval",
                    "info"
                );
                router.push("/pending-approval");
            }
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Registration failed", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!phone || !otpCode) {
        return null;
    }

    return (
        <div className="glass-card p-6 sm:p-8">
            {/* Back Button */}
            <Link
                href={`/verify?phone=${phone}`}
                className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors mb-6"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                <span>Back</span>
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
                    Complete Your Profile
                </h1>
                <p className="text-[var(--foreground-muted)]">
                    Just a few more details to get started
                </p>
            </div>

            {/* Registration Form */}
            <div className="space-y-5">
                {/* Name Input */}
                <div>
                    <label className="form-label">
                        Full Name <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name)
                                setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="Enter your full name"
                        disabled={loading}
                        className={`w-full glass-input px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] ${errors.name ? "error" : ""
                            }`}
                    />
                    {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                {/* Email Input */}
                <div>
                    <label className="form-label">
                        Email <span className="text-[var(--foreground-muted)]">(optional)</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email)
                                setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="Enter your email"
                        disabled={loading}
                        className={`w-full glass-input px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] ${errors.email ? "error" : ""
                            }`}
                    />
                    {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                {/* Role Selection */}
                <div>
                    <label className="form-label">I am a</label>
                    <div className="role-tabs">
                        <button
                            type="button"
                            onClick={() => {
                                setRole("owner");
                                setInviteCode("");
                                setInviteCodeValid(null);
                                setErrors((prev) => ({ ...prev, inviteCode: undefined }));
                            }}
                            disabled={loading}
                            className={`role-tab ${role === "owner" ? "active" : ""}`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
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
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                Agent
                            </span>
                        </button>
                    </div>
                </div>

                {/* Invite Code - Only for agents */}
                {role === "agent" && (
                    <div className="animate-slide-up">
                        <label className="form-label">
                            Invite Code <span className="text-[var(--error)]">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => {
                                    setInviteCode(e.target.value.toUpperCase());
                                    setInviteCodeValid(null);
                                    if (errors.inviteCode)
                                        setErrors((prev) => ({ ...prev, inviteCode: undefined }));
                                }}
                                placeholder="Enter invite code from owner"
                                disabled={loading}
                                className={`w-full glass-input px-4 py-3 pr-10 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] uppercase ${errors.inviteCode
                                        ? "error"
                                        : inviteCodeValid === true
                                            ? "border-[var(--success)]"
                                            : ""
                                    }`}
                            />
                            {/* Validation Status Icon */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {validatingCode && (
                                    <div className="spinner spinner-dark w-4 h-4" />
                                )}
                                {!validatingCode && inviteCodeValid === true && (
                                    <svg
                                        className="w-5 h-5 text-[var(--success)]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                                {!validatingCode && inviteCodeValid === false && (
                                    <svg
                                        className="w-5 h-5 text-[var(--error)]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                )}
                            </div>
                        </div>
                        {errors.inviteCode && (
                            <p className="form-error">{errors.inviteCode}</p>
                        )}
                        <p className="form-hint">
                            Ask your property owner for an invite code
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={role === "agent" && !inviteCodeValid}
                >
                    Continue
                </Button>
            </div>

            {/* Role Description */}
            <div className="mt-6 p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)]">
                <p className="text-sm text-[var(--foreground-muted)]">
                    {role === "owner" ? (
                        <>
                            <strong className="text-[var(--foreground)]">Owners</strong> can list
                            properties, manage bookings, and generate invite codes for agents.
                        </>
                    ) : (
                        <>
                            <strong className="text-[var(--foreground)]">Agents</strong> can book
                            properties on behalf of clients using owner-provided invite codes.
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="glass-card p-6 sm:p-8 animate-pulse">
                <div className="h-8 bg-[var(--input-bg)] rounded w-16 mb-6"></div>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--input-bg)]"></div>
                    <div className="h-8 bg-[var(--input-bg)] rounded w-56 mx-auto mb-2"></div>
                    <div className="h-4 bg-[var(--input-bg)] rounded w-40 mx-auto"></div>
                </div>
            </div>
        }>
            <RegisterPageContent />
        </Suspense>
    );
}
