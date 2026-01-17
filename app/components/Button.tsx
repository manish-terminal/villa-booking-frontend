"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    loading?: boolean;
    children: ReactNode;
    fullWidth?: boolean;
}

export default function Button({
    variant = "primary",
    loading = false,
    children,
    fullWidth = true,
    disabled,
    className = "",
    ...props
}: ButtonProps) {
    const baseClass = variant === "primary" ? "btn-primary" : "btn-secondary";
    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseClass} ${widthClass} flex items-center justify-center gap-2 ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className="spinner" />}
            <span>{children}</span>
        </button>
    );
}
