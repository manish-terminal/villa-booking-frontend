"use client";

import { useRef, KeyboardEvent, ClipboardEvent, useEffect } from "react";

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
    error?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
}

export default function OTPInput({
    length = 6,
    value,
    onChange,
    onComplete,
    error = false,
    disabled = false,
    autoFocus = true,
}: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Auto-focus first input
    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    const focusInput = (index: number) => {
        if (index >= 0 && index < length && inputRefs.current[index]) {
            inputRefs.current[index]?.focus();
        }
    };

    const handleChange = (index: number, inputValue: string) => {
        if (disabled) return;

        // Only take the last character if multiple are typed
        const char = inputValue.slice(-1);

        // Only allow digits
        if (char && !/^\d$/.test(char)) return;

        const newOTPArray = value.split("").slice(0, length);
        while (newOTPArray.length < length) newOTPArray.push("");
        newOTPArray[index] = char;

        const newOTP = newOTPArray.join("");
        onChange(newOTP);

        // Move to next input if character was entered
        if (char && index < length - 1) {
            focusInput(index + 1);
        }

        // Check if OTP is complete
        if (newOTP.length === length && onComplete) {
            onComplete(newOTP);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        switch (e.key) {
            case "Backspace":
                e.preventDefault();
                const currentOTPArray = value.split("").slice(0, length);
                while (currentOTPArray.length < length) currentOTPArray.push("");

                if (currentOTPArray[index]) {
                    // Clear current input
                    currentOTPArray[index] = "";
                    onChange(currentOTPArray.join(""));
                } else if (index > 0) {
                    // Move to previous input and clear it
                    focusInput(index - 1);
                    currentOTPArray[index - 1] = "";
                    onChange(currentOTPArray.join(""));
                }
                break;
            case "ArrowLeft":
                e.preventDefault();
                focusInput(index - 1);
                break;
            case "ArrowRight":
                e.preventDefault();
                focusInput(index + 1);
                break;
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

        if (!pastedData) return;

        const chars = pastedData.slice(0, length).split("");
        const newOTPArray = [...Array(length).fill("")];

        chars.forEach((char, i) => {
            newOTPArray[i] = char;
        });

        const newOTP = newOTPArray.join("");
        onChange(newOTP);

        // Focus appropriate input
        const focusIndex = Math.min(chars.length, length - 1);
        focusInput(focusIndex);

        // Check if complete
        if (newOTP.length === length && onComplete) {
            onComplete(newOTP);
        }
    };

    return (
        <div className="flex justify-center gap-1.5 sm:gap-3 stagger-children">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={value[index] || ""}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    disabled={disabled}
                    className={`otp-input !text-center !p-0 ${value[index] ? "filled" : ""
                        } ${error ? "error animate-shake" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    );
}
