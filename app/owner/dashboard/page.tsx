"use client";

import React, { useState, useEffect } from 'react';
import SummaryCards from '@/app/components/SummaryCards';
import { api } from '@/app/lib/api';
import { OwnerAnalytics } from '@/app/types/analytics';
import { Booking, PaymentSummary, Property } from '@/app/types/property';
import { APIError } from '@/app/types/auth';
import BookingSidebar from '@/app/components/BookingSidebar';
import BookingDetailsModal from '@/app/components/BookingDetailsModal';

import BookingCard, { BookingWithPayment } from '@/app/components/BookingCard';

const OwnerHomePage: React.FC = () => {
    const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
    const [upcomingBookings, setUpcomingBookings] = useState<BookingWithPayment[]>([]);
    const [historyBookings, setHistoryBookings] = useState<BookingWithPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

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

            // Fetch properties for editing context
            const propsRes = await api.getProperties();
            setProperties(propsRes.properties || []);

            // Fetch bookings for all properties
            const allBookings: Booking[] = [];
            for (const property of analyticsData.propertyStats) {
                try {
                    const bookingsData = await api.getBookings(property.propertyId);
                    // Filter out non-booking records (like invites) which have empty IDs
                    const validBookings = (bookingsData.bookings || []).filter(b => b.id && b.id !== "");
                    allBookings.push(...validBookings);
                } catch (err) {
                    console.error(`Failed to fetch bookings for ${property.propertyName}`, err);
                }
            }

            // Filter upcoming bookings and sort by check-in date
            const today = new Date().toISOString().split('T')[0];
            const sortedUpcoming = allBookings
                .filter(b => b.checkIn >= today)
                .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

            // Initial history (last 5 past bookings)
            const sortedHistory = allBookings
                .filter(b => b.checkIn < today)
                .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
                .slice(0, 5);

            // Fetch payment summaries for upcoming
            const upcomingWithPayments = await Promise.all(
                sortedUpcoming.map(async (booking) => {
                    try {
                        const paymentSummary = await api.getBookingPaymentStatus(booking.id);
                        return { ...booking, paymentSummary };
                    } catch (err) {
                        return booking;
                    }
                })
            );

            // Fetch payment summaries for history
            const historyWithPayments = await Promise.all(
                sortedHistory.map(async (booking) => {
                    try {
                        const paymentSummary = await api.getBookingPaymentStatus(booking.id);
                        return { ...booking, paymentSummary };
                    } catch (err) {
                        return booking;
                    }
                })
            );

            setUpcomingBookings(upcomingWithPayments);
            setHistoryBookings(historyWithPayments);
            setHasMoreHistory(allBookings.filter(b => b.checkIn < today).length > 5);
        } catch (err) {
            const apiError = err as APIError;
            setError(apiError.error || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const loadMoreHistory = async () => {
        if (loadingHistory || !analytics) return;
        setLoadingHistory(true);
        try {
            const allBookings: Booking[] = [];
            for (const property of analytics.propertyStats) {
                const bookingsData = await api.getBookings(property.propertyId);
                const validBookings = (bookingsData.bookings || []).filter(b => b.id && b.id !== "");
                allBookings.push(...validBookings);
            }

            const today = new Date().toISOString().split('T')[0];
            const startIdx = historyPage * 5;
            const nextHistory = allBookings
                .filter(b => b.checkIn < today)
                .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
                .slice(startIdx, startIdx + 5);

            const nextWithPayments = await Promise.all(
                nextHistory.map(async (booking) => {
                    try {
                        const paymentSummary = await api.getBookingPaymentStatus(booking.id);
                        return { ...booking, paymentSummary };
                    } catch (err) {
                        return booking;
                    }
                })
            );

            setHistoryBookings(prev => [...prev, ...nextWithPayments]);
            setHistoryPage(prev => prev + 1);
            setHasMoreHistory(allBookings.filter(b => b.checkIn < today).length > startIdx + 5);
        } catch (err) {
            console.error("Failed to load more history:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleEdit = (booking: BookingWithPayment) => {
        setEditingBooking(booking);
        setSelectedBooking(null);
    };

    const formatCurrency = (value: number, currency: string = "INR") => {
        const validCurrency = currency && currency.length === 3 ? currency : "INR";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: validCurrency,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
                        totalCollected={analytics.totalCollected}
                        totalBookings={analytics.totalBookings}
                        totalDue={analytics.totalPending || 0}
                        currency={analytics.currency}
                    />

                    {/* Upcoming Bookings */}
                    <div className="mt-4 px-4">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                Upcoming Bookings ({upcomingBookings.length})
                            </h3>
                            <button
                                onClick={() => window.location.href = '/owner/bookings'}
                                className="text-[#0D7A6B] text-xs font-bold px-3 py-1 bg-[#0D7A6B]/5 rounded-full"
                            >
                                View Calendar
                            </button>
                        </div>

                        {upcomingBookings.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
                                <p className="text-slate-400 text-sm">No upcoming bookings</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingBookings.map(booking => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        formatDate={formatDate}
                                        formatCurrency={formatCurrency}
                                        onEdit={() => handleEdit(booking)}
                                        onSelect={() => setSelectedBooking(booking)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Booking History */}
                    <div className="mt-12 px-4">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                Booking History
                            </h3>
                        </div>

                        {historyBookings.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
                                <p className="text-slate-400 text-sm">No past bookings found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {historyBookings.map(booking => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        formatDate={formatDate}
                                        formatCurrency={formatCurrency}
                                        isHistory
                                        onEdit={() => handleEdit(booking)}
                                        onSelect={() => setSelectedBooking(booking)}
                                    />
                                ))}

                                {hasMoreHistory && (
                                    <button
                                        onClick={loadMoreHistory}
                                        disabled={loadingHistory}
                                        className="w-full py-4 bg-white border border-slate-100 rounded-[2rem] text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                                    >
                                        {loadingHistory ? "Loading..." : "Load More Activity"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modals */}
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onUpdate={fetchData}
                    onEdit={(booking) => {
                        setSelectedBooking(null);
                        setEditingBooking(booking);
                    }}
                />
            )}

            {editingBooking && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setEditingBooking(null)}
                    />
                    <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <BookingSidebar
                            bookingToEdit={editingBooking}
                            property={properties.find(p => p.id === editingBooking.propertyId)!}
                            checkIn={new Date(editingBooking.checkIn)}
                            checkOut={new Date(editingBooking.checkOut)}
                            onCancel={() => setEditingBooking(null)}
                            onSuccess={() => {
                                setEditingBooking(null);
                                fetchData();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

/* removed inline helpers and BookingCard */

export default OwnerHomePage;
