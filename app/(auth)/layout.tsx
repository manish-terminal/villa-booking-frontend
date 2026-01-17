import ThemeToggle from "@/app/components/ThemeToggle";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="auth-background min-h-screen flex items-center justify-center p-4">
            {/* Theme Toggle - Top Right */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Auth Content */}
            <div className="w-full max-w-md animate-slide-up">{children}</div>
        </div>
    );
}
