"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import { Property, OccupiedRange } from "@/app/types/property";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import Calendar from "@/app/components/Calendar";
import BookingSidebar from "@/app/components/BookingSidebar";
import { Search, Home, Calendar as CalendarIcon, Filter } from "lucide-react";

export default function BookingsPage() {
    const { showToast } = useToast();
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [occupiedRanges, setOccupiedRanges] = useState<OccupiedRange[]>([]);
    const [loading, setLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Selection state
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

    // Fetch calendar when property changes
    useEffect(() => {
        if (!selectedPropertyId) return;

        const fetchCalendar = async () => {
            setCalendarLoading(true);
            try {
                const response = await api.getPropertyCalendar(selectedPropertyId);
                setOccupiedRanges(response.occupied || []);
                // Reset selection when changing property
                setCheckIn(null);
                setCheckOut(null);
            } catch (err) {
                const apiError = err as APIError;
                showToast(apiError.error || "Failed to load calendar", "error");
            } finally {
                setCalendarLoading(false);
            }
        };
        fetchCalendar();
    }, [selectedPropertyId]);

    const handleRangeSelect = (start: Date | null, end: Date | null) => {
        setCheckIn(start);
        setCheckOut(end);
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-20 bg-[var(--input-bg)] rounded-2xl w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[600px] bg-[var(--input-bg)] rounded-2xl"></div>
                    <div className="h-[400px] bg-[var(--input-bg)] rounded-2xl"></div>
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
                <button
                    onClick={() => window.location.reload()}
                    className="btn-primary"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Property Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--glass-border)]">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Booking Calendar</h1>
                    <p className="text-[var(--foreground-muted)]">Manage stays and create new bookings</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 group-hover:scale-110 transition-transform">
                        <Home size={20} />
                    </div>
                    <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="w-full glass-input pl-12 pr-10 py-3.5 text-lg font-semibold appearance-none cursor-pointer focus:ring-4 ring-indigo-500/10 transition-all"
                    >
                        {properties.map((p) => (
                            <option key={p.id} value={p.id} className="bg-[var(--background)]">
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none">
                        <Search size={18} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-indigo-500">
                            <CalendarIcon size={18} />
                            <span>AVAILABILITY OVERVIEW</span>
                        </div>
                        {calendarLoading && (
                            <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)] animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                Updating...
                            </div>
                        )}
                    </div>

                    <Calendar
                        occupiedRanges={occupiedRanges}
                        onRangeSelect={handleRangeSelect}
                        selectedStart={checkIn}
                        selectedEnd={checkOut}
                        pricePerNight={selectedProperty?.pricePerNight || 0}
                        currency={selectedProperty?.currency || "INR"}
                        isOwner={true} // For the owner dashboard
                    />
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {!checkIn ? (
                        <div className="glass-card p-8 text-center bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-dashed border-2 border-indigo-500/20">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500 animate-bounce-slow">
                                <CalendarIcon size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Start a Booking</h3>
                            <p className="text-[var(--foreground-muted)] leading-relaxed">
                                Select a check-in date from the calendar to begin creating a new reservation.
                            </p>
                        </div>
                    ) : (
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
                                // Refresh calendar
                                api.getPropertyCalendar(selectedPropertyId).then(res => setOccupiedRanges(res.occupied || []));
                            }}
                        />
                    )}

                    {/* Quick Stats/Summary */}
                    <div className="glass-card p-6 space-y-4">
                        <h4 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest">
                            Property Summary
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--foreground-muted)]">Base Price</span>
                                <span className="text-sm font-bold text-[var(--foreground)]">₹{selectedProperty?.pricePerNight}/night</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--foreground-muted)]">Capacity</span>
                                <span className="text-sm font-bold text-[var(--foreground)]">{selectedProperty?.maxGuests} Guests</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--foreground-muted)]">Location</span>
                                <span className="text-sm font-bold text-[var(--foreground)]">{selectedProperty?.city}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
