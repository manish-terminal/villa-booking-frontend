"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/app/lib/api";
import { Property, OccupiedRange, Booking } from "@/app/types/property";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import Calendar from "@/app/components/Calendar";
import BookingSidebar from "@/app/components/BookingSidebar";
import BookingDetailsModal from "@/app/components/BookingDetailsModal";

// Format currency
const formatCurrency = (value: number, currency: string = "INR") => {
    const validCurrency = currency && currency.length === 3 ? currency : "INR";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: validCurrency,
        maximumFractionDigits: 0,
    }).format(value);
};

// Format date
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function BookingsPage() {
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const initialPropertyId = searchParams.get('propertyId') || '';

    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialPropertyId);
    const [occupiedRanges, setOccupiedRanges] = useState<OccupiedRange[]>([]);
    const [loading, setLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Selection state for Calendar view
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);

    const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

    // Fetch all properties on mount
    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const response = await api.getProperties();
                setProperties(response.properties || []);
                if (response.properties?.length > 0) {
                    const defaultId = initialPropertyId || response.properties[0].id;
                    setSelectedPropertyId(defaultId);
                }
            } catch (err) {
                const apiError = err as APIError;
                setError(apiError.error || "Failed to load properties");
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, [initialPropertyId]);

    // Fetch calendar and bookings when property changes
    useEffect(() => {
        if (!selectedPropertyId) return;

        const fetchData = async () => {
            setCalendarLoading(true);
            try {
                const [calRes, bookRes] = await Promise.all([
                    api.getPropertyCalendar(selectedPropertyId),
                    api.getBookings(selectedPropertyId)
                ]);
                setOccupiedRanges(calRes.occupied || []);
                const validBookings = (bookRes.bookings || []).filter((b: Booking) =>
                    b.guestName && b.guestName.trim() !== '' &&
                    b.checkIn && new Date(b.checkIn).getFullYear() > 2000
                );
                setBookings(validBookings);
                setCheckIn(null);
                setCheckOut(null);
            } catch (err) {
                const apiError = err as APIError;
                showToast(apiError.error || "Failed to load data", "error");
            } finally {
                setCalendarLoading(false);
            }
        };
        fetchData();
    }, [selectedPropertyId]);

    // Show booking modal when dates are selected
    useEffect(() => {
        if (checkIn && checkOut) {
            setShowBookingModal(true);
        }
    }, [checkIn, checkOut]);

    const refreshData = async () => {
        if (!selectedPropertyId) return;
        try {
            const [calRes, bookRes] = await Promise.all([
                api.getPropertyCalendar(selectedPropertyId),
                api.getBookings(selectedPropertyId)
            ]);
            setOccupiedRanges(calRes.occupied || []);
            const validBookings = (bookRes.bookings || []).filter((b: Booking) =>
                b.guestName && b.guestName.trim() !== '' &&
                b.checkIn && new Date(b.checkIn).getFullYear() > 2000
            );
            setBookings(validBookings);

            if (selectedBooking) {
                const updated = validBookings.find((b: Booking) => b.id === selectedBooking.id);
                if (updated) setSelectedBooking(updated);
            }
        } catch (err) {
            console.error("Refresh failed", err);
        }
    };

    const handleRangeSelect = (start: Date | null, end: Date | null) => {
        setCheckIn(start);
        setCheckOut(end);
    };

    const getStatusStyle = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'completed' || statusLower === 'confirmed' || statusLower === 'settled') {
            return 'bg-emerald-50 text-emerald-700';
        } else if (statusLower === 'partial' || statusLower === 'pending' || statusLower === 'pending_confirmation') {
            return 'bg-amber-50 text-amber-700';
        }
        return 'bg-slate-50 text-slate-500';
    };

    // Loading State
    if (loading) {
        return (
            <div className="pb-32 animate-pulse">
                <div className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl"></div>
                    <div className="space-y-2">
                        <div className="h-5 w-32 bg-slate-100 rounded"></div>
                        <div className="h-3 w-24 bg-slate-100 rounded"></div>
                    </div>
                </div>
                <div className="px-4 mb-6">
                    <div className="h-12 bg-slate-100 rounded-[1.5rem]"></div>
                </div>
                <div className="px-4">
                    <div className="h-80 bg-slate-100 rounded-[2rem]"></div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="pb-32">
                <div className="p-4">
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
                        <p className="text-red-600 font-medium mb-2">{error}</p>
                        <button onClick={() => window.location.reload()} className="text-red-600 text-sm font-bold underline">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-32">
            {/* Header */}
            <div className="p-4 flex items-center gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-900 hover:bg-slate-50 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black text-slate-900 leading-tight truncate">
                        {selectedProperty?.name || "Select Property"}
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {selectedProperty?.city}, {selectedProperty?.state}
                    </p>
                </div>

                {properties.length > 1 && (
                    <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                    >
                        {properties.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Tabs */}
            <div className="px-4 mb-6">
                <div className="bg-slate-100/50 p-1.5 rounded-[1.5rem] flex">
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex-1 py-2.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${viewMode === 'calendar'
                            ? 'bg-[#051325] text-white shadow-md'
                            : 'text-slate-500'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Calendar
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 py-2.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${viewMode === 'list'
                            ? 'bg-[#051325] text-white shadow-md'
                            : 'text-slate-500'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Bookings
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-4">
                {viewMode === 'calendar' ? (
                    <div className="space-y-6">
                        {/* Calendar */}
                        {calendarLoading ? (
                            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 h-80 animate-pulse"></div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <Calendar
                                    occupiedRanges={occupiedRanges}
                                    onRangeSelect={handleRangeSelect}
                                    onBookingClick={(id) => {
                                        const booking = bookings.find(b => b.id === id);
                                        if (booking) setSelectedBooking(booking);
                                    }}
                                    selectedStart={checkIn}
                                    selectedEnd={checkOut}
                                    pricePerNight={selectedProperty?.pricePerNight || 0}
                                    currency={selectedProperty?.currency || "INR"}
                                    isOwner={true}
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    if (!checkIn) {
                                        showToast("Please select dates on calendar first", "error");
                                    }
                                }}
                                className="bg-white border border-slate-100 text-slate-900 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-colors"
                            >
                                <svg className="w-4 h-4 text-[#0D7A6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                New Booking
                            </button>

                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">
                            Upcoming Scheduled
                        </h3>

                        {bookings.length > 0 ? (
                            bookings.map(booking => (
                                <div
                                    key={booking.id}
                                    onClick={() => setSelectedBooking(booking)}
                                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden pl-6 pr-6 py-6 cursor-pointer hover:shadow-md transition-all"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0D7A6B] rounded-l-[2rem]"></div>

                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg leading-tight">
                                                {booking.guestName}
                                            </h4>
                                            <p className="text-[14px] text-slate-400 font-medium mt-1">
                                                {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                                            </p>
                                        </div>

                                        <div className={`text-[10px] font-black px-3 py-1 rounded-full ${getStatusStyle(booking.status)}`}>
                                            {booking.status.toUpperCase().replace('_', ' ')}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-start gap-10 border-t border-slate-50 pt-5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</span>
                                            <span className="text-base font-black text-slate-900">
                                                {formatCurrency(booking.totalAmount, booking.currency)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nights</span>
                                            <span className="text-base font-black text-[#0D7A6B]">{booking.numNights}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guests</span>
                                            <span className="text-base font-black text-[#0D7A6B]">{booking.numGuests}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-12 rounded-[2rem] border border-slate-50 flex flex-col items-center justify-center text-slate-300">
                                <svg className="w-16 h-16 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xs font-bold uppercase tracking-widest">No Active Bookings</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Booking Sidebar Modal Overlay */}
            {showBookingModal && checkIn && selectedProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => {
                            setShowBookingModal(false);
                            setCheckIn(null);
                            setCheckOut(null);
                        }}
                    />
                    <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <BookingSidebar
                            property={selectedProperty}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            onCancel={() => {
                                setShowBookingModal(false);
                                setCheckIn(null);
                                setCheckOut(null);
                            }}
                            onSuccess={() => {
                                setShowBookingModal(false);
                                setCheckIn(null);
                                setCheckOut(null);
                                refreshData();
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Booking Details Modal */}
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onUpdate={refreshData}
                />
            )}
        </div>
    );
}
