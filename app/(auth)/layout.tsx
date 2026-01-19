export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="auth-background min-h-screen flex items-center justify-center p-4">
            {/* Auth Content */}
            <div className="w-full max-w-md animate-slide-up">{children}</div>
        </div>
    );
}
