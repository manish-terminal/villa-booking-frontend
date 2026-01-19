"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/app/lib/api";
import { getUser } from "@/app/lib/auth";
import { AgentAnalytics } from "@/app/types/analytics";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import { Calendar, Filter, RefreshCw, Wallet } from "lucide-react";

export default function AgentDashboard() {
    const { showToast } = useToast();

    // Default to current month (Local Time safe)
    const today = new Date();
    const getLocalISO = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    const firstDay = getLocalISO(new Date(today.getFullYear(), today.getMonth(), 1));
    const lastDay = getLocalISO(new Date(today.getFullYear(), today.getMonth() + 1, 0));

    const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dateRange, setDateRange] = useState({
        startDate: firstDay,
        endDate: lastDay
    });

    const fetchAnalytics = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            console.log("[DEBUG] Fetching Agent Analytics:", {
                phone: getUser()?.phone,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });

            const data = await api.getAgentAnalytics(dateRange.startDate, dateRange.endDate);

            console.log("[DEBUG] Agent Analytics Response:", data);

            setAnalytics(data);
            setError(null);
        } catch (err) {
            const apiError = err as APIError;
            console.error("[DEBUG] Analytics Fetch Error:", apiError);
            setError(apiError.error || "Failed to load analytics");
            showToast(apiError.error || "Failed to load analytics", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [dateRange, showToast]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading && !refreshing) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between items-end mb-8">
                    <div className="space-y-2 w-1/3">
                        <div className="h-8 bg-[var(--input-bg)] rounded-lg"></div>
                        <div className="h-4 bg-[var(--input-bg)] rounded-lg w-2/3"></div>
                    </div>
                    <div className="h-12 bg-[var(--input-bg)] rounded-lg w-1/4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 glass-card"></div>
                    ))}
                </div>
                <div className="h-80 glass-card"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Header & Date Selector */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">Analytics</h1>
                    <p className="text-sm text-[var(--foreground-muted)]">Tracking your impact, earnings, and commissions</p>
                </div>

                <div className="flex items-center p-1 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="bg-transparent border-none text-xs sm:text-sm text-[var(--foreground)] focus:ring-0 p-1.5 cursor-pointer outline-none"
                        />
                        <div className="h-4 w-px bg-[var(--glass-border)] mx-1" />
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="bg-transparent border-none text-xs sm:text-sm text-[var(--foreground)] focus:ring-0 p-1.5 cursor-pointer outline-none"
                        />
                    </div>

                    <button
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className={`p-2 rounded-xl hover:bg-[var(--background)] transition-all ${refreshing ? 'animate-spin text-[var(--secondary)]' : 'text-[var(--foreground-muted)]'}`}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {error || !analytics ? (
                <div className="glass-card p-8 sm:p-12 text-center border-dashed border-2 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
                        <Filter size={32} />
                    </div>
                    <p className="text-[var(--error)] font-semibold">{error || "No data available"}</p>
                    <button
                        onClick={() => fetchAnalytics()}
                        className="btn-primary px-8"
                    >
                        Retry Fetch
                    </button>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="glass-card p-5 sm:p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/5 text-[var(--primary)] flex items-center justify-center shrink-0">
                                <Calendar size={24} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-0.5">Bookings</p>
                                <h3 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tabular-nums leading-none">{analytics.totalBookings}</h3>
                            </div>
                        </div>

                        <div className="glass-card p-5 sm:p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 text-emerald-500 flex items-center justify-center shrink-0">
                                <span className="font-bold">₹</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-0.5">Gross Value</p>
                                <h3 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tabular-nums leading-none">
                                    <span className="text-xs font-bold mr-0.5">{analytics.currency}</span>
                                    {analytics.totalBookingValue.toLocaleString()}
                                </h3>
                            </div>
                        </div>

                        <div className="glass-card p-5 sm:p-6">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-2xl bg-[var(--secondary)]/5 text-[var(--secondary)] flex items-center justify-center shrink-0">
                                    <span className="font-bold">✓</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-0.5">Collected</p>
                                    <h3 className="text-xl font-black text-[var(--foreground)] leading-none">
                                        <span className="text-xs font-bold mr-0.5">{analytics.currency}</span>
                                        {analytics.totalCollected.toLocaleString()}
                                    </h3>
                                </div>
                            </div>
                            <div className="h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--secondary)] transition-all duration-1000"
                                    style={{ width: `${analytics.totalBookingValue > 0 ? (analytics.totalCollected / analytics.totalBookingValue) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="glass-card p-5 sm:p-6 bg-[var(--primary)] text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Wallet size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-0.5">Commission</p>
                                    <h3 className="text-2xl sm:text-3xl font-black tabular-nums leading-none">
                                        <span className="text-xs font-bold mr-0.5">{analytics.currency}</span>
                                        {(analytics.totalCommission || 0).toLocaleString()}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Bookings Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[var(--foreground)]">Recent Activity</h3>
                            {refreshing && <div className="text-[10px] font-bold text-[var(--secondary)] animate-pulse uppercase">Syncing...</div>}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden sm:block glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[var(--input-bg)] text-[var(--foreground-muted)] text-[10px] uppercase font-bold tracking-[0.1em] border-b border-[var(--glass-border)]">
                                        <tr>
                                            <th className="px-6 py-4">Property</th>
                                            <th className="px-6 py-4">Guest</th>
                                            <th className="px-6 py-4">Check-In</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Commission</th>
                                            <th className="px-6 py-4 text-right">Gross Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glass-border)]">
                                        {analytics.recentBookings.length > 0 ? (
                                            analytics.recentBookings.map((booking) => (
                                                <tr key={booking.bookingId} className="hover:bg-[var(--input-bg)]/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-[var(--foreground)]">{booking.propertyName}</div>
                                                        <div className="text-[10px] text-[var(--foreground-muted)] uppercase mt-0.5">#{booking.bookingId.slice(-6)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-[var(--foreground-muted)]">{booking.guestName}</td>
                                                    <td className="px-6 py-4 text-sm text-[var(--foreground-muted)]">
                                                        {new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${booking.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500" :
                                                            booking.status === "pending_confirmation" ? "bg-amber-500/10 text-amber-500" :
                                                                "bg-rose-500/10 text-rose-500"
                                                            }`}>
                                                            {booking.status.replace("_", " ")}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-[var(--secondary)]">
                                                        <span className="text-[10px] font-bold mr-1 opacity-50">{analytics.currency}</span>
                                                        {(booking.agentCommission || 0).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-[var(--foreground)]">
                                                        <span className="text-[10px] font-bold mr-1 opacity-50">{analytics.currency}</span>
                                                        {booking.totalAmount.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 opacity-50">
                                                        <Calendar size={48} className="text-[var(--foreground-muted)] mb-2" />
                                                        <p className="text-sm font-bold text-[var(--foreground-muted)] uppercase tracking-widest">No Activity Found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden space-y-3">
                            {analytics.recentBookings.length > 0 ? (
                                analytics.recentBookings.map((booking) => (
                                    <div key={booking.bookingId} className="glass-card p-4 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="font-bold text-[var(--foreground)] truncate">{booking.propertyName}</p>
                                                <p className="text-[10px] text-[var(--foreground-muted)] uppercase">#{booking.bookingId.slice(-6)}</p>
                                            </div>
                                            <span className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${booking.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500" :
                                                booking.status === "pending_confirmation" ? "bg-amber-500/10 text-amber-500" :
                                                    "bg-rose-500/10 text-rose-500"
                                                }`}>
                                                {booking.status.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-1">Guest</p>
                                                <p className="text-xs font-bold text-[var(--foreground)]">{booking.guestName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-1">Date</p>
                                                <p className="text-xs font-bold text-[var(--foreground)]">{new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Commission</p>
                                                <p className="font-black text-[var(--secondary)]">{analytics.currency} {(booking.agentCommission || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Gross</p>
                                                <p className="font-black text-[var(--foreground)]">{analytics.currency} {booking.totalAmount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="glass-card p-12 text-center opacity-50">
                                    <Calendar size={32} className="mx-auto mb-2 text-[var(--foreground-muted)]" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No Activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
