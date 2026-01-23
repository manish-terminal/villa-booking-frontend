"use client";

import React, { useState, useEffect } from 'react';
import SummaryCards from '@/app/components/SummaryCards';
import { api } from '@/app/lib/api';
import { OwnerAnalytics } from '@/app/types/analytics';
import { Booking, PaymentSummary } from '@/app/types/property';
import { APIError } from '@/app/types/auth';

interface BookingWithPayment extends Booking {
    paymentSummary?: PaymentSummary;
}

const OwnerHomePage: React.FC = () => {
    const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
    const [bookings, setBookings] = useState<BookingWithPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch analytics for summary cards
            const analyticsData = await api.getOwnerAnalytics();
            setAnalytics(analyticsData);

            // Fetch bookings for all properties
            const allBookings: Booking[] = [];
            for (const property of analyticsData.propertyStats) {
                try {
                    const bookingsData = await api.getBookings(property.propertyId);
                    allBookings.push(...bookingsData.bookings);
                } catch (err) {
                    console.error(`Failed to fetch bookings for ${property.propertyName}`, err);
                }
            }

            // Filter upcoming bookings and sort by check-in date
            const today = new Date().toISOString().split('T')[0];
            const upcomingBookings = allBookings
                .filter(b => b.checkIn >= today)
                .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

            // Fetch payment summaries for each booking
            const bookingsWithPayments = await Promise.all(
                upcomingBookings.map(async (booking) => {
                    try {
                        const paymentSummary = await api.getBookingPaymentStatus(booking.id);
                        return { ...booking, paymentSummary };
                    } catch (err) {
                        console.error(`Failed to fetch payment for booking ${booking.id}`, err);
                        return booking;
                    }
                })
            );

            setBookings(bookingsWithPayments);
        } catch (err) {
            const apiError = err as APIError;
            setError(apiError.error || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number, currency: string = "INR") => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getStatusStyle = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'completed' || statusLower === 'confirmed') {
            return 'bg-emerald-50 text-emerald-700';
        } else if (statusLower === 'partial' || statusLower === 'pending') {
            return 'bg-amber-50 text-amber-700';
        }
        return 'bg-slate-50 text-slate-500';
    };

    return (
        <div className="pb-32">
            <div className="p-4 pt-4">
                <h1 className="text-2xl font-black text-slate-900 px-2 mb-1">StayXL Dashboard</h1>
                <p className="text-slate-400 text-sm px-2 mb-6 font-medium">Overview of all properties</p>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 px-2 mb-6">
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={fetchData}
                            className="text-red-600 text-xs mt-2 font-bold underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-2 gap-4 px-4">
                        <div className="bg-white rounded-[2rem] border border-slate-100 h-28"></div>
                        <div className="bg-white rounded-[2rem] border border-slate-100 h-28"></div>
                    </div>
                    <div className="px-4 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 h-40"></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Content */}
            {!loading && analytics && (
                <>
                    <SummaryCards
                        totalRevenue={analytics.totalRevenue}
                        totalBookings={analytics.totalBookings}
                        currency={analytics.currency}
                    />

                    {/* Upcoming Bookings */}
                    <div className="mt-4 px-4">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                Upcoming Bookings ({bookings.length})
                            </h3>
                            <button
                                onClick={() => window.location.href = '/owner/bookings'}
                                className="text-[#0D7A6B] text-xs font-bold px-3 py-1 bg-[#0D7A6B]/5 rounded-full"
                            >
                                View Calendar
                            </button>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
                                <p className="text-slate-400 text-sm">No upcoming bookings</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden pl-6 pr-6 py-6"
                                    >
                                        {/* Side Accent Bar */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0D7A6B] rounded-l-[2rem]"></div>

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

                                            <div className={`text-[10px] font-black px-3 py-1 rounded-full ${getStatusStyle(booking.paymentSummary?.status || booking.status)}`}>
                                                {(booking.paymentSummary?.status || booking.status).toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-start gap-10 border-t border-slate-50 pt-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                    Total
                                                </span>
                                                <span className="text-base font-black text-slate-900">
                                                    {formatCurrency(booking.paymentSummary?.totalAmount || booking.totalAmount, booking.currency)}
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
                                                    {formatCurrency(booking.paymentSummary?.totalDue || booking.totalAmount, booking.currency)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default OwnerHomePage;
