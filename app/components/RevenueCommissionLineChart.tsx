"use client";

import React from 'react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { MonthlyPerformance } from '@/app/types/analytics';

interface RevenueCommissionLineChartProps {
    data: MonthlyPerformance[];
    currency?: string;
}

const CustomTooltip = ({ active, payload, label, currency = "INR" }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xl backdrop-blur-sm">
                <p className="text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs font-bold text-slate-600">
                            {entry.name}:
                        </span>
                        <span className="text-sm font-black text-slate-900 ml-auto">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const RevenueCommissionLineChart: React.FC<RevenueCommissionLineChartProps> = ({ data, currency = "INR" }) => {
    const formatYAxis = (value: number) => {
        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
        return `₹${value}`;
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 h-[400px]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                        Revenue & Commission
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Performance over time</p>
                </div>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission</span>
                    </div>
                </div>
            </div>

            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            tickFormatter={formatYAxis}
                        />
                        <Tooltip content={<CustomTooltip currency={currency} />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                        <Area
                            type="monotone"
                            dataKey="commission"
                            name="Commission"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fill="transparent"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueCommissionLineChart;
