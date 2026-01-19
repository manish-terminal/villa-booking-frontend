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
        agentCommission: 0,
        advancePayment: 0,
        paymentMethod: "upi",
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
                agentCommission: formData.agentCommission,
            };

            const bookingResponse = await api.createBooking(request);
            const newBookingId = bookingResponse.id;

            // 3. Log advance payment if provided
            if (formData.advancePayment > 0) {
                try {
                    await api.logPayment(newBookingId, {
                        amount: formData.advancePayment,
                        method: formData.paymentMethod,
                        reference: "Advance Payment",
                        paymentDate: format(new Date(), "yyyy-MM-dd"),
                        notes: "Initial advance payment during booking creation",
                    });
                } catch (paymentErr) {
                    console.error("Failed to log advance payment:", paymentErr);
                    showToast("Booking created, but failed to log advance payment.", "info");
                }
            }

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
        <div className="glass-card sticky top-8 animate-slide-up shadow-2xl overflow-hidden border-t-8 border-[var(--primary)]">
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">New Booking</h2>
                        <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mt-1">{property.name}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-xl bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Stay Duration */}
                    <div className="grid grid-cols-2 gap-px bg-[var(--glass-border)] rounded-2xl overflow-hidden border border-[var(--glass-border)]">
                        <div className="bg-[var(--input-bg)]/50 p-4">
                            <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-1">Check-in</p>
                            <p className="text-sm font-black text-[var(--foreground)]">{format(checkIn, "MMM d, yyyy")}</p>
                        </div>
                        <div className="bg-[var(--input-bg)]/50 p-4 text-right">
                            <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-1">Check-out</p>
                            <p className="text-sm font-black text-[var(--foreground)]">
                                {checkOut ? format(checkOut, "MMM d, yyyy") : "Pending..."}
                            </p>
                        </div>
                    </div>
                    {/* Guest Information */}
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest ml-1 mb-1.5 block">Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="Guest contact name"
                                className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm text-[var(--foreground)] outline-none transition-all"
                                value={formData.guestName}
                                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest ml-1 mb-1.5 block">Phone No.</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="+91..."
                                    className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm text-[var(--foreground)] outline-none transition-all"
                                    value={formData.guestPhone}
                                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest ml-1 mb-1.5 block">No. of Guests</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max={property.maxGuests}
                                        required
                                        className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm font-black text-[var(--foreground)] outline-none transition-all"
                                        value={formData.numGuests}
                                        onChange={(e) => setFormData({ ...formData, numGuests: parseInt(e.target.value) || 1 })}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--foreground-muted)]">/ {property.maxGuests}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Config */}
                    <div className="p-5 rounded-3xl bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20 space-y-5">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1 mb-1.5 block">Price / Night</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black">₹</span>
                                    <input
                                        type="number"
                                        className="w-full bg-white/10 border-b-2 border-white/20 focus:border-white focus:bg-white/20 rounded-t-lg pl-7 pr-2 py-2 text-sm font-black outline-none transition-all"
                                        value={formData.pricePerNight}
                                        onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1 mb-1.5 block">Advance Payment</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black">₹</span>
                                    <input
                                        type="number"
                                        className="w-full bg-white/10 border-b-2 border-white/20 focus:border-white focus:bg-white/20 rounded-t-lg pl-7 pr-2 py-2 text-sm font-black outline-none transition-all"
                                        value={formData.advancePayment}
                                        onChange={(e) => setFormData({ ...formData, advancePayment: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1 mb-1.5 block">Final Total</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-[var(--secondary)]">₹</span>
                                    <input
                                        type="number"
                                        className="w-full bg-white/10 border-b-2 border-[var(--secondary)]/50 focus:border-[var(--secondary)] focus:bg-white/20 rounded-t-lg pl-7 pr-2 py-2 text-lg font-black text-[var(--secondary)] outline-none transition-all"
                                        value={formData.totalAmount}
                                        onChange={(e) => setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1 mb-1.5 block">Commission</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black">₹</span>
                                    <input
                                        type="number"
                                        className="w-full bg-white/10 border-b-2 border-white/20 focus:border-white focus:bg-white/20 rounded-t-lg pl-7 pr-2 py-2 text-sm font-black outline-none transition-all"
                                        value={formData.agentCommission}
                                        onChange={(e) => setFormData({ ...formData, agentCommission: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1 mb-2 block">Payment via</label>
                            <div className="grid grid-cols-3 gap-2">
                                {["upi", "cash", "other"].map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.paymentMethod === method
                                            ? "bg-[var(--secondary)] text-[var(--primary)]"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                            }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest ml-1 mb-1.5 block">Special Requests</label>
                        <textarea
                            placeholder="Add meal preferences, pickup info, etc."
                            rows={3}
                            className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm text-[var(--foreground)] outline-none transition-all resize-none"
                            value={formData.specialRequests}
                            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                        />
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={!checkOut || loading}
                            loading={loading}
                            fullWidth
                            className="h-14 !rounded-2xl"
                        >
                            <span className="flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest">
                                Book Reservation
                                <Send size={20} />
                            </span>
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                        <CheckCircle2 size={12} />
                        <span>Instant verification active</span>
                    </div>
                </form>
            </div>
        </div>
    );
}
