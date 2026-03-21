"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/app/lib/api";
import { AgentAnalytics, PropertyPerformance } from "@/app/types/analytics";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import {
    Calendar as LucideCalendar,
    ChevronDown,
    Diamond
} from "lucide-react";
import { Calendar as PrimeCalendar } from 'primereact/calendar';
import AnalyticsSummaryCards from "@/app/components/AnalyticsSummaryCards";
import RevenueCommissionLineChart from "@/app/components/RevenueCommissionLineChart";
import TopPerformingVillasChart from "@/app/components/TopPerformingVillasChart";
import VolumeCards from "@/app/components/VolumeCards";
import VillaEarningTable from "@/app/components/VillaEarningTable";

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
        <div className="animate-pulse space-y-6 max-w-7xl mx-auto p-8">
            <div className="h-10 w-64 bg-slate-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-[2rem] h-40"></div>)}
            </div>
            <div className="bg-white rounded-[2rem] h-96"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 p-8">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Financial Analytics
                    </h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                        Performance metrics with dynamic commission tracking
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                        <div className="flex items-center px-4 gap-2">
                            <LucideCalendar size={14} className="text-slate-400" />
                            <PrimeCalendar
                                value={new Date(dateRange.startDate + "T00:00:00")}
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
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem]">
                    <p className="text-red-600 text-sm font-black uppercase tracking-widest">{error}</p>
                    <button onClick={() => fetchAnalytics(true)} className="text-red-600 text-xs mt-3 underline font-black uppercase tracking-widest">Retry</button>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Summary Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Monthly Financial Snapshot</h2>
                            <div className="h-px bg-slate-100 w-full" />
                        </div>
                        {analytics && (
                            <AnalyticsSummaryCards
                                totalRevenue={analytics.totalBookingValue}
                                avgCommission={analytics.totalBookingValue > 0 ? (analytics.totalCommission / analytics.totalBookingValue) * 100 : 0}
                                totalCommission={analytics.totalCommission}
                                revenueChange={analytics.deltas.revenueChange}
                                avgCommissionChange={analytics.deltas.avgCommissionChange}
                                commissionChange={analytics.deltas.commissionChange}
                                currency={analytics.currency}
                            />
                        )}
                    </div>

                    {/* Chart Section */}
                    {analytics && (
                        <div className="px-4">
                            <RevenueCommissionLineChart
                                data={analytics.monthlyPerformance}
                                currency={analytics.currency}
                            />
                        </div>
                    )}

                    {/* Detailed Performance Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
                        <TopPerformingVillasChart
                            data={performanceData}
                            currency={analytics?.currency}
                        />
                        <div className="space-y-8 flex flex-col justify-between">
                            {analytics && <VolumeCards stats={analytics.volumeStats} />}
                            <div className="bg-[#0D7A6B]/5 rounded-[2rem] p-8 border border-[#0D7A6B]/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 text-[#0D7A6B]/10 rotate-12 group-hover:rotate-0 transition-transform">
                                    <Diamond size={80} />
                                </div>
                                <h4 className="text-sm font-black text-[#0D7A6B] uppercase tracking-widest mb-2">Pro Tip</h4>
                                <p className="text-xs font-bold text-[#0D7A6B]/70 leading-relaxed max-w-[240px]">
                                    Review your property-level yields below to identify high-performing villas for the upcoming peak season.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    {performanceData && performanceData.length > 0 && (
                        <div className="px-4">
                            <VillaEarningTable
                                data={performanceData}
                                currency={analytics?.currency}
                            />
                        </div>
                    )}

                    {(!performanceData || performanceData.length === 0) && (
                        <div className="px-4">
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-16 text-center">
                                <p className="text-slate-400 font-black uppercase tracking-widest">No transaction data available for this period</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
