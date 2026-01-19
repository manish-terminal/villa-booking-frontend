"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import { Property, OccupiedRange } from "@/app/types/property";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import Calendar from "@/app/components/Calendar";
import BookingSidebar from "@/app/components/BookingSidebar";
import { Search, Home, Calendar as CalendarIcon, Filter, List, Plus } from "lucide-react";
import { Booking } from "@/app/types/property";
import BookingList from "@/app/components/BookingList";
import BookingDetailsModal from "@/app/components/BookingDetailsModal";
import ManualBookingModal from "@/app/components/ManualBookingModal";

export default function BookingsPage() {
    const { showToast } = useToast();
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [occupiedRanges, setOccupiedRanges] = useState<OccupiedRange[]>([]);
    const [loading, setLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showManualModal, setShowManualModal] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");

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
                    setSelectedPropertyId(response.properties[0].id);
                }
            } catch (err) {
                const apiError = err as APIError;
                setError(apiError.error || "Failed to load properties");
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

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
                setBookings(bookRes.bookings || []);

                // Reset selection when changing property
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

    const refreshData = async () => {
        if (!selectedPropertyId) return;
        try {
            const [calRes, bookRes] = await Promise.all([
                api.getPropertyCalendar(selectedPropertyId),
                api.getBookings(selectedPropertyId)
            ]);
            setOccupiedRanges(calRes.occupied || []);
            setBookings(bookRes.bookings || []);

            // If a booking was being viewed, update its reference to catch status changes
            if (selectedBooking) {
                const updated = bookRes.bookings.find((b: Booking) => b.id === selectedBooking.id);
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

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-20 bg-[var(--input-bg)] rounded-3xl w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[600px] bg-[var(--input-bg)] rounded-3xl"></div>
                    <div className="space-y-6">
                        <div className="h-[300px] bg-[var(--input-bg)] rounded-3xl"></div>
                        <div className="h-[200px] bg-[var(--input-bg)] rounded-3xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                    <Filter size={32} />
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Oops! Something went wrong</h2>
                <p className="text-[var(--foreground-muted)] mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header & Controls */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">Reservations</h1>
                        <p className="text-sm text-[var(--foreground-muted)]">
                            Manage stays and availability across your portfolio
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowManualModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--input-bg)] text-[var(--foreground)] font-bold hover:bg-[var(--primary)] hover:text-white transition-all active:scale-95 border border-[var(--glass-border)] text-xs uppercase tracking-widest"
                        >
                            <Plus size={16} />
                            Log Stay
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 bg-[var(--input-bg)]/50 rounded-3xl border border-[var(--glass-border)]">
                    {/* View Toggle */}
                    <div className="flex w-full md:w-auto p-1 bg-[var(--input-bg)] rounded-2xl border border-[var(--glass-border)] shadow-inner">
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${viewMode === "calendar"
                                ? "bg-[var(--primary)] text-white shadow-lg"
                                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                }`}
                        >
                            <CalendarIcon size={14} /> Calendar
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${viewMode === "list"
                                ? "bg-[var(--primary)] text-white shadow-lg"
                                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                }`}
                        >
                            <List size={14} /> List
                        </button>
                    </div>

                    {/* Property Selector */}
                    <div className="relative w-full md:w-72">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--foreground-muted)]">
                            <Home size={16} />
                        </div>
                        <select
                            value={selectedPropertyId}
                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                            className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl pl-12 pr-10 py-3 text-sm font-bold text-[var(--foreground)] appearance-none cursor-pointer transition-all outline-none"
                        >
                            {properties.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--foreground-muted)]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === "calendar" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
                    {/* Calendar Column */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                <CalendarIcon size={14} />
                                <span>Availability Overview</span>
                            </div>
                            {calendarLoading && (
                                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--foreground-muted)] animate-pulse">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                    Updating...
                                </div>
                            )}
                        </div>

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

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-6">
                        {!checkIn ? (
                            <div className="glass-card p-10 text-center border-dashed border-2 flex flex-col items-center justify-center min-h-[350px]">
                                <div className="w-20 h-20 bg-[var(--input-bg)] rounded-3xl flex items-center justify-center mb-6 text-[var(--primary)] shadow-lg">
                                    <CalendarIcon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">New Booking</h3>
                                <p className="text-[var(--foreground-muted)] text-sm max-w-[200px] leading-relaxed">
                                    Select dates on the calendar to begin a new reservation.
                                </p>
                            </div>
                        ) : (
                            <div className="animate-scale-in">
                                <BookingSidebar
                                    property={selectedProperty!}
                                    checkIn={checkIn}
                                    checkOut={checkOut}
                                    onCancel={() => {
                                        setCheckIn(null);
                                        setCheckOut(null);
                                    }}
                                    onSuccess={() => {
                                        setCheckIn(null);
                                        setCheckOut(null);
                                        refreshData();
                                    }}
                                />
                            </div>
                        )}

                        {/* Property Summary Card */}
                        <div className="glass-card overflow-hidden">
                            <div className="px-6 py-4 border-b border-[var(--glass-border)] bg-[var(--input-bg)]/30">
                                <h4 className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">
                                    Property Snapshot
                                </h4>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                            <span className="text-xs font-bold">₹</span>
                                        </div>
                                        <span className="text-xs font-bold text-[var(--foreground-muted)]">Nightly Rate</span>
                                    </div>
                                    <span className="text-sm font-black text-[var(--foreground)]">₹{selectedProperty?.pricePerNight.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-[var(--foreground-muted)]">Max Occupancy</span>
                                    </div>
                                    <span className="text-sm font-black text-[var(--foreground)]">{selectedProperty?.maxGuests} Guests</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-[var(--foreground-muted)]">Location</span>
                                    </div>
                                    <span className="text-sm font-black text-[var(--foreground)] truncate max-w-[120px]">{selectedProperty?.city}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-slide-up">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2 mb-4">
                        <List size={14} />
                        <span>All Reservations</span>
                    </div>
                    <BookingList
                        bookings={bookings}
                        onSelectBooking={(booking) => setSelectedBooking(booking)}
                    />
                </div>
            )}

            {/* Hidden History Anchor for Layout Stability */}
            {viewMode === "calendar" && (
                <div className="pt-12 border-t border-[var(--glass-border)] opacity-30 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-black text-center text-[var(--foreground-muted)] uppercase tracking-[0.3em]">
                        Switch to List View for complete history
                    </p>
                </div>
            )}

            {/* Modals */}
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onUpdate={refreshData}
                />
            )}

            {showManualModal && selectedProperty && (
                <ManualBookingModal
                    property={selectedProperty}
                    onClose={() => setShowManualModal(false)}
                    onSuccess={() => {
                        setShowManualModal(false);
                        refreshData();
                    }}
                />
            )}
        </div>
    );
}
