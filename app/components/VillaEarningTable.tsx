"use client";

import React from 'react';
import { PropertyPerformance } from '@/app/types/analytics';
import Image from 'next/image';

interface VillaEarningTableProps {
    data: PropertyPerformance[];
    currency?: string;
}

const VillaEarningTable: React.FC<VillaEarningTableProps> = ({ data, currency = "INR" }) => {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    Villa Earning Metrics
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Comparative breakdown of property-level yields</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Property Name</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Bookings</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Revenue</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">My Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="px-8 py-5 border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden relative border border-slate-100">
                                            {/* We don't have images here, using property name icon as fallback */}
                                            <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-400">
                                                {item.propertyName.substring(0, 2).toUpperCase()}
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{item.propertyName}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 border-b border-slate-50">
                                    <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {item.bookingCount} Stays
                                    </span>
                                </td>
                                <td className="px-8 py-5 border-b border-slate-50 text-right">
                                    <span className="text-sm font-black text-slate-900">{formatCurrency(item.totalRevenue)}</span>
                                </td>
                                <td className="px-8 py-5 border-b border-slate-50 text-right">
                                    <span className="text-sm font-black text-purple-600">{formatCurrency(item.totalCommission)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VillaEarningTable;
