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
        <div className="relative">
            <div
                className={`flex items-center bg-white border rounded-2xl transition-all duration-300 ${error ? "border-rose-500 ring-4 ring-rose-500/5" : "border-slate-200 focus-within:border-[#0a192f] focus-within:ring-4 focus-within:ring-[#0a192f]/5"
                    } ${disabled ? "opacity-50" : ""}`}
            >
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="flex-1 px-5 py-4 bg-transparent text-[#0a192f] placeholder:text-slate-300 focus:outline-none text-base font-bold"
                    aria-label={label || "Password"}
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={disabled}
                    className="p-4 text-slate-400 hover:text-[#0a192f] transition-colors"
                >
                    {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            </div>

            {error && (
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 mt-2 px-1 animate-fade-in">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
