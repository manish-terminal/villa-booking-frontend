"use client";

import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { User, Phone, Mail, Users, FileText, Send, CheckCircle2 } from "lucide-react";
import Button from "@/app/components/Button";
import { api } from "@/app/lib/api";
import { useToast } from "@/app/components/Toast";
import { CreateBookingRequest, Property } from "@/app/types/property";

interface BookingSidebarProps {
    property: Property;
    checkIn: Date | null;
    checkOut: Date | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function BookingSidebar({
    property,
    checkIn,
    checkOut,
    onSuccess,
    onCancel,
}: BookingSidebarProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        guestName: "",
        guestPhone: "",
        guestEmail: "",
        numGuests: 1,
        notes: "",
        specialRequests: "",
        pricePerNight: property.pricePerNight,
        totalAmount: 0,
    });

    const numNights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

    // Effect to update total when price or nights changes
    useEffect(() => {
        if (numNights > 0) {
            setFormData(prev => ({ ...prev, totalAmount: numNights * prev.pricePerNight }));
        }
    }, [numNights, formData.pricePerNight]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkIn || !checkOut) return;

        setLoading(true);
        try {
            // 1. Initial validation
            const availability = await api.checkAvailability(
                property.id,
                format(checkIn, "yyyy-MM-dd"),
                format(checkOut, "yyyy-MM-dd")
            );

            if (!availability.available) {
                showToast("These dates are no longer available.", "error");
                setLoading(false);
                return;
            }

            // 2. Create booking
            const request: CreateBookingRequest = {
                propertyId: property.id,
                guestName: formData.guestName,
                guestPhone: formData.guestPhone,
                guestEmail: formData.guestEmail,
                numGuests: formData.numGuests,
                checkIn: format(checkIn, "yyyy-MM-dd"),
                checkOut: format(checkOut, "yyyy-MM-dd"),
                notes: formData.notes,
                specialRequests: formData.specialRequests,
                pricePerNight: formData.pricePerNight,
                totalAmount: formData.totalAmount,
            };

            await api.createBooking(request);
            showToast("Booking created successfully!", "success");
            onSuccess();
        } catch (err: any) {
            showToast(err.error || "Failed to create booking", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!checkIn) return null;

    return (
        <div className="glass-card p-6 sticky top-8 animate-slide-up shadow-2xl overflow-hidden border-t-4 border-indigo-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)]">New Booking</h2>
                    <p className="text-sm text-[var(--foreground-muted)]">{property.name}</p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                    <div>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Check-in</p>
                        <p className="text-sm font-semibold text-[var(--foreground)]">{format(checkIn, "EEE, MMM d")}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Check-out</p>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                            {checkOut ? format(checkOut, "EEE, MMM d") : "Select date"}
                        </p>
                    </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="Guest Name"
                            className="w-full glass-input pl-12 pr-4 py-3 placeholder:text-[var(--foreground-muted)]/50"
                            value={formData.guestName}
                            onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                            <Phone size={18} />
                        </div>
                        <input
                            type="tel"
                            required
                            placeholder="Guest Phone"
                            className="w-full glass-input pl-12 pr-4 py-3 placeholder:text-[var(--foreground-muted)]/50"
                            value={formData.guestPhone}
                            onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            placeholder="Guest Email (Optional)"
                            className="w-full glass-input pl-12 pr-4 py-3 placeholder:text-[var(--foreground-muted)]/50"
                            value={formData.guestEmail}
                            onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                                <Users size={18} />
                            </div>
                            <input
                                type="number"
                                min="1"
                                required
                                placeholder="Guests"
                                className="w-full glass-input pl-12 pr-4 py-3 placeholder:text-[var(--foreground-muted)]/50"
                                value={formData.numGuests}
                                onChange={(e) => setFormData({ ...formData, numGuests: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="flex items-center justify-center text-xs font-bold text-indigo-500">
                            Max {property.maxGuests}
                        </div>
                    </div>

                    {/* Custom Pricing Section */}
                    <div className="pt-4 space-y-4">
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Custom Pricing</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase ml-1 mb-1 block">Price / Night</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--foreground-muted)]">₹</span>
                                    <input
                                        type="number"
                                        className="w-full glass-input pl-7 pr-4 py-2 text-sm"
                                        value={formData.pricePerNight}
                                        onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase ml-1 mb-1 block">Total Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--foreground-muted)]">₹</span>
                                    <input
                                        type="number"
                                        className="w-full glass-input pl-7 pr-4 py-2 text-sm font-bold text-indigo-500"
                                        value={formData.totalAmount}
                                        onChange={(e) => setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-4 text-indigo-500">
                            <FileText size={18} />
                        </div>
                        <textarea
                            placeholder="Special Requests or Notes"
                            rows={3}
                            className="w-full glass-input pl-12 pr-4 py-3 resize-none placeholder:text-[var(--foreground-muted)]/50"
                            value={formData.specialRequests}
                            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                        />
                    </div>
                </div>

                {/* Price Breakdown Summary */}
                {checkOut && (
                    <div className="pt-6 border-t border-[var(--glass-border)] space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--foreground-muted)]">
                                ₹{formData.pricePerNight.toLocaleString()} x {numNights} nights
                            </span>
                            <span className="text-[var(--foreground)] font-semibold text-[10px] line-through opacity-50">
                                ₹{(numNights * property.pricePerNight).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2">
                            <span className="text-[var(--foreground)]">Final Total</span>
                            <span className="text-indigo-500">
                                ₹{formData.totalAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    type="submit"
                    disabled={!checkOut || loading}
                    loading={loading}
                    fullWidth
                    className="group"
                >
                    <span className="flex items-center justify-center gap-2">
                        Confirm Booking
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-emerald-500 font-bold">
                    <CheckCircle2 size={14} />
                    <span>Real-time availability validation active</span>
                </div>
            </form>
        </div>
    );
}
