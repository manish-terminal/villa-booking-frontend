"use client";

import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { PropertyPerformance } from '@/app/types/analytics';

interface TopPerformingVillasChartProps {
    data: PropertyPerformance[];
    currency?: string;
}

const CustomTooltip = ({ active, payload, label, currency = "INR" }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-lg">
                <p className="text-xs font-black text-slate-900 mb-1">{payload[0].payload.propertyName}</p>
                <p className="text-sm font-black text-emerald-600">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

const TopPerformingVillasChart: React.FC<TopPerformingVillasChartProps> = ({ data, currency = "INR" }) => {
    const [filter, setFilter] = useState<'revenue' | 'commission'>('revenue');

    const chartData = [...data]
        .sort((a, b) => (filter === 'revenue' ? b.totalRevenue - a.totalRevenue : b.totalCommission - a.totalCommission))
        .slice(0, 5);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 h-full min-h-[450px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                        Top Performing Villas
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Ranked by {filter}</p>
                </div>

                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button
                        onClick={() => setFilter('revenue')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'revenue' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Filter: Revenue
                    </button>
                    <button
                        onClick={() => setFilter('commission')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'commission' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Filter: Commission
                    </button>
                </div>
            </div>

            <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barSize={20}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="propertyName"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                            width={120}
                        />
                        <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: '#f8fafc' }} />
                        <Bar
                            dataKey={filter === 'revenue' ? 'totalRevenue' : 'totalCommission'}
                            radius={[0, 10, 10, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={filter === 'revenue' ? '#10b981' : '#8b5cf6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TopPerformingVillasChart;
