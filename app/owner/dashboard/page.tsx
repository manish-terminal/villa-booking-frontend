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
import { OwnerAnalytics } from "@/app/types/analytics";
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
        primary: "from-indigo-500 to-purple-600 shadow-indigo-500/30",
        success: "from-green-500 to-emerald-600 shadow-green-500/30",
        warning: "from-amber-500 to-orange-600 shadow-amber-500/30",
        error: "from-red-500 to-rose-600 shadow-red-500/30",
    };

    return (
        <div className="glass-card p-5 animate-fade-in">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-[var(--foreground-muted)] mb-1">{title}</p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-[var(--foreground-muted)] mt-1">{subtitle}</p>
                    )}
                </div>
                <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
                >
                    {icon}
                </div>
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
    const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Analytics</h1>
                    <p className="text-[var(--foreground-muted)]">
                        Overview of your properties and bookings
                    </p>
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                        className="glass-input px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                    <span className="text-[var(--foreground-muted)]">to</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                        className="glass-input px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                </div>
            </div>

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
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Collected"
                            value={formatCurrency(analytics.totalCollected, analytics.currency)}
                            subtitle={`${Math.round((analytics.totalCollected / analytics.totalRevenue) * 100 || 0)}% of total`}
                            color="success"
                            icon={
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Pending"
                            value={formatCurrency(analytics.totalPending, analytics.currency)}
                            subtitle="Awaiting payment"
                            color="warning"
                            icon={
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Properties"
                            value={analytics.totalProperties}
                            subtitle="Active listings"
                            color="primary"
                            icon={
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            }
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Booking Status Pie Chart */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                                Bookings by Status
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bookingStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {bookingStatusData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "var(--glass-bg)",
                                                border: "1px solid var(--glass-border)",
                                                borderRadius: "0.75rem",
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Payment Status Pie Chart */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                                Payments by Status
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {paymentStatusData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "var(--glass-bg)",
                                                border: "1px solid var(--glass-border)",
                                                borderRadius: "0.75rem",
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Property Revenue Bar Chart */}
                    {propertyRevenueData.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                                Revenue by Property
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={propertyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                                        <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={12} />
                                        <YAxis stroke="var(--foreground-muted)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "var(--glass-bg)",
                                                border: "1px solid var(--glass-border)",
                                                borderRadius: "0.75rem",
                                            }}
                                            formatter={(value) => value !== undefined ? formatCurrency(value as number, analytics.currency) : ""}
                                        />
                                        <Legend />
                                        <Bar dataKey="revenue" name="Total Revenue" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="collected" name="Collected" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Property Stats Table */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                            Property Performance
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--glass-border)]">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">Property</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">Bookings</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">Revenue</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">Collected</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">Occupancy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.propertyStats.map((property) => (
                                        <tr key={property.propertyId} className="border-b border-[var(--glass-border)] hover:bg-[var(--input-bg)] transition-colors">
                                            <td className="py-3 px-4 text-[var(--foreground)] font-medium">{property.propertyName}</td>
                                            <td className="py-3 px-4 text-right text-[var(--foreground)]">{property.totalBookings}</td>
                                            <td className="py-3 px-4 text-right text-[var(--foreground)]">{formatCurrency(property.totalRevenue, analytics.currency)}</td>
                                            <td className="py-3 px-4 text-right text-[var(--success)]">{formatCurrency(property.totalCollected, analytics.currency)}</td>
                                            <td className="py-3 px-4 text-right text-[var(--foreground-muted)]">{property.occupancyDays} days</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
