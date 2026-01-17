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
    { code: "+1", name: "USA", flag: "🇺🇸", maxLength: 10 },
    { code: "+44", name: "UK", flag: "🇬🇧", maxLength: 10 },
    { code: "+971", name: "UAE", flag: "🇦🇪", maxLength: 9 },
    { code: "+65", name: "Singapore", flag: "🇸🇬", maxLength: 8 },
];

export default function PhoneInput({
    value,
    onChange,
    error,
    disabled = false,
    autoFocus = false,
    placeholder = "Enter phone number",
}: PhoneInputProps) {
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
        countryCodes[0]
    );
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        if (selectedCountry.code === "+91" && phone.length > 5) {
            return `${phone.slice(0, 5)} ${phone.slice(5)}`;
        }
        return phone;
    };

    const selectCountry = (country: CountryCode) => {
        setSelectedCountry(country);
        setIsDropdownOpen(false);
        onChange(""); // Clear phone when country changes
        inputRef.current?.focus();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`flex items-stretch glass-input overflow-hidden ${error ? "error" : ""
                    } ${disabled ? "opacity-50" : ""}`}
            >
                {/* Country Code Selector */}
                <button
                    type="button"
                    onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
                    disabled={disabled}
                    className="flex items-center gap-1.5 px-3 py-3 border-r border-[var(--input-border)] hover:bg-[var(--glass-bg)] transition-colors"
                    aria-label="Select country code"
                >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-sm font-medium text-[var(--foreground)]">
                        {selectedCountry.code}
                    </span>
                    <svg
                        className={`w-4 h-4 text-[var(--foreground-muted)] transition-transform ${isDropdownOpen ? "rotate-180" : ""
                            }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {/* Phone Input */}
                <input
                    ref={inputRef}
                    type="tel"
                    inputMode="numeric"
                    value={formatPhoneDisplay(value)}
                    onChange={handlePhoneChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-3 bg-transparent text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none text-lg"
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

            {/* Country Dropdown */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-50 animate-slide-up">
                    {countryCodes.map((country) => (
                        <button
                            key={country.code}
                            type="button"
                            onClick={() => selectCountry(country)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--input-bg)] transition-colors ${selectedCountry.code === country.code
                                    ? "bg-[var(--input-bg)]"
                                    : ""
                                }`}
                        >
                            <span className="text-xl">{country.flag}</span>
                            <span className="flex-1 text-left text-[var(--foreground)]">
                                {country.name}
                            </span>
                            <span className="text-[var(--foreground-muted)] text-sm">
                                {country.code}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
