import React from 'react';
import { Booking, PaymentSummary } from '../types/property';

export interface BookingWithPayment extends Booking {
    paymentSummary?: PaymentSummary;
}

interface BookingCardProps {
    booking: BookingWithPayment;
    formatDate: (d: string) => string;
    formatCurrency: (v: number, c?: string) => string;
    isHistory?: boolean;
    onEdit: () => void;
    onSelect: () => void;
    commission?: number;
}

const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'settled' || statusLower === 'confirmed' || statusLower === 'completed' || statusLower === 'checked_in' || statusLower === 'checked_out') {
        return 'SETTLED';
    } else if (statusLower === 'partial') {
        return 'PARTIAL';
    } else if (statusLower === 'pending' || statusLower === 'pending_confirmation' || statusLower === 'due') {
        return 'PENDING';
    }
    return status.toUpperCase();
};

const getStatusStyle = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'settled' || statusLower === 'confirmed' || statusLower === 'completed' || statusLower === 'checked_in' || statusLower === 'checked_out') {
        return 'bg-emerald-50 text-emerald-700';
    } else if (statusLower === 'partial') {
        return 'bg-blue-50 text-blue-700';
    } else if (statusLower === 'pending' || statusLower === 'pending_confirmation' || statusLower === 'due') {
        return 'bg-amber-50 text-amber-700';
    }
    return 'bg-slate-50 text-slate-500';
};

const BookingCard: React.FC<BookingCardProps> = ({
    booking,
    formatDate,
    formatCurrency,
    isHistory,
    onEdit,
    onSelect,
    commission
}) => {
    const hasBalance = booking.paymentSummary && booking.paymentSummary.totalDue > 0;

    return (
        <div
            className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden pl-6 pr-6 py-6 ${isHistory ? 'opacity-70' : ''}`}
        >
            {/* Side Accent Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[2rem] ${isHistory ? 'bg-slate-200' : 'bg-[#0D7A6B]'}`}></div>

            <div className="flex justify-between items-start mb-1">
                <div>
                    <h4 className="font-bold text-slate-900 text-lg leading-tight">
                        {booking.guestName}
                    </h4>
                    <p className="text-[14px] text-slate-400 font-medium mt-1">
                        {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                    </p>
                    <p className="text-[10px] text-[#0D7A6B] font-bold uppercase tracking-wider mt-1">
                        {booking.propertyName}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className={`text-[10px] font-black px-3 py-1 rounded-full ${getStatusStyle(booking.paymentSummary?.status || booking.status)}`}>
                        {getStatusText(booking.paymentSummary?.status || booking.status)}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="text-[9px] font-black text-white bg-slate-900 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    {hasBalance && (
                        <div className="text-[8px] font-black text-amber-500 uppercase tracking-tighter mt-1">
                            Pending {formatCurrency(booking.paymentSummary?.totalDue || 0, booking.currency)}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 flex items-center justify-start gap-10 border-t border-slate-50 pt-5">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Total
                    </span>
                    <span className="text-base font-black text-slate-900">
                        {formatCurrency(booking.paymentSummary?.totalAmount ?? booking.totalAmount, booking.currency)}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Paid
                    </span>
                    <span className="text-base font-black text-[#0D7A6B]">
                        {formatCurrency(booking.paymentSummary?.totalPaid || 0, booking.currency)}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Due
                    </span>
                    <span className="text-base font-black text-amber-600">
                        {formatCurrency(booking.paymentSummary?.totalDue ?? booking.totalAmount, booking.currency)}
                    </span>
                </div>
            </div>

            {/* Commission Row (Agent Only) */}
            {commission !== undefined && commission > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50/50 flex justify-between items-center bg-indigo-50/30 rounded-xl px-3 py-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                        My Commission
                    </span>
                    <span className="text-sm font-black text-indigo-600">
                        {formatCurrency(commission, booking.currency)}
                    </span>
                </div>
            )}

            <button
                onClick={onSelect}
                className="mt-4 w-full py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-colors"
            >
                View Transhistory & Invoice
            </button>
        </div>
    );
};

export default BookingCard;
