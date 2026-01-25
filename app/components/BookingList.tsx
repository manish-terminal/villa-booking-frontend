"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Search,
    Filter,
    ChevronRight,
    Calendar,
    User,
    Clock,
    CheckCircle2,
    Ban,
    UserCheck,
    LogOut,
    ExternalLink,
    Phone,
    PencilLine
} from "lucide-react";
import { Booking } from "@/app/types/property";
import { BookingWithPayment } from "./BookingCard";

interface BookingListProps {
    bookings: BookingWithPayment[];
    onSelectBooking: (booking: Booking) => void;
    onEditBooking?: (booking: Booking) => void;
}

export default function BookingList({ bookings, onSelectBooking, onEditBooking }: BookingListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredBookings = bookings.filter(booking => {
        // Strict guard: Skip visually empty/placeholder bookings
        if (!booking.id || !booking.guestName || booking.guestName.trim() === "") return false;

        const matchesSearch =
            booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.guestPhone.includes(searchTerm) ||
            booking.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'settled' || s === 'confirmed' || s === 'completed' || s === 'checked_in' || s === 'checked_out') {
            return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Settled" };
        } else if (s === 'partial') {
            return { icon: ExternalLink, color: "text-blue-500", bg: "bg-blue-500/10", label: "Partial" };
        } else if (s === 'pending' || s === 'pending_confirmation' || s === 'due') {
            return { icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", label: "Pending" };
        }
        return { icon: Clock, color: "text-[var(--foreground-muted)]", bg: "bg-[var(--input-bg)]", label: status.toUpperCase() };
    };

    return (
        <div className="space-y-6">
            {/* Premium Filters Header */}
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-[var(--input-bg)]/50 rounded-3xl border border-[var(--glass-border)] transition-all">
                <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search guests, phone or ID..."
                        className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-[var(--foreground)] transition-all outline-none placeholder:text-[var(--foreground-muted)]/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none">
                        <Filter size={16} />
                    </div>
                    <select
                        className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 rounded-2xl pl-12 pr-10 py-3 text-sm font-bold text-[var(--foreground)] appearance-none cursor-pointer outline-none transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="settled">Settled</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--foreground-muted)]">
                        <ChevronRight size={16} className="rotate-90" />
                    </div>
                </div>
            </div>

            {/* Cards Grid with Staggered Entrance */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
                {filteredBookings.length === 0 ? (
                    <div className="col-span-full py-24 glass-card flex flex-col items-center justify-center text-[var(--foreground-muted)] border-dashed border-2 animate-fade-in">
                        <div className="w-20 h-20 bg-[var(--input-bg)] rounded-3xl flex items-center justify-center mb-6 opacity-20">
                            <Calendar size={40} />
                        </div>
                        <p className="text-lg font-serif">No reservations found</p>
                        <p className="text-xs uppercase tracking-widest mt-2 opacity-60">Try adjusting your filters</p>
                    </div>
                ) : (
                    filteredBookings.map((booking) => {
                        const displayStatus = booking.paymentSummary?.status || booking.status;
                        const status = getStatusStyles(displayStatus);
                        return (
                            <div
                                key={booking.id}
                                onClick={() => onSelectBooking(booking)}
                                className="glass-card group cursor-pointer hover:shadow-2xl hover:shadow-[var(--primary)]/5 transition-all duration-500 animate-slide-up relative overflow-hidden flex flex-col border border-[var(--glass-border)]/50 hover:border-[var(--secondary)]/30"
                            >
                                {/* Decorative Gradient Overlay */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--secondary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="p-6 space-y-6 flex-1">
                                    {/* Header: Status & ID */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em] opacity-40">
                                            #{booking.id.slice(-8)}
                                        </span>
                                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${status.bg} ${status.color}`}>
                                            <status.icon size={10} />
                                            {status.label}
                                        </div>
                                    </div>

                                    {/* Guest Identity */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--input-bg)] to-[var(--input-bg)]/50 text-[var(--primary)] flex items-center justify-center font-serif text-3xl shadow-lg shadow-[var(--primary)]/5 group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                                            <span className="relative z-10">{booking.guestName.charAt(0)}</span>
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <h4 className="text-2xl font-serif text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors leading-tight">
                                                {booking.guestName}
                                            </h4>
                                            <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest mt-1 flex items-center gap-2">
                                                <Phone size={10} className="text-[var(--secondary)]" />
                                                {booking.guestPhone}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Trip Timeline Visual */}
                                    <div className="relative py-6 px-1">
                                        <div className="absolute left-[3px] top-9 bottom-9 w-[1px] bg-gradient-to-b from-[var(--secondary)]/50 via-[var(--secondary)]/10 to-[var(--secondary)]/50 hidden sm:block" />
                                        <div className="space-y-6 relative">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 rounded-full border-2 border-[var(--secondary)] bg-white z-10 hidden sm:block" />
                                                <div className="flex-1">
                                                    <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-wider mb-0.5 opacity-60">Arrival</p>
                                                    <p className="text-sm font-bold text-[var(--foreground)]">{format(new Date(booking.checkIn), "EEE, MMM d, yyyy")}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 rounded-full bg-[var(--secondary)] z-10 hidden sm:block" />
                                                <div className="flex-1">
                                                    <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-wider mb-0.5 opacity-60">Departure</p>
                                                    <p className="text-sm font-bold text-[var(--foreground)]">{format(new Date(booking.checkOut), "EEE, MMM d, yyyy")}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats Pod */}
                                    <div className="grid grid-cols-2 gap-px bg-[var(--glass-border)] rounded-2xl overflow-hidden border border-[var(--glass-border)]">
                                        <div className="bg-[var(--input-bg)]/40 p-3 text-center">
                                            <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-tighter mb-1">Stay Duration</p>
                                            <p className="text-xs font-black text-[var(--foreground)]">{booking.numNights} Nights</p>
                                        </div>
                                        <div className="bg-[var(--input-bg)]/40 p-3 text-center">
                                            <p className="text-[8px] font-black text-[var(--foreground-muted)] uppercase tracking-tighter mb-1">Full Party</p>
                                            <p className="text-xs font-black text-[var(--foreground)]">{booking.numGuests} Guests</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Bottom Bar */}
                                <div className="p-6 bg-[var(--input-bg)]/30 border-t border-[var(--glass-border)] flex items-center justify-between group-hover:bg-[var(--primary)]/5 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest leading-none mb-1">Direct Rev</span>
                                        <span className="text-2xl font-serif text-[var(--primary)] tracking-tight">₹{booking.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {onEditBooking && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditBooking(booking);
                                                }}
                                                className="w-10 h-10 rounded-full border border-[var(--glass-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:bg-[var(--primary)] hover:text-white hover:border-transparent transition-all duration-300"
                                                title="Edit Booking"
                                            >
                                                <PencilLine size={18} />
                                            </button>
                                        )}
                                        <div className="w-10 h-10 rounded-full border border-[var(--glass-border)] flex items-center justify-center text-[var(--foreground-muted)] group-hover:bg-[var(--primary)] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
