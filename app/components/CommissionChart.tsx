"use client";

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { PropertyPerformance } from '@/app/types/analytics';

interface CommissionChartProps {
    data: PropertyPerformance[];
    currency?: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        color: string;
        name: string;
        value: number;
    }>;
    label?: string;
    currency?: string;
}

const CustomTooltip = ({ active, payload, label, currency = "INR" }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-100 shadow-xl">
                <p className="text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs font-bold text-slate-600">
                            {entry.name}:
                        </span>
                        <span className="text-sm font-black text-slate-900">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CommissionChart: React.FC<CommissionChartProps> = ({ data, currency = "INR" }) => {
    if (!data || data.length === 0) return null;

    // Formatting large numbers for axis
    const formatYAxis = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value.toString();
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8 h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                        Revenue & Commission
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Performance by Property</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        <span className="text-[10px] font-bold text-slate-400">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="text-[10px] font-bold text-slate-400">Commission</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 10,
                        left: 0,
                        bottom: 5,
                    }}
                    barGap={4}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="propertyName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                        dy={10}
                        interval={0}
                        textAnchor="end"
                        height={60}
                        angle={-25} // Slight angle for long names
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                        tickFormatter={formatYAxis}
                    />
                    <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: '#f8fafc' }} />
                    <Bar
                        dataKey="totalRevenue"
                        name="Gross Revenue"
                        fill="#e2e8f0"
                        radius={[6, 6, 0, 0]}
                        barSize={16}
                    />
                    <Bar
                        dataKey="totalCommission"
                        name="Commission"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                        barSize={16}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CommissionChart;
