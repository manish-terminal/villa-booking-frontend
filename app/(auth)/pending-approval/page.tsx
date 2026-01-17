"use client";

import Link from "next/link";

export default function PendingApprovalPage() {
    return (
        <div className="glass-card p-6 sm:p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3">
                Pending Approval
            </h1>

            {/* Description */}
            <p className="text-[var(--foreground-muted)] mb-6 max-w-sm mx-auto">
                Your account registration has been submitted and is pending admin approval.
                We&apos;ll notify you once your account is approved.
            </p>

            {/* Status Card */}
            <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] mb-6">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse-subtle" />
                    <span className="text-[var(--foreground)] font-medium">
                        Account Status: Pending Review
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="text-sm text-[var(--foreground-muted)] mb-8">
                <p>This usually takes 24-48 hours.</p>
                <p>You&apos;ll receive a notification once approved.</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <Link
                    href="/login"
                    className="block w-full btn-primary text-center"
                >
                    <span>Back to Login</span>
                </Link>

                <a
                    href="mailto:support@villabook.com"
                    className="block w-full btn-secondary text-center"
                >
                    Contact Support
                </a>
            </div>
        </div>
    );
}
