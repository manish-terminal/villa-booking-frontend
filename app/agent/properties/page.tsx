"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { Property } from "@/app/types/property";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import Button from "@/app/components/Button";
import { Home, Link as LinkIcon, MapPin, Plus } from "lucide-react";

// Modal for linking property via invite code
function LinkPropertyModal({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { showToast } = useToast();
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLink = async () => {
        if (!inviteCode.trim()) {
            showToast("Enter a valid code", "error");
            return;
        }

        setLoading(true);
        try {
            await api.validateInviteCode(inviteCode);
            showToast("Property linked successfully!", "success");
            onSuccess();
            onClose();
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Invalid or expired code", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative glass-card w-full max-w-md p-8 animate-slide-up shadow-2xl">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500">
                    <LinkIcon size={32} />
                </div>
                <h2 className="text-2xl font-black text-[var(--foreground)] mb-2 text-center uppercase tracking-tight">Link Property</h2>
                <p className="text-center text-[var(--foreground-muted)] text-sm mb-8">Enter the unique invite code provided by the property owner.</p>

                <div className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            placeholder="CODE-XXXX"
                            className="w-full glass-input px-4 py-5 text-center text-3xl font-black font-mono tracking-[0.2em] uppercase bg-[var(--input-bg)] focus:ring-4 ring-indigo-500/10 placeholder:opacity-20"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl font-bold text-[var(--foreground-muted)] hover:bg-[var(--input-bg)] transition-all">Cancel</button>
                        <Button onClick={handleLink} loading={loading} className="flex-1 !rounded-2xl">Link Property</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AgentProperties() {
    const router = useRouter();
    const { showToast } = useToast();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [linkModalOpen, setLinkModalOpen] = useState(false);

    const fetchLinkedProperties = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getProperties();
            setProperties(response.properties || []);
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Failed to load properties", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchLinkedProperties();
    }, [fetchLinkedProperties]);

    const handlePropertyClick = (propertyId: string) => {
        // Redirection for calendar-only booking
        router.push(`/agent/bookings?propertyId=${propertyId}&view=calendar`);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">My Properties</h1>
                    <p className="text-[var(--foreground-muted)] font-medium">Select a villa to check availability and book</p>
                </div>
                <button
                    onClick={() => setLinkModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Link New Property</span>
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-[var(--input-bg)] rounded-[2.5rem]"></div>)}
                </div>
            ) : properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((prop) => (
                        <div
                            key={prop.id}
                            onClick={() => handlePropertyClick(prop.id)}
                            className="glass-card overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] border-[var(--glass-border)] hover:-translate-y-2"
                        >
                            <div className="h-56 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 relative overflow-hidden">
                                {prop.images && prop.images.length > 0 ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={prop.images[0]}
                                        alt={prop.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-500/20">
                                        <Home size={64} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                                        <MapPin size={12} className="text-indigo-400" />
                                        <span>{prop.city}, {prop.state}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-white truncate group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{prop.name}</h3>
                                </div>
                                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-white font-black text-sm">
                                    ₹{prop.pricePerNight.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-8 flex items-center justify-between bg-[var(--input-bg)]/30">
                                <span className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">Global Availability</span>
                                <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                                    <span>Check Calendar</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-20 text-center border-dashed border-2 border-[var(--glass-border)] rounded-[3rem] flex flex-col items-center max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mb-8 text-indigo-500">
                        <Home size={48} />
                    </div>
                    <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">No Properties Linked</h3>
                    <p className="text-[var(--foreground-muted)] text-lg font-medium mb-10 max-w-sm">Use an invite code from a property owner to start managing and booking villas.</p>
                    <Button onClick={() => setLinkModalOpen(true)} className="!px-10 !py-5 !rounded-2xl">Link Your First Property</Button>
                </div>
            )}

            <LinkPropertyModal
                isOpen={linkModalOpen}
                onClose={() => setLinkModalOpen(false)}
                onSuccess={fetchLinkedProperties}
            />
        </div>
    );
}
