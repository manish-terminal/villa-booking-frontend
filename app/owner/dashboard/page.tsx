"use client";

import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { api } from "@/app/lib/api";
import { getUser } from "@/app/lib/auth";
import { OwnerAnalytics, DashboardStats } from "@/app/types/analytics";
import { APIError } from "@/app/types/auth";

// Chart colors
const COLORS = {
    primary: "#6366f1",
    purple: "#9333ea",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    muted: "#64748b",
};

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#9333ea"];

// Format currency
const formatCurrency = (value: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
};

// Stat Card Component
function StatCard({
    title,
    value,
    subtitle,
    icon,
    color = "primary",
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: "primary" | "success" | "warning" | "error";
}) {
    const colorClasses = {
        primary: "bg-indigo-500/10 text-indigo-500",
        success: "bg-emerald-500/10 text-emerald-500",
        warning: "bg-amber-500/10 text-amber-500",
        error: "bg-rose-500/10 text-rose-500",
    };

    return (
        <div className="glass-card p-4 sm:p-5 flex items-center gap-4 min-h-[100px]">
            <div className={`w-12 h-12 rounded-2xl ${colorClasses[color]} flex items-center justify-center shrink-0`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-[var(--foreground-muted)] truncate">{title}</p>
                <p className="text-lg sm:text-2xl font-bold text-[var(--foreground)] truncate">{value}</p>
                {subtitle && (
                    <p className="text-[10px] sm:text-xs text-[var(--foreground-muted)] truncate mt-0.5 opacity-70">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card p-5 h-24"></div>
                ))}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 h-80"></div>
                <div className="glass-card p-6 h-80"></div>
            </div>
        </div>
    );
}

export default function OwnerAnalyticsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchDashboardStats = async () => {
        setLoadingStats(true);
        try {
            const data = await api.getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error("Failed to fetch dashboard stats", err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getOwnerAnalytics(
                dateRange.startDate,
                dateRange.endDate
            );
            setAnalytics(data);
        } catch (err) {
            const apiError = err as APIError;
            setError(apiError.error || "Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const bookingStatusData = analytics
        ? [
            { name: "Confirmed", value: analytics.bookingsByStatus.confirmed },
            { name: "Pending", value: analytics.bookingsByStatus.pending_confirmation },
            { name: "Checked Out", value: analytics.bookingsByStatus.checked_out },
        ]
        : [];

    const paymentStatusData = analytics
        ? [
            { name: "Completed", value: analytics.paymentsByStatus.completed },
            { name: "Due", value: analytics.paymentsByStatus.due },
            { name: "Pending", value: analytics.paymentsByStatus.pending },
        ]
        : [];

    const propertyRevenueData = analytics?.propertyStats.map((p) => ({
        name: p.propertyName.length > 12 ? p.propertyName.slice(0, 12) + "..." : p.propertyName,
        revenue: p.totalRevenue,
        collected: p.totalCollected,
        bookings: p.totalBookings,
    })) || [];

    return (
        <div className="space-y-6 px-2 sm:px-4 lg:px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                        Hello, {analytics?.ownerName?.split(' ')[0] || getUser()?.name?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className="text-sm text-[var(--foreground-muted)]">
                        Real-time overview of your property portfolio
                    </p>
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center p-1 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl">
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                        className="bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)] outline-none cursor-pointer"
                    />
                    <div className="h-4 w-px bg-[var(--glass-border)] mx-1" />
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                        className="bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)] outline-none cursor-pointer"
                    />
                </div>
            </div>

            {/* Quick Summary Stats */}
            {!loadingStats && stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex flex-col items-center justify-center text-center min-h-[100px]">
                        <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest mb-1">Approvals</p>
                        <p className="text-2xl sm:text-3xl font-black text-amber-500">{stats.pendingApprovals}</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-rose-500/5 border border-rose-500/10 flex flex-col items-center justify-center text-center min-h-[100px]">
                        <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-widest mb-1">Payments</p>
                        <p className="text-2xl sm:text-3xl font-black text-rose-500">{stats.pendingPayments}</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center justify-center text-center min-h-[100px]">
                        <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mb-1">Total Due</p>
                        <p className="text-xl sm:text-2xl font-black text-emerald-500 truncate">{formatCurrency(stats.totalDueAmount, stats.currency)}</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="glass-card p-4 border-[var(--error)] bg-red-500/10">
                    <p className="text-[var(--error)]">{error}</p>
                    <button onClick={fetchAnalytics} className="link text-sm mt-2">
                        Try again
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && <LoadingSkeleton />}

            {/* Analytics Content */}
            {!loading && analytics && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Revenue"
                            value={formatCurrency(analytics.totalRevenue, analytics.currency)}
                            subtitle={`${analytics.totalBookings} bookings`}
                            color="primary"
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatCard
                            title="Collected"
                            value={formatCurrency(analytics.totalCollected, analytics.currency)}
                            subtitle={`${Math.round((analytics.totalCollected / analytics.totalRevenue) * 100 || 0)}% of total`}
                            color="success"
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatCard
                            title="Pending"
                            value={formatCurrency(analytics.totalPending, analytics.currency)}
                            subtitle="Awaiting payment"
                            color="warning"
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatCard
                            title="Properties"
                            value={analytics.totalProperties}
                            subtitle="Active listings"
                            color="primary"
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                        />
                    </div>

                    {/* Charts */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Booking Pie */}
                        <div className="glass-card p-4 sm:p-6 flex-1 min-h-[250px]">
                            <h3 className="text-sm sm:text-lg font-bold text-[var(--foreground)] mb-4">Bookings</h3>
                            <div className="h-60 sm:h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" paddingAngle={4} dataKey="value">
                                            {bookingStatusData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "1rem", fontSize: "12px" }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Payment Pie */}
                        <div className="glass-card p-4 sm:p-6 flex-1 min-h-[250px]">
                            <h3 className="text-sm sm:text-lg font-bold text-[var(--foreground)] mb-4">Payments</h3>
                            <div className="h-60 sm:h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" paddingAngle={4} dataKey="value">
                                            {paymentStatusData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "1rem", fontSize: "12px" }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Property Revenue */}
                    {propertyRevenueData.length > 0 && (
                        <div className="glass-card p-4 sm:p-6">
                            <h3 className="text-sm sm:text-lg font-bold text-[var(--foreground)] mb-4">Revenue Trends</h3>
                            <div className="h-64 sm:h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={propertyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke="var(--foreground-muted)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "1rem", fontSize: "12px" }} formatter={(v) => v !== undefined ? formatCurrency(v as number, analytics.currency) : ""} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        <Bar dataKey="revenue" name="Total" fill={COLORS.primary} radius={[6, 6, 0, 0]} barSize={20} />
                                        <Bar dataKey="collected" name="Collected" fill={COLORS.success} radius={[6, 6, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Property Table */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[var(--foreground)]">Property Performance</h3>

                        {/* Desktop Table */}
                        <div className="hidden sm:block w-full glass-card overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[var(--input-bg)] border-b border-[var(--glass-border)]">
                                        <th className="text-left py-4 px-6 text-xs font-medium text-[var(--foreground-muted)]">Property</th>
                                        <th className="text-left py-4 px-6 text-xs font-medium text-[var(--foreground-muted)]">Bookings</th>
                                        <th className="text-left py-4 px-6 text-xs font-medium text-[var(--foreground-muted)]">Revenue</th>
                                        <th className="text-left py-4 px-6 text-xs font-medium text-[var(--foreground-muted)]">Collected</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.propertyStats.map((p, i) => (
                                        <tr key={i} className="border-b border-[var(--glass-border)] hover:bg-[var(--input-bg)] transition">
                                            <td className="py-4 px-6 truncate">{p.propertyName}</td>
                                            <td className="py-4 px-6">{p.totalBookings}</td>
                                            <td className="py-4 px-6">{formatCurrency(p.totalRevenue, analytics.currency)}</td>
                                            <td className="py-4 px-6">{formatCurrency(p.totalCollected, analytics.currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden grid grid-cols-1 gap-4">
                            {analytics.propertyStats.map((p, i) => (
                                <div key={i} className="glass-card p-4">
                                    <p className="font-semibold text-[var(--foreground)]">{p.propertyName}</p>
                                    <p className="text-[10px] text-[var(--foreground-muted)]">Bookings: {p.totalBookings}</p>
                                    <p className="text-[10px] text-[var(--foreground-muted)]">Revenue: {formatCurrency(p.totalRevenue, analytics.currency)}</p>
                                    <p className="text-[10px] text-[var(--foreground-muted)]">Collected: {formatCurrency(p.totalCollected, analytics.currency)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
