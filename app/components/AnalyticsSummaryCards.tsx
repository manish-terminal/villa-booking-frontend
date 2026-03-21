"use client";

import React from 'react';
import { DollarSign, BarChart3, Diamond, TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: string;
    change: string;
    changeType: 'up' | 'down';
    icon: React.ReactNode;
    iconBgColor: string;
    labelColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    value,
    change,
    changeType,
    icon,
    iconBgColor,
    labelColor,
}) => {
    const isUp = changeType === 'up';

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${iconBgColor} rounded-2xl flex items-center justify-center shadow-sm`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {change}
                </div>
            </div>
            <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-900">{value}</h3>
            </div>
        </div>
    );
};

interface AnalyticsSummaryCardsProps {
    totalRevenue: number;
    avgCommission: number;
    totalCommission: number;
    revenueChange: number;
    avgCommissionChange: number;
    commissionChange: number;
    currency?: string;
}

const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({
    totalRevenue,
    avgCommission,
    totalCommission,
    revenueChange,
    avgCommissionChange,
    commissionChange,
    currency = "INR"
}) => {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <SummaryCard
                title="Total Revenue"
                value={formatCurrency(totalRevenue)}
                change={`${Math.abs(revenueChange).toFixed(1)}%`}
                changeType={revenueChange >= 0 ? 'up' : 'down'}
                icon={<DollarSign className="text-white" size={24} />}
                iconBgColor="bg-emerald-500"
                labelColor="text-emerald-700"
            />
            <SummaryCard
                title="Avg. Commission %"
                value={`${avgCommission.toFixed(1)}%`}
                change={`${Math.abs(avgCommissionChange).toFixed(1)} pts`}
                changeType={avgCommissionChange >= 0 ? 'up' : 'down'}
                icon={<BarChart3 className="text-white" size={24} />}
                iconBgColor="bg-amber-500"
                labelColor="text-amber-700"
            />
            <SummaryCard
                title="Total Commission"
                value={formatCurrency(totalCommission)}
                change={`${Math.abs(commissionChange).toFixed(1)}%`}
                changeType={commissionChange >= 0 ? 'up' : 'down'}
                icon={<Diamond className="text-white" size={24} />}
                iconBgColor="bg-purple-500"
                labelColor="text-purple-700"
            />
        </div>
    );
};

export default AnalyticsSummaryCards;
