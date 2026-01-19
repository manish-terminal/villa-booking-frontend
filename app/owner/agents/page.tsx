"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, User, Phone, Mail, Users, FileText, Send, Calendar as CalendarIcon, CreditCard, Plus, ChevronDown, Copy } from "lucide-react";
import { api } from "@/app/lib/api";
import { Property, InviteCode } from "@/app/types/property";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import Button from "@/app/components/Button";

// Generate Code Modal
function GenerateCodeModal({
    isOpen,
    onClose,
    property,
    onGenerated,
}: {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
    onGenerated: (code: InviteCode) => void;
}) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [expiresInDays, setExpiresInDays] = useState(30);
    const [maxUses, setMaxUses] = useState(10);
    const [generatedCode, setGeneratedCode] = useState<InviteCode | null>(null);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setExpiresInDays(30);
            setMaxUses(10);
            setGeneratedCode(null);
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        if (!property) return;

        setLoading(true);
        try {
            const code = await api.generateInviteCode(property.id, expiresInDays, maxUses);
            setGeneratedCode(code);
            onGenerated(code);
            showToast("Invite code generated!", "success");
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Failed to generate code", "error");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!generatedCode) return;
        try {
            await navigator.clipboard.writeText(generatedCode.code);
            showToast("Code copied to clipboard!", "success");
        } catch {
            showToast("Failed to copy", "error");
        }
    };

    if (!isOpen || !property) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-scale-in border-t-8 border-[var(--primary)]">
                <div className="p-8 border-b border-[var(--glass-border)] flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Generate Code</h2>
                        <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mt-1">Agent entry for {property.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    {!generatedCode ? (
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest ml-1 mb-2 block">Expiration</label>
                                    <select
                                        value={expiresInDays}
                                        onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                                        className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm font-bold text-[var(--foreground)] outline-none appearance-none transition-all cursor-pointer"
                                    >
                                        <option value={7}>7 Days Validity</option>
                                        <option value={14}>14 Days Validity</option>
                                        <option value={30}>30 Days Validity</option>
                                        <option value={60}>60 Days Validity</option>
                                        <option value={90}>90 Days Validity</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest ml-1 mb-2 block">Usage Limit</label>
                                    <select
                                        value={maxUses}
                                        onChange={(e) => setMaxUses(parseInt(e.target.value))}
                                        className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm font-bold text-[var(--foreground)] outline-none appearance-none transition-all cursor-pointer"
                                    >
                                        <option value={1}>Single Use Code</option>
                                        <option value={5}>5 Shared Uses</option>
                                        <option value={10}>10 Shared Uses</option>
                                        <option value={25}>25 Shared Uses</option>
                                        <option value={50}>50 Shared Uses</option>
                                        <option value={100}>Unlimited (100 uses)</option>
                                    </select>
                                </div>
                            </div>

                            <Button onClick={handleGenerate} loading={loading} fullWidth className="h-14 !rounded-2xl">
                                <span className="text-sm font-black uppercase tracking-widest">Generate Access Code</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="text-center p-8 rounded-3xl bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20">
                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-4">Sharing Access Code</p>
                                <div className="text-4xl font-mono font-black tracking-[0.3em] mb-4 select-all">
                                    {generatedCode.code.toUpperCase()}
                                </div>
                                <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                                    <span>Expires {format(new Date(generatedCode.expiresAt), "MMM d, yyyy")}</span>
                                    <span className="opacity-30">•</span>
                                    <span>Limit {generatedCode.maxUses} Uses</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 h-14 rounded-2xl bg-[var(--input-bg)] text-[var(--foreground)] text-xs font-black uppercase tracking-widest hover:bg-[var(--glass-border)] transition-all flex items-center justify-center gap-3 border border-[var(--glass-border)]"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy Link
                                </button>
                                <Button onClick={onClose} fullWidth className="h-14 !rounded-2xl">Done</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Property Card with Invite Codes
function PropertyCodeCard({
    property,
    onGenerateCode,
}: {
    property: Property;
    onGenerateCode: (property: Property) => void;
}) {
    const { showToast } = useToast();
    const [codes, setCodes] = useState<InviteCode[]>([]);
    const [loadingCodes, setLoadingCodes] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const fetchCodes = async () => {
        if (codes.length > 0) {
            setExpanded(!expanded);
            return;
        }

        setLoadingCodes(true);
        try {
            const response = await api.getPropertyInviteCodes(property.id);
            const codesArray = (response as { inviteCodes?: InviteCode[] }).inviteCodes || [];
            setCodes(codesArray);
            setExpanded(true);
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Failed to load codes", "error");
        } finally {
            setLoadingCodes(false);
        }
    };

    const copyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            showToast("Code copied to clipboard!", "success");
        } catch {
            showToast("Failed to copy", "error");
        }
    };

    return (
        <div className="glass-card overflow-hidden animate-fade-in border-l-4 border-[var(--primary)]">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">{property.name}</h3>
                            <p className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">{property.city}, {property.state}</p>
                        </div>
                    </div>
                    <Button onClick={() => onGenerateCode(property)} className="!rounded-xl px-4 py-2">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Plus size={14} />
                            Code
                        </span>
                    </Button>
                </div>

                {/* View Codes Toggle */}
                <button
                    onClick={fetchCodes}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--input-bg)] hover:bg-[var(--glass-border)]/50 transition-all border border-transparent hover:border-[var(--glass-border)]"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${codes.length > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-[var(--foreground-muted)] opacity-30'}`} />
                        <span className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">
                            {loadingCodes ? "Syncing..." : expanded ? "Hide Active Codes" : `View ${codes.length || ''} Existing Codes`}
                        </span>
                    </div>
                    <ChevronDown size={16} className={`text-[var(--foreground-muted)] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Codes List */}
                {expanded && (
                    <div className="mt-4 space-y-3 animate-slide-up">
                        {codes.length === 0 && !loadingCodes ? (
                            <div className="py-8 text-center bg-[var(--input-bg)]/30 rounded-2xl border border-dashed border-[var(--glass-border)]">
                                <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">No keys generated yet</p>
                            </div>
                        ) : (
                            codes.map((code) => (
                                <div
                                    key={code.code}
                                    className="group flex items-center justify-between p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)] hover:border-[var(--secondary)] transition-all"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono font-black text-[var(--foreground)] tracking-widest">{code.code.toUpperCase()}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${code.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {code.isActive ? 'Active' : 'Expired'}
                                            </span>
                                        </div>
                                        <p className="text-[9px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest flex items-center gap-3">
                                            <span>Used: {code.usedCount || 0}/{code.maxUses || '∞'}</span>
                                            <span className="opacity-30">•</span>
                                            <span className="flex items-center gap-1.5">
                                                <CalendarIcon size={10} />
                                                {code.expiresAt ? format(new Date(code.expiresAt), "MMM d, yyyy") : 'No Expiry'}
                                            </span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => copyCode(code.code)}
                                        className="p-2.5 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                                        title="Copy Access Code"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse border-l-4 border-[var(--glass-border)]">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--input-bg)]"></div>
                        <div className="space-y-2">
                            <div className="h-5 w-40 bg-[var(--input-bg)] rounded-lg"></div>
                            <div className="h-3 w-24 bg-[var(--input-bg)] rounded-md"></div>
                        </div>
                    </div>
                    <div className="h-14 bg-[var(--input-bg)] rounded-2xl"></div>
                </div>
            ))}
        </div>
    );
}

// Empty State
function EmptyState() {
    return (
        <div className="glass-card p-16 text-center animate-fade-in border-dashed border-2 border-[var(--glass-border)] bg-transparent">
            <div className="w-24 h-24 mx-auto mb-8 rounded-[2.5rem] bg-[var(--primary)] text-white flex items-center justify-center shadow-2xl shadow-[var(--primary)]/20 rotate-3">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3 tracking-tight">No Properties Registered</h3>
            <p className="text-[11px] font-black text-[var(--foreground-muted)] uppercase tracking-widest max-w-xs mx-auto mb-8 opacity-60">
                You need to register at least one property before you can manage agent access codes.
            </p>
            <a
                href="/owner/properties"
                className="inline-flex items-center gap-3 bg-[var(--foreground)] text-[var(--background)] px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
            >
                Register Property
                <Plus size={16} />
            </a>
        </div>
    );
}

// Main Page
export default function AgentCodesPage() {
    const { showToast } = useToast();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchProperties = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getProperties();
            setProperties(response.properties || []);
        } catch (err) {
            const apiError = err as APIError;
            setError(apiError.error || "Failed to load properties");
            showToast(apiError.error || "Failed to load properties", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleGenerateCode = (property: Property) => {
        setSelectedProperty(property);
        setModalOpen(true);
    };

    const handleCodeGenerated = () => {
        // Could refresh the specific property's codes here
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Agent Access Codes</h1>
                <p className="text-[11px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mt-2">
                    Manage property-specific invitation keys for authorized agents
                </p>
            </div>

            {/* How it works Info Card */}
            <div className="p-6 rounded-3xl bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20">
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Guide</p>
                        <p className="text-sm font-bold leading-relaxed">
                            Generate unique keys and share them with your agents. When an agent registers with your code,
                            they gain authorization to manage bookings for that specific property under your oversight.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 animate-fade-in">
                    <div className="flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                        <span>Failed to sync properties</span>
                        <button onClick={fetchProperties} className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all">Retry Now</button>
                    </div>
                </div>
            )}

            {/* Properties List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em]">Active Properties</h2>
                    <span className="text-[10px] font-black text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full">{properties.length} Total</span>
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : !error && properties.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {properties.map((property) => (
                            <PropertyCodeCard
                                key={property.id}
                                property={property}
                                onGenerateCode={handleGenerateCode}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Generate Modal */}
            <GenerateCodeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                property={selectedProperty}
                onGenerated={handleCodeGenerated}
            />
        </div>
    );
}
