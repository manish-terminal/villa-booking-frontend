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
        <div className="glass-card p-4 sm:p-5 flex items-center gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card p-5 h-24">
                        <div className="h-4 bg-[var(--input-bg)] rounded w-20 mb-2"></div>
                        <div className="h-8 bg-[var(--input-bg)] rounded w-32"></div>
                    </div>
                ))}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 h-80">
                    <div className="h-6 bg-[var(--input-bg)] rounded w-40 mb-4"></div>
                    <div className="h-56 bg-[var(--input-bg)] rounded"></div>
                </div>
                <div className="glass-card p-6 h-80">
                    <div className="h-6 bg-[var(--input-bg)] rounded w-40 mb-4"></div>
                    <div className="h-56 bg-[var(--input-bg)] rounded"></div>
                </div>
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">Dashboard</h1>
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

            {/* Quick Summary Dashboard */}
            {!loadingStats && stats && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="p-3 sm:p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-widest mb-1">Check-ins</p>
                        <p className="text-2xl sm:text-3xl font-black text-indigo-500">{stats.todayCheckIns}</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-3xl bg-purple-500/5 border border-purple-500/10 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-bold text-purple-500/60 uppercase tracking-widest mb-1">Check-outs</p>
                        <p className="text-2xl sm:text-3xl font-black text-purple-500">{stats.todayCheckOuts}</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest mb-1">Approvals</p>
                        <p className="text-2xl sm:text-3xl font-black text-amber-500">{stats.pendingApprovals}</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-3xl bg-rose-500/5 border border-rose-500/10 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-widest mb-1">Payments</p>
                        <p className="text-2xl sm:text-3xl font-black text-rose-500">{stats.pendingPayments}</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center justify-center text-center col-span-2 lg:col-span-1">
                        <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mb-1">Total Due</p>
                        <p className="text-xl sm:text-2xl font-black text-emerald-500 truncate">{formatCurrency(stats.totalDueAmount, stats.currency)}</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="glass-card p-4 border-[var(--error)] bg-red-500/10">
                    <p className="text-[var(--error)]">{error}</p>
                    <button onClick={fetchAnalytics} className="link text-sm mt-2">
                        Try again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && <LoadingSkeleton />}

            {/* Content */}
            {!loading && analytics && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Revenue"
                            value={formatCurrency(analytics.totalRevenue, analytics.currency)}
                            subtitle={`${analytics.totalBookings} bookings`}
                            color="primary"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Collected"
                            value={formatCurrency(analytics.totalCollected, analytics.currency)}
                            subtitle={`${Math.round((analytics.totalCollected / analytics.totalRevenue) * 100 || 0)}% of total`}
                            color="success"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Pending"
                            value={formatCurrency(analytics.totalPending, analytics.currency)}
                            subtitle="Awaiting payment"
                            color="warning"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Properties"
                            value={analytics.totalProperties}
                            subtitle="Active listings"
                            color="primary"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            }
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Booking Status Pie Chart */}
                        <div className="glass-card p-4 sm:p-6">
                            <h3 className="text-sm sm:text-lg font-bold text-[var(--foreground)] mb-4">
                                Bookings
                            </h3>
                            <div className="h-60 sm:h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bookingStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="60%"
                                            outerRadius="85%"
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {bookingStatusData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "var(--glass-bg)",
                                                border: "1px solid var(--glass-border)",
                                                borderRadius: "1rem",
                                                fontSize: "12px",
                                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Payment Status Pie Chart */}
                        <div className="glass-card p-4 sm:p-6">
                            <h3 className="text-sm sm:text-lg font-bold text-[var(--foreground)] mb-4">
                                Payments
                            </h3>
                            <div className="h-60 sm:h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="60%"
                                            outerRadius="85%"
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {paymentStatusData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "var(--glass-bg)",
                                                border: "1px solid var(--glass-border)",
                                                borderRadius: "1rem",
                                                fontSize: "12px",
                                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Property Revenue Bar Chart */}
                    {propertyRevenueData.length > 0 && (
                        <div className="glass-card p-4 sm:p-6">
                            <h3 className="text-sm sm:text-lg font-bold text-[var(--foreground)] mb-4">
                                Revenue Trends
                            </h3>
                            <div className="h-64 sm:h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={propertyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke="var(--foreground-muted)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "var(--glass-bg)",
                                                border: "1px solid var(--glass-border)",
                                                borderRadius: "1rem",
                                                fontSize: "12px",
                                            }}
                                            formatter={(value) => value !== undefined ? formatCurrency(value as number, analytics.currency) : ""}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        <Bar dataKey="revenue" name="Total" fill={COLORS.primary} radius={[6, 6, 0, 0]} barSize={20} />
                                        <Bar dataKey="collected" name="Collected" fill={COLORS.success} radius={[6, 6, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Property Stats Table/Cards */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[var(--foreground)]">Property Performance</h3>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden sm:block glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[var(--input-bg)] border-b border-[var(--glass-border)]">
                                            <th className="text-left py-4 px-6 text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Property</th>
                                            <th className="text-right py-4 px-6 text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Bookings</th>
                                            <th className="text-right py-4 px-6 text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Revenue</th>
                                            <th className="text-right py-4 px-6 text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Collected</th>
                                            <th className="text-right py-4 px-6 text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Occupancy</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glass-border)]">
                                        {analytics.propertyStats.map((property) => (
                                            <tr key={property.propertyId} className="hover:bg-[var(--input-bg)]/50 transition-colors">
                                                <td className="py-4 px-6 text-[var(--foreground)] font-semibold">{property.propertyName}</td>
                                                <td className="py-4 px-6 text-right text-[var(--foreground)]">{property.totalBookings}</td>
                                                <td className="py-4 px-6 text-right text-[var(--foreground)] font-medium">{formatCurrency(property.totalRevenue, analytics.currency)}</td>
                                                <td className="py-4 px-6 text-right text-emerald-500 font-bold">{formatCurrency(property.totalCollected, analytics.currency)}</td>
                                                <td className="py-4 px-6 text-right text-[var(--foreground-muted)]">{property.occupancyDays} days</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile View */}
                        <div className="sm:hidden space-y-3">
                            {analytics.propertyStats.map((property) => (
                                <div key={property.propertyId} className="glass-card p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-[var(--foreground)]">{property.propertyName}</span>
                                        <span className="px-2 py-1 rounded-lg bg-[var(--input-bg)] text-xs text-[var(--foreground-muted)]">
                                            {property.totalBookings} bookings
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-[var(--foreground-muted)] mb-1">Revenue</p>
                                            <p className="font-bold text-[var(--foreground)]">{formatCurrency(property.totalRevenue, analytics.currency)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-widest text-[var(--foreground-muted)] mb-1">Collected</p>
                                            <p className="font-bold text-emerald-500">{formatCurrency(property.totalCollected, analytics.currency)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-[var(--foreground-muted)] mb-1">Occupancy</p>
                                            <p className="font-medium text-[var(--foreground)]">{property.occupancyDays} days</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
