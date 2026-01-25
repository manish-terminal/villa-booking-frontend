"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { format, addYears } from "date-fns";
import { api } from "@/app/lib/api";
import { Booking, Property, OccupiedRange } from "@/app/types/property";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import { getUser } from "@/app/lib/auth";
import BookingList from "@/app/components/BookingList";
import Calendar from "@/app/components/Calendar";
import BookingDetailsModal from "@/app/components/BookingDetailsModal";
import AgentBookingSidebar from "@/app/components/AgentBookingSidebar";
import { BookingWithPayment } from "@/app/components/BookingCard";
import Button from "@/app/components/Button";
import { Calendar as CalendarIcon, List, Search, RefreshCw } from "lucide-react";

function AgentBookingsContent() {
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const [user] = useState(() => getUser());
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [bookings, setBookings] = useState<BookingWithPayment[]>([]);
    const [occupiedRanges, setOccupiedRanges] = useState<OccupiedRange[]>([]);
    const [loading, setLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Selection state for Calendar
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    // Fetch linked properties on mount
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await api.getProperties();
                setProperties(response.properties || []);

                // Handle deep-linking from search params
                const propId = searchParams.get("propertyId");
                const view = searchParams.get("view");
                const action = searchParams.get("action");
                const checkInParam = searchParams.get("checkIn");
                const checkOutParam = searchParams.get("checkOut");

                if (propId) {
                    setSelectedPropertyId(propId);
                } else if (response.properties && response.properties.length > 0) {
                    setSelectedPropertyId(response.properties[0].id);
                }

                if (view === "calendar" || view === "list") {
                    setViewMode(view);
                }

                // Auto-open booking modal if action=book
                if (action === "book" && checkInParam && checkOutParam) {
                    setCheckIn(new Date(checkInParam));
                    setCheckOut(new Date(checkOutParam));
                }
            } catch (err) {
                const apiError = err as APIError;
                showToast(apiError.error || "Failed to load properties", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, [searchParams, showToast]);

    // Fetch bookings and calendar data when selected property changes
    useEffect(() => {
        if (!selectedPropertyId) return;

        const fetchData = async () => {
            setCalendarLoading(true);
            try {
                const startDateStr = format(new Date(), 'yyyy-MM-dd');
                const endDateStr = format(addYears(new Date(), 1), 'yyyy-MM-dd');
                const [bookingsRes, calendarRes] = await Promise.all([
                    api.getBookings(selectedPropertyId, startDateStr, endDateStr),
                    api.getPropertyCalendar(selectedPropertyId, startDateStr, endDateStr)
                ]);

                // Enrich with payment status
                const rawBookings = bookingsRes.bookings || [];
                const enrichedBookings = await Promise.all(rawBookings.map(async (b) => {
                    try {
                        const paymentSummary = await api.getBookingPaymentStatus(b.id);
                        return { ...b, paymentSummary };
                    } catch {
                        return b;
                    }
                }));

                setBookings(enrichedBookings);
                setOccupiedRanges(calendarRes.occupied || []);

                // Reset selection when property changes
                setCheckIn(null);
                setCheckOut(null);
            } catch (err) {
                const apiError = err as APIError;
                showToast(apiError.error || "Failed to load data for property", "error");
            } finally {
                setCalendarLoading(false);
            }
        };
        fetchData();
    }, [selectedPropertyId, showToast]);

    const handleRefresh = async () => {
        if (!selectedPropertyId) return;
        try {
            const startDateStr = format(new Date(), 'yyyy-MM-dd');
            const endDateStr = format(addYears(new Date(), 1), 'yyyy-MM-dd');
            const [bookingsRes, calendarRes] = await Promise.all([
                api.getBookings(selectedPropertyId, startDateStr, endDateStr),
                api.getPropertyCalendar(selectedPropertyId, startDateStr, endDateStr)
            ]);

            const rawBookings = bookingsRes.bookings || [];
            const enrichedBookings = await Promise.all(rawBookings.map(async (b) => {
                try {
                    const paymentSummary = await api.getBookingPaymentStatus(b.id);
                    return { ...b, paymentSummary };
                } catch {
                    return b;
                }
            }));

            setBookings(enrichedBookings);
            setOccupiedRanges(calendarRes.occupied || []);

            if (selectedBooking) {
                const updated = bookingsRes.bookings.find((b: Booking) => b.id === selectedBooking.id);
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

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);

    // Filter bookings to ONLY show those made by THIS agent
    const filteredBookings = bookings.filter(b => b.bookedBy === user?.phone);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Booking Ledger</h1>
                    <p className="text-[var(--foreground-muted)] font-medium text-sm">Review history or check global availability</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* View Toggle */}
                    <div className="bg-[var(--input-bg)] p-1 rounded-2xl flex items-center shadow-inner border border-[var(--glass-border)]">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${viewMode === "list"
                                ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg"
                                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                }`}
                        >
                            <List size={16} /> List
                        </button>
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${viewMode === "calendar"
                                ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg"
                                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                }`}
                        >
                            <CalendarIcon size={16} /> Calendar
                        </button>
                    </div>

                    {/* Property Selector */}
                    <div className="relative group w-full sm:w-64">
                        <select
                            value={selectedPropertyId}
                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                            className="w-full glass-input pl-4 pr-10 py-3 font-bold text-sm bg-[var(--input-bg)] border-[var(--glass-border)] focus:border-indigo-500 transition-all cursor-pointer appearance-none shadow-sm"
                        >
                            <option value="" disabled>Select Property</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--foreground-muted)]">
                            <Search size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {loading && !selectedPropertyId ? (
                <div className="grid grid-cols-1 gap-6 animate-pulse">
                    <div className="h-64 glass-card bg-[var(--input-bg)]/50 rounded-[2rem] border-none shadow-none"></div>
                </div>
            ) : properties.length === 0 ? (
                <div className="glass-card p-16 text-center border-dashed border-2 border-[var(--glass-border)] flex flex-col items-center justify-center space-y-6">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center">
                        <Search size={48} className="text-indigo-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-[var(--foreground)] uppercase">No Linked Properties</h3>
                        <p className="text-[var(--foreground-muted)] max-w-sm mx-auto font-medium">Link a property from the &quot;My Properties&quot; section to start booking.</p>
                    </div>
                    <Button onClick={() => window.location.href = "/agent/properties"}>Link Property Now</Button>
                </div>
            ) : (
                <div className="animate-slide-up">
                    {viewMode === "list" ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2 mb-4">
                                <List size={14} />
                                <span>My Personal History</span>
                            </div>
                            <BookingList
                                bookings={filteredBookings}
                                onSelectBooking={setSelectedBooking}
                                onEditBooking={setEditingBooking}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Full Width Calendar */}
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                    <CalendarIcon size={14} />
                                    <span>Real-time availability</span>
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
                    )}
                </div>
            )}

            {/* Booking Wizard Modal (New & Edit) */}
            {(editingBooking || (checkIn && checkOut && selectedProperty)) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => {
                            setEditingBooking(null);
                            setCheckIn(null);
                            setCheckOut(null);
                        }}
                    />
                    <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <AgentBookingSidebar
                            bookingToEdit={editingBooking || undefined}
                            property={selectedProperty!}
                            checkIn={editingBooking ? new Date(editingBooking.checkIn) : checkIn}
                            checkOut={editingBooking ? new Date(editingBooking.checkOut) : checkOut}
                            onCancel={() => {
                                setEditingBooking(null);
                                setCheckIn(null);
                                setCheckOut(null);
                            }}
                            onSuccess={() => {
                                setEditingBooking(null);
                                setCheckIn(null);
                                setCheckOut(null);
                                handleRefresh();
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Detailed View Modal */}
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onUpdate={handleRefresh}
                    onEdit={(booking) => {
                        setSelectedBooking(null);
                        setEditingBooking(booking);
                    }}
                />
            )}
        </div>
    );
}

export default function AgentBookings() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        }>
            <AgentBookingsContent />
        </Suspense>
    );
}
