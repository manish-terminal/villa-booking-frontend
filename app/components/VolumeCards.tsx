"use client";

import React from 'react';
import { VolumeStats } from '@/app/types/analytics';

interface VolumeCardsProps {
    stats: VolumeStats;
}

const VolumeCard = ({ title, month, type }: { title: string; month: string; type: 'highest' | 'lowest' }) => {
    const isHighest = type === 'highest';
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex-1">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4">{title}</p>
            <span className={`text-2xl font-black ${isHighest ? 'text-emerald-500' : 'text-amber-500'}`}>
                {month}
            </span>
        </div>
    );
};

const VolumeCards: React.FC<VolumeCardsProps> = ({ stats }) => {
    return (
        <div className="flex flex-col md:flex-row gap-6">
            <VolumeCard
                title="Highest Volume"
                month={stats.highestMonth}
                type="highest"
            />
            <VolumeCard
                title="Slowest Volume"
                month={stats.slowestMonth}
                type="lowest"
            />
        </div>
    );
};

export default VolumeCards;
