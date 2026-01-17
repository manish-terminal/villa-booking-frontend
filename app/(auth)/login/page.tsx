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
        <div className="glass-card p-6 sm:p-8">
            {/* Logo & Header */}
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
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
                    VillaBook
                </h1>
                <p className="text-[var(--foreground-muted)]">
                    {mode === "otp" ? "Welcome back" : "Login to your account"}
                </p>
            </div>

            {/* Login Form */}
            <div className="space-y-5">
                {/* Phone Input */}
                <div>
                    <label className="form-label">Phone Number</label>
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
                    <div className="animate-slide-up">
                        <PasswordInput
                            label="Password"
                            value={password}
                            onChange={(value) => {
                                setPassword(value);
                                if (errors.password)
                                    setErrors((prev) => ({ ...prev, password: undefined }));
                            }}
                            error={errors.password}
                            disabled={loading}
                            placeholder="Enter your password"
                        />
                        <div className="mt-2 text-right">
                            <button
                                type="button"
                                className="link-muted text-sm hover:text-[var(--primary-500)]"
                                onClick={() => showToast("Reset password feature coming soon", "info")}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>
                )}

                {/* Remember Phone */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={rememberPhone}
                            onChange={(e) => setRememberPhoneChecked(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-5 h-5 rounded border-2 border-[var(--input-border)] peer-checked:border-[var(--primary-500)] peer-checked:bg-[var(--primary-500)] transition-all">
                            <svg
                                className="w-full h-full text-white scale-0 peer-checked:scale-100 transition-transform"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>
                    <span className="text-sm text-[var(--foreground-muted)] group-hover:text-[var(--foreground)] transition-colors">
                        Remember my phone number
                    </span>
                </label>

                {/* Submit Button */}
                <Button
                    onClick={mode === "otp" ? handleSendOTP : handlePasswordLogin}
                    loading={loading}
                >
                    {mode === "otp" ? "Send OTP" : "Login"}
                </Button>

                {/* Mode Toggle */}
                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => switchMode(mode === "otp" ? "password" : "otp")}
                        className="link text-sm"
                    >
                        {mode === "otp"
                            ? "Already have password? Login with password"
                            : "Login with OTP instead"}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--glass-border)] text-center">
                <p className="text-xs text-[var(--foreground-muted)]">
                    By continuing, you agree to our{" "}
                    <a href="#" className="link-muted hover:text-[var(--primary-500)]">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="link-muted hover:text-[var(--primary-500)]">
                        Privacy Policy
                    </a>
                </p>
            </div>
        </div>
    );
}
