"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/app/lib/api";
import { getUser } from "@/app/lib/auth";
import { AgentAnalytics, PropertyPerformance } from "@/app/types/analytics";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import {
    Calendar,
} from "lucide-react";
import SummaryCards from "@/app/components/SummaryCards";
import CommissionChart from "@/app/components/CommissionChart";

// --- Date Helpers ---
const getLocalISO = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

export default function AgentAnalyticsPage() {
    const { showToast } = useToast();


    // Default date boundaries
    const today = new Date();
    const firstDay = getLocalISO(new Date(today.getFullYear(), today.getMonth(), 1));
    const lastDay = getLocalISO(new Date(today.getFullYear(), today.getMonth() + 1, 0));

    // State
    const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);
    const [performanceData, setPerformanceData] = useState<PropertyPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({ startDate: firstDay, endDate: lastDay });

    const fetchAnalytics = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);

        try {
            // Fetch Summary Analytics & Performance
            const [analyticsData, perfResponse] = await Promise.all([
                api.getAgentAnalytics(dateRange.startDate, dateRange.endDate),
                api.getAgentPropertyPerformance(dateRange.startDate, dateRange.endDate)
            ]);
            setAnalytics(analyticsData);
            setPerformanceData(perfResponse.data || []);
            setError(null);
        } catch (err) {
            const apiError = err as APIError;
            setError(apiError.error || "Failed to load analytics");
            showToast(apiError.error || "Failed to load analytics", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast, dateRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) return (
        <div className="animate-pulse space-y-6 max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="bg-white/50 rounded-[2rem] h-32"></div>)}
            </div>
            <div className="px-4">
                <div className="bg-white/50 rounded-[2rem] h-96"></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-1 pt-4">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 mb-1">
                        Financial Analytics
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Detailed breakdown of your earnings and performance</p>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-[2rem] shadow-sm self-start lg:self-auto">
                    <div className="flex items-center px-3 gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <input
                            type="month"
                            value={dateRange.startDate.slice(0, 7)}
                            onChange={(e) => {
                                if (!e.target.value) return;
                                const [y, m] = e.target.value.split('-').map(Number);
                                const start = getLocalISO(new Date(y, m - 1, 1));
                                const end = getLocalISO(new Date(y, m, 0));
                                setDateRange({ startDate: start, endDate: end });
                            }}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none cursor-pointer min-w-[100px]"
                        />
                    </div>
                </div>
            </div>

            {error ? (
                <div className="mx-4 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                    <p className="text-red-600 text-sm font-bold">{error}</p>
                    <button onClick={() => fetchAnalytics(true)} className="text-red-600 text-xs mt-2 underline font-bold">Retry</button>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    {analytics && (
                        <SummaryCards
                            totalRevenue={analytics.totalBookingValue || 0}
                            totalCollected={analytics.totalCollected || 0}
                            totalBookings={analytics.totalBookings || 0}
                            totalDue={(analytics.totalBookingValue || 0) - (analytics.totalCollected || 0)}
                            totalCommission={analytics.totalCommission}
                            currency={analytics.currency}
                            hideVolume
                        />
                    )}

                    {/* Performance Chart */}
                    {performanceData && performanceData.length > 0 && (
                        <div className="px-4">
                            <CommissionChart data={performanceData} currency={analytics?.currency} />
                        </div>
                    )}

                    {!performanceData || performanceData.length === 0 && (
                        <div className="px-4">
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center">
                                <p className="text-slate-400 font-medium">No performance data available for this period</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
