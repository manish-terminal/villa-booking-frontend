"use client";

import { useState, useEffect } from "react";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative glass-card w-full max-w-md p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[var(--foreground)]">Generate Invite Code</h2>
                    <button onClick={onClose} className="p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Property Info */}
                <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] mb-6">
                    <p className="text-sm text-[var(--foreground-muted)]">Property</p>
                    <p className="font-medium text-[var(--foreground)]">{property.name}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">{property.city}, {property.state}</p>
                </div>

                {!generatedCode ? (
                    <>
                        {/* Options */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="form-label">Expires In</label>
                                <select
                                    value={expiresInDays}
                                    onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                                    className="w-full glass-input px-4 py-3 text-[var(--foreground)]"
                                >
                                    <option value={7}>7 days</option>
                                    <option value={14}>14 days</option>
                                    <option value={30}>30 days</option>
                                    <option value={60}>60 days</option>
                                    <option value={90}>90 days</option>
                                </select>
                            </div>

                            <div>
                                <label className="form-label">Maximum Uses</label>
                                <select
                                    value={maxUses}
                                    onChange={(e) => setMaxUses(parseInt(e.target.value))}
                                    className="w-full glass-input px-4 py-3 text-[var(--foreground)]"
                                >
                                    <option value={1}>1 use</option>
                                    <option value={5}>5 uses</option>
                                    <option value={10}>10 uses</option>
                                    <option value={25}>25 uses</option>
                                    <option value={50}>50 uses</option>
                                    <option value={100}>100 uses (unlimited)</option>
                                </select>
                            </div>
                        </div>

                        <Button onClick={handleGenerate} loading={loading}>
                            Generate Code
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Generated Code Display */}
                        <div className="text-center mb-6">
                            <p className="text-sm text-[var(--foreground-muted)] mb-2">Share this code with agents</p>
                            <div className="relative">
                                <div className="text-3xl font-mono font-bold text-[var(--foreground)] tracking-widest bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent py-4">
                                    {generatedCode.code.toUpperCase()}
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-[var(--foreground-muted)]">
                                <span>Expires: {new Date(generatedCode.expiresAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Max uses: {generatedCode.maxUses}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={copyToClipboard} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                            </button>
                            <Button onClick={onClose} fullWidth>Done</Button>
                        </div>
                    </>
                )}
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
            console.log("API response for invite codes:", response);
            // API returns inviteCodes, not codes
            const codesArray = (response as { inviteCodes?: InviteCode[] }).inviteCodes || [];
            console.log("Codes array:", codesArray);
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
            showToast("Code copied!", "success");
        } catch {
            showToast("Failed to copy", "error");
        }
    };

    // Show all codes - filter later if needed based on actual API fields
    const displayCodes = codes;

    return (
        <div className="glass-card p-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--primary-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--foreground)]">{property.name}</h3>
                        <p className="text-sm text-[var(--foreground-muted)]">{property.city}, {property.state}</p>
                    </div>
                </div>
                <Button onClick={() => onGenerateCode(property)} fullWidth={false}>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Code
                </Button>
            </div>

            {/* View Codes Button */}
            <button
                onClick={fetchCodes}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--glass-bg)] transition-colors"
            >
                <span className="text-sm text-[var(--foreground-muted)]">
                    {loadingCodes ? "Loading..." : expanded ? "Hide codes" : "View existing codes"}
                </span>
                <svg
                    className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Codes List */}
            {expanded && codes.length > 0 && (
                <div className="mt-4 space-y-2 animate-slide-up">
                    {displayCodes.length === 0 ? (
                        <p className="text-sm text-[var(--foreground-muted)] text-center py-4">No active codes</p>
                    ) : (
                        displayCodes.map((code: InviteCode) => (
                            <div
                                key={code.code}
                                className="flex items-center justify-between p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)]"
                            >
                                <div>
                                    <p className="font-mono font-bold text-[var(--foreground)]">{code.code.toUpperCase()}</p>
                                    <p className="text-xs text-[var(--foreground-muted)]">
                                        Used: {code.usedCount || 0}/{code.maxUses || '∞'} • Expires: {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => copyCode(code.code)}
                                    className="p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {expanded && codes.length === 0 && !loadingCodes && (
                <p className="mt-4 text-sm text-[var(--foreground-muted)] text-center py-4">
                    No codes generated yet
                </p>
            )}
        </div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--input-bg)]"></div>
                        <div>
                            <div className="h-5 w-40 bg-[var(--input-bg)] rounded mb-2"></div>
                            <div className="h-4 w-24 bg-[var(--input-bg)] rounded"></div>
                        </div>
                    </div>
                    <div className="h-12 bg-[var(--input-bg)] rounded-xl"></div>
                </div>
            ))}
        </div>
    );
}

// Empty State
function EmptyState() {
    return (
        <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No Properties Yet</h3>
            <p className="text-[var(--foreground-muted)] mb-6">
                Add properties first to generate agent invite codes
            </p>
            <a href="/owner/properties" className="btn-primary inline-block px-6 py-3">
                Add Property
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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Agent Codes</h1>
                <p className="text-[var(--foreground-muted)]">
                    Generate invite codes for agents to book your properties
                </p>
            </div>

            {/* Info Card */}
            <div className="glass-card p-4 border-l-4 border-[var(--primary-500)]">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-[var(--primary-500)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm">
                        <p className="text-[var(--foreground)] font-medium">How it works</p>
                        <p className="text-[var(--foreground-muted)]">
                            Generate codes and share them with agents. When agents register with your code, they&apos;ll be linked to your property and can make bookings on your behalf.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="glass-card p-4 border-[var(--error)] bg-red-500/10">
                    <p className="text-[var(--error)]">{error}</p>
                    <button onClick={fetchProperties} className="link text-sm mt-2">Try again</button>
                </div>
            )}

            {/* Loading */}
            {loading && <LoadingSkeleton />}

            {/* Empty State */}
            {!loading && !error && properties.length === 0 && <EmptyState />}

            {/* Properties List */}
            {!loading && !error && properties.length > 0 && (
                <div className="space-y-4">
                    {properties.map((property) => (
                        <PropertyCodeCard
                            key={property.id}
                            property={property}
                            onGenerateCode={handleGenerateCode}
                        />
                    ))}
                </div>
            )}

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
