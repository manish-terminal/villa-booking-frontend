"use client";

import { useRef, useEffect } from "react";

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
                className={`flex items-center bg-white border rounded-2xl transition-all duration-300 ${error ? "border-rose-500 ring-4 ring-rose-500/5" : "border-slate-200 focus-within:border-[#0a192f] focus-within:ring-4 focus-within:ring-[#0a192f]/5"
                    } ${disabled ? "opacity-50" : ""}`}
            >
                {/* Fixed Country Code - Simplified */}
                <div className="flex items-center gap-2 pl-5 pr-3 py-4 border-r border-slate-100 shrink-0">
                    <span className="text-xl leading-none">🇮🇳</span>
                    <span className="text-sm font-black text-[#0a192f] tracking-tight">
                        +91
                    </span>
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
                    className="flex-1 px-4 py-4 bg-transparent text-[#0a192f] placeholder:text-slate-300 focus:outline-none text-base font-bold tracking-widest"
                    aria-label="Phone number"
                />
            </div>

            {/* Error Message */}
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
