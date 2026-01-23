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
    Cell,
} from "recharts";
import { api } from "@/app/lib/api";
import { getUser } from "@/app/lib/auth";
import { OwnerAnalytics } from "@/app/types/analytics";
import { APIError } from "@/app/types/auth";

// Custom colors for the bar chart
const COLORS = ['#0D7A6B', '#051325', '#10B981', '#3B82F6'];

// Format currency
const formatCurrency = (value: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
};

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="animate-pulse space-y-6 px-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 h-80"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 h-32"></div>
                <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 h-32"></div>
            </div>
            <div className="bg-[#051325] p-6 rounded-[2rem] h-40"></div>
        </div>
    );
}

export default function OwnerAnalyticsPage() {
    const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("this_month");
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    });

    // Period options
    const periods = [
        { id: "this_month", label: "This Month" },
        { id: "last_month", label: "Last Month" },
        { id: "last_3_months", label: "Last 3 Months" },
        { id: "all_time", label: "All Time" },
    ];

    // Update date range when period changes
    const handlePeriodChange = (periodId: string) => {
        setSelectedPeriod(periodId);
        const today = new Date();
        let startDate = new Date();

        switch (periodId) {
            case "this_month":
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case "last_month":
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                break;
            case "last_3_months":
                startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                break;
            case "all_time":
                startDate = new Date(2020, 0, 1); // From 2020
                break;
        }

        setDateRange({
            startDate: startDate.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
        });
    };

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
    const data = analytics?.propertyStats.map(v => ({
        name: v.propertyName.split(' ')[1] || v.propertyName,
        revenue: v.totalRevenue
    })) || [];

    // Calculate average occupancy rate (simplified calculation)
    const avgOccupancyRate = analytics?.propertyStats.length
        ? Math.round(
            analytics.propertyStats.reduce((sum, p) => sum + (p.occupancyDays || 0), 0) /
            analytics.propertyStats.length / 30 * 100
        ) : 0; // Default fallback

    return (
        <div className="pb-32">
            <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Performance</h1>
                        <p className="text-slate-400 text-sm">Review your business metrics.</p>
                    </div>
                </div>

                {/* Period Selector */}
                <div className="flex flex-wrap gap-2">
                    {periods.map((period) => (
                        <button
                            key={period.id}
                            onClick={() => handlePeriodChange(period.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedPeriod === period.id
                                    ? "bg-[#0D7A6B] text-white shadow-md"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-[#0D7A6B]"
                                }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 glass-card p-4 border-[var(--error)] bg-red-500/10 mb-6">
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
                <div className="px-4 space-y-6">
                    {/* Main Chart */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue by Property</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            borderRadius: '1rem',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value) => formatCurrency(value as number, analytics.currency)}
                                    />
                                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Collected</p>
                            <h4 className="text-xl font-black text-slate-900">{formatCurrency(analytics.totalCollected, analytics.currency)}</h4>
                     
                        </div>
                        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Pending</p>
                            <h4 className="text-xl font-black text-slate-900">{formatCurrency(analytics.totalPending, analytics.currency)}</h4>
                     
                        </div>
                    </div>

                    {/* Active Listings Card */}
                    <div className="bg-[#051325] p-6 rounded-[2rem] text-white">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Active Listings</span>
                            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-black">LIVE</span>
                        </div>
                        <h2 className="text-4xl font-black">{analytics.totalProperties}</h2>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                            <p className="text-xs font-medium opacity-60">Avg. occupancy rate</p>
                            <p className="text-sm font-bold">{avgOccupancyRate}%</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
