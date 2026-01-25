import React from 'react';

interface SummaryCardsProps {
    totalRevenue: number;
    totalCollected: number;
    totalBookings: number;
    totalDue?: number;
    totalCommission?: number;
    currency?: string;
    hideVolume?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
    totalRevenue,
    totalCollected,
    totalBookings,
    totalDue = 0,
    totalCommission,
    currency = "INR",
    hideVolume = false
}) => {
    const formatCurrency = (value: number) => {
        const validCurrency = currency && currency.length === 3 ? currency : "INR";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: validCurrency,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
            {/* Total Revenue Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5">
                <div className="w-10 h-10 bg-[#0D7A6B]/10 text-[#0D7A6B] rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Gross Revenue</p>
                <h4 className="text-xl font-black text-slate-900 mt-1">{formatCurrency(totalRevenue)}</h4>
            </div>

            {/* Total Collected Card */}
            <div className="bg-emerald-50 rounded-[2rem] border border-emerald-100 shadow-sm p-5">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-[10px] uppercase font-black text-emerald-700/60 tracking-wider">Total Received</p>
                <h4 className="text-xl font-black text-emerald-700 mt-1">{formatCurrency(totalCollected)}</h4>
            </div>

            {/* Total Due Card */}
            <div className="bg-amber-50 rounded-[2rem] border border-amber-100 shadow-sm p-5">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-[10px] uppercase font-black text-amber-700/60 tracking-wider">Due Amount</p>
                <h4 className="text-xl font-black text-amber-700 mt-1">{formatCurrency(totalDue)}</h4>
            </div>

            {/* Total Commission Card (Optional) */}
            {totalCommission !== undefined && (
                <div className="bg-purple-50 rounded-[2rem] border border-purple-100 shadow-sm p-5">
                    <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-purple-500/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-[10px] uppercase font-black text-purple-700/60 tracking-wider">My Commission</p>
                    <h4 className="text-xl font-black text-purple-700 mt-1">{formatCurrency(totalCommission)}</h4>
                </div>
            )}


            {/* Total Bookings Card */}
            {!hideVolume && (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Stay Volume</p>
                    <h4 className="text-xl font-black text-slate-900 mt-1">{totalBookings}</h4>
                </div>
            )}
        </div>
    );
};

export default SummaryCards;
