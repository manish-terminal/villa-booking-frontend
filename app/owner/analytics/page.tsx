"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Calendar as LucideCalendar } from "lucide-react";
import { Calendar as PrimeCalendar } from 'primereact/calendar';
import { api } from "@/app/lib/api";
import { OwnerAnalytics } from "@/app/types/analytics";
import { APIError } from "@/app/types/auth";

// --- Date Helpers ---
const getLocalISO = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

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
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");

    // Default date boundaries
    const today = new Date();
    const firstDay = getLocalISO(new Date(today.getFullYear(), today.getMonth(), 1));
    const lastDay = getLocalISO(new Date(today.getFullYear(), today.getMonth() + 1, 0));

    const [dateRange, setDateRange] = useState({ startDate: firstDay, endDate: lastDay });

    const fetchAnalytics = useCallback(async () => {
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
    }, [dateRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Prepare stats based on selection
    const displayStats = (() => {
        if (!analytics) return null;
        if (selectedPropertyId === "all") {
            return {
                totalRevenue: analytics.totalRevenue,
                totalCollected: analytics.totalCollected,
                totalPending: analytics.totalPending,
                totalBookings: analytics.totalBookings,
                averagePrice: analytics.averagePrice || 0,
                occupancyDays: analytics.propertyStats.reduce((sum, p) => sum + (p.occupancyDays || 0), 0),
                propertyCount: analytics.totalProperties
            };
        }
        const prop = analytics.propertyStats.find(p => p.propertyId === selectedPropertyId);
        if (!prop) return null;
        return {
            totalRevenue: prop.totalRevenue,
            totalCollected: prop.totalCollected,
            totalPending: prop.totalRevenue - prop.totalCollected,
            totalBookings: prop.totalBookings,
            averagePrice: prop.averagePrice || (prop.occupancyDays > 0 ? prop.totalRevenue / prop.occupancyDays : 0),
            occupancyDays: prop.occupancyDays,
            propertyCount: 1
        };
    })();

    // Prepare chart data
    const chartData = (analytics?.propertyStats || [])
        .filter(v => selectedPropertyId === "all" || v.propertyId === selectedPropertyId)
        .map(v => ({
            id: v.propertyId,
            name: v.propertyName.split(' ')[1] || v.propertyName,
            revenue: v.totalRevenue,
            isSelected: v.propertyId === selectedPropertyId
        }));

    // Calculate average occupancy rate
    const avgOccupancyRate = displayStats
        ? Math.round((displayStats.occupancyDays / (displayStats.propertyCount * 30.5)) * 100)
        : 0;

    return (
        <div className="pb-32">
            <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Performance</h1>
                        <p className="text-slate-400 text-sm">Review your business metrics.</p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                    {/* Month Picker */}
                    <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                        <div className="flex items-center px-4 gap-2">
                            <LucideCalendar size={14} className="text-slate-400" />
                            <PrimeCalendar
                                value={new Date(dateRange.startDate)}
                                onChange={(e) => {
                                    const date = e.value as Date;
                                    if (!date) return;
                                    const y = date.getFullYear();
                                    const m = date.getMonth();
                                    const start = getLocalISO(new Date(y, m, 1));
                                    const end = getLocalISO(new Date(y, m + 1, 0));
                                    setDateRange({ startDate: start, endDate: end });
                                }}
                                view="month"
                                dateFormat="mm/yy"
                                inputClassName="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none cursor-pointer min-w-[80px] p-0 text-center"
                                className="border-none"
                            />
                        </div>
                    </div>

                    {/* Property Selector */}
                    {analytics && analytics.propertyStats.length > 0 && (
                        <div className="relative">
                            <select
                                value={selectedPropertyId}
                                onChange={(e) => setSelectedPropertyId(e.target.value)}
                                className="appearance-none bg-white border border-slate-100 rounded-[2rem] px-6 py-2.5 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#0D7A6B]/20 transition-all cursor-pointer"
                            >
                                <option value="all">All Properties</option>
                                {analytics.propertyStats.map(p => (
                                    <option key={p.propertyId} value={p.propertyId}>
                                        {p.propertyName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    )}
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
                                <BarChart data={chartData}>
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
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.isSelected ? '#10B981' : COLORS[index % COLORS.length]}
                                                fillOpacity={selectedPropertyId === 'all' || entry.isSelected ? 1 : 0.3}
                                            />
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
                            <h4 className="text-xl font-black text-slate-900">{formatCurrency(displayStats?.totalCollected || 0, analytics.currency)}</h4>
                        </div>

                        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Pending</p>
                            <h4 className="text-xl font-black text-slate-900">{formatCurrency(displayStats?.totalPending || 0, analytics.currency)}</h4>
                        </div>

                        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">ADR (Avg Day Rate)</p>
                            <h4 className="text-xl font-black text-slate-900">{formatCurrency(displayStats?.averagePrice || 0, analytics.currency)}</h4>
                        </div>

                        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Bookings</p>
                            <h4 className="text-xl font-black text-slate-900">{displayStats?.totalBookings || 0}</h4>
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
