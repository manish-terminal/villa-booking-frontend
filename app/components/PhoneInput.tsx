"use client";

import { useState, useRef, useEffect } from "react";

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    placeholder?: string;
}

interface CountryCode {
    code: string;
    name: string;
    flag: string;
    maxLength: number;
}

const countryCodes: CountryCode[] = [
    { code: "+91", name: "India", flag: "🇮🇳", maxLength: 10 },
];

export default function PhoneInput({
    value,
    onChange,
    error,
    disabled = false,
    autoFocus = false,
    placeholder = "Enter phone number",
}: PhoneInputProps) {
    const selectedCountry = countryCodes[0];
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, "");
        if (input.length <= selectedCountry.maxLength) {
            onChange(input);
        }
    };

    const formatPhoneDisplay = (phone: string) => {
        // Format for display (e.g., 98765 43210)
        if (phone.length > 5) {
            return `${phone.slice(0, 5)} ${phone.slice(5)}`;
        }
        return phone;
    };

    return (
        <div className="relative">
            <div
                className={`flex items-stretch glass-input !p-0 overflow-hidden ${error ? "error" : ""
                    } ${disabled ? "opacity-50" : ""}`}
            >
                {/* Fixed Country Code - Mobile Optimized */}
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3.5 border-r border-[var(--border)] bg-[var(--secondary-muted)]/10 shrink-0">
                    <span className="text-xl sm:text-2xl shrink-0 leading-none">🇮🇳</span>
                    <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-[var(--foreground-muted)] opacity-60">
                            IND
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[var(--primary)] whitespace-nowrap">
                            +91
                        </span>
                    </div>
                </div>

                {/* Phone Input */}
                <input
                    ref={inputRef}
                    type="tel"
                    inputMode="numeric"
                    value={formatPhoneDisplay(value)}
                    onChange={handlePhoneChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    className="flex-1 min-w-0 px-3 sm:px-5 py-3.5 bg-transparent text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none text-base sm:text-lg font-medium"
                    aria-label="Phone number"
                />
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
