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
    ExternalLink
} from "lucide-react";
import { Booking } from "@/app/types/property";

interface BookingListProps {
    bookings: Booking[];
    onSelectBooking: (booking: Booking) => void;
}

export default function BookingList({ bookings, onSelectBooking }: BookingListProps) {
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
        switch (status) {
            case "confirmed":
                return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Confirmed" };
            case "pending_confirmation":
                return { icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", label: "Pending" };
            case "checked_in":
                return { icon: UserCheck, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10", label: "Checked In" };
            case "checked_out":
                return { icon: LogOut, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10", label: "Checked Out" };
            case "cancelled":
                return { icon: Ban, color: "text-rose-500", bg: "bg-rose-500/10", label: "Cancelled" };
            default:
                return { icon: Clock, color: "text-[var(--foreground-muted)]", bg: "bg-[var(--input-bg)]", label: status };
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Guest name, phone or ID..."
                        className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl pl-12 pr-4 py-3 text-sm text-[var(--foreground)] transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        className="w-full md:w-auto bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3 text-sm font-bold text-[var(--foreground)] appearance-none cursor-pointer min-w-[180px] outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Every Status</option>
                        <option value="pending_confirmation">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="checked_out">Checked Out</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--foreground-muted)]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBookings.length === 0 ? (
                    <div className="col-span-full py-16 glass-card flex flex-col items-center justify-center text-[var(--foreground-muted)] border-dashed border-2">
                        <Calendar size={48} className="opacity-20 mb-4" />
                        <p className="font-semibold">No bookings found matching your filters</p>
                    </div>
                ) : (
                    filteredBookings.map((booking) => {
                        const status = getStatusStyles(booking.status);
                        return (
                            <div
                                key={booking.id}
                                onClick={() => onSelectBooking(booking)}
                                className="glass-card group cursor-pointer hover:shadow-2xl transition-all duration-300 animate-fade-in relative overflow-hidden"
                            >
                                {/* Status Chip */}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${status.bg} ${status.color}`}>
                                        <status.icon size={12} />
                                        {status.label}
                                    </span>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Guest Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[var(--input-bg)] text-[var(--primary)] flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                                            {booking.guestName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-16">
                                            <h4 className="text-lg font-bold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                                                {booking.guestName}
                                            </h4>
                                            <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest mt-0.5">
                                                ID: {booking.id.slice(-8)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stay Details */}
                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-[var(--glass-border)]">
                                        <div>
                                            <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase mb-1">Check-in</p>
                                            <p className="text-sm font-black text-[var(--foreground)]">{format(new Date(booking.checkIn), "MMM d, yyyy")}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase mb-1">Check-out</p>
                                            <p className="text-sm font-black text-[var(--foreground)]">{format(new Date(booking.checkOut), "MMM d, yyyy")}</p>
                                        </div>
                                        <div className="col-span-2 pt-2 flex justify-between text-[10px] font-bold text-[var(--foreground-muted)] uppercase">
                                            <span className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]"></div>
                                                {booking.numNights} Nights
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></div>
                                                {booking.numGuests} Guests
                                            </span>
                                        </div>
                                    </div>

                                    {/* Pricing Summary */}
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase mb-1">Total Stay</p>
                                            <p className="text-2xl font-black text-[var(--primary)] tracking-tight">₹{booking.totalAmount.toLocaleString()}</p>
                                        </div>
                                        {booking.agentCommission > 0 && (
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-orange-500 uppercase mb-1">Commission</p>
                                                <p className="text-xs font-black text-white bg-orange-500 px-2 py-1 rounded-lg">
                                                    ₹{booking.agentCommission.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
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
