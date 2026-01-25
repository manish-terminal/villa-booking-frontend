"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { api } from "@/app/lib/api";
import { Agent, APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";

interface AgentCardProps {
    agent: Agent;
    onStatusChange: (phone: string, active: boolean) => Promise<void>;
}

function AgentCard({ agent, onStatusChange }: AgentCardProps) {
    const [updating, setUpdating] = useState(false);
    const isActive = agent.status === "approved";

    const handleToggle = async () => {
        setUpdating(true);
        try {
            await onStatusChange(agent.phone, !isActive);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusStyle = () => {
        switch (agent.status) {
            case "approved":
                return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case "pending":
                return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            case "rejected":
                return "bg-red-500/10 text-red-600 border-red-500/20";
            default:
                return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    return (
        <div className="glass-card overflow-hidden animate-fade-in border-l-4 border-[var(--primary)] hover:shadow-lg transition-all">
            <div className="p-6">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[var(--primary)]/20">
                            {agent.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                                {agent.name || "Unnamed Agent"}
                            </h3>
                            <p className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest flex items-center gap-2">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {agent.phone}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle()}`}>
                        {agent.status}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)]">
                        <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1">Properties</p>
                        <p className="text-xl font-black text-[var(--foreground)]">{agent.managedProperties?.length || 0}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)]">
                        <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1">Joined</p>
                        <p className="text-sm font-bold text-[var(--foreground)]">
                            {agent.createdAt ? format(new Date(agent.createdAt), "MMM d, yyyy") : "N/A"}
                        </p>
                    </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--glass-border)]">
                    <div>
                        <p className="text-xs font-bold text-[var(--foreground)]">Agent Status</p>
                        <p className="text-[10px] font-medium text-[var(--foreground-muted)]">
                            {isActive ? "Agent can create bookings" : "Agent access is disabled"}
                        </p>
                    </div>
                    <button
                        onClick={handleToggle}
                        disabled={updating || agent.status === "pending"}
                        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${updating ? "opacity-50 cursor-wait" : ""
                            } ${isActive ? "bg-[var(--primary)]" : "bg-slate-300"
                            } ${agent.status === "pending" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <span
                            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${isActive ? "left-7" : "left-1"
                                }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse border-l-4 border-[var(--glass-border)]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--input-bg)]" />
                        <div className="space-y-2">
                            <div className="h-5 w-36 bg-[var(--input-bg)] rounded-lg" />
                            <div className="h-3 w-24 bg-[var(--input-bg)] rounded-md" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="h-20 bg-[var(--input-bg)] rounded-xl" />
                        <div className="h-20 bg-[var(--input-bg)] rounded-xl" />
                    </div>
                    <div className="h-16 bg-[var(--input-bg)] rounded-2xl" />
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="glass-card p-16 text-center animate-fade-in border-dashed border-2 border-[var(--glass-border)] bg-transparent">
            <div className="w-24 h-24 mx-auto mb-8 rounded-[2.5rem] bg-[var(--primary)] text-white flex items-center justify-center shadow-2xl shadow-[var(--primary)]/20 rotate-3">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3 tracking-tight">No Linked Agents</h3>
            <p className="text-[11px] font-black text-[var(--foreground-muted)] uppercase tracking-widest max-w-sm mx-auto mb-8 opacity-60">
                Agents will appear here once they register using your property invite codes.
            </p>
            <a
                href="/owner/agents"
                className="inline-flex items-center gap-3 bg-[var(--foreground)] text-[var(--background)] px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
            >
                Generate Invite Codes
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </a>
        </div>
    );
}

export default function AgentSettings() {
    const { showToast } = useToast();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAgents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getAgents();
            setAgents(response.agents || []);
        } catch (err) {
            const apiError = err as APIError;
            setError(apiError.error || "Failed to load agents");
            showToast(apiError.error || "Failed to load agents", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const handleStatusChange = async (phone: string, active: boolean) => {
        try {
            const response = await api.updateAgentStatus(phone, active);
            // Update the agent in state
            setAgents(prev => prev.map(a =>
                a.phone === phone ? response.agent : a
            ));
            showToast(
                active ? "Agent activated successfully" : "Agent deactivated successfully",
                "success"
            );
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Failed to update agent status", "error");
            throw err; // Re-throw so the card knows the update failed
        }
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Agent Settings</h1>
                <p className="text-[11px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mt-2">
                    Manage agents linked to your properties
                </p>
            </div>

            {/* Info Card */}
            <div className="p-6 rounded-3xl bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20">
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">How It Works</p>
                        <p className="text-sm font-bold leading-relaxed">
                            Activate or deactivate agents to control their access to your properties.
                            Deactivated agents cannot create new bookings but their existing bookings remain intact.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 animate-fade-in">
                    <div className="flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                        <span>Failed to load agents</span>
                        <button onClick={fetchAgents} className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all">
                            Retry Now
                        </button>
                    </div>
                </div>
            )}

            {/* Agents List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em]">Your Agents</h2>
                    <span className="text-[10px] font-black text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full">
                        {agents.length} Total
                    </span>
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : !error && agents.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {agents.map((agent) => (
                            <AgentCard
                                key={agent.phone}
                                agent={agent}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
