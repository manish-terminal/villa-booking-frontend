"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/app/lib/auth";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const user = getUser();
        if (!user || user.role !== "admin") {
            router.push("/login");
        } else {
            setAuthorized(true);
        }
    }, []);

    if (!authorized) {
        return null;
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
