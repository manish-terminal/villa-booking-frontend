"use client";

import { useState } from "react";

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
    autoComplete?: string;
}

export default function PasswordInput({
    value,
    onChange,
    error,
    disabled = false,
    placeholder = "Enter password",
    label,
    autoComplete = "current-password",
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            {label && <label className="form-label">{label}</label>}

            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`w-full glass-input !py-3.5 px-5 pr-12 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] font-medium ${error ? "error" : ""
                        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    aria-label={label || "Password"}
                />

                {/* Toggle Button */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={disabled}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        // Eye Off Icon
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
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                        </svg>
                    ) : (
                        // Eye Icon
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                    )}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <p className="form-error animate-fade-in">
                    <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
