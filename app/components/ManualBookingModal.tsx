"use client";

import { useState } from "react";
import { format } from "date-fns";
import { X, User, Phone, Mail, Users, FileText, Send, Calendar as CalendarIcon, CreditCard } from "lucide-react";
import Button from "@/app/components/Button";
import { api } from "@/app/lib/api";
import { useToast } from "@/app/components/Toast";
import { Property, CreateBookingRequest } from "@/app/types/property";

interface ManualBookingModalProps {
    property: Property;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ManualBookingModal({ property, onClose, onSuccess }: ManualBookingModalProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        guestName: "",
        guestPhone: "",
        guestEmail: "",
        numGuests: 1,
        checkIn: format(new Date(), "yyyy-MM-dd"),
        checkOut: format(new Date(), "yyyy-MM-dd"),
        notes: "Historical booking entry",
        specialRequests: "",
        pricePerNight: property.pricePerNight,
        totalAmount: 0,
        amountPaid: 0,
        paymentMethod: "cash"
    });

    const handleCalculateTotal = () => {
        const start = new Date(formData.checkIn);
        const end = new Date(formData.checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
            setFormData(prev => ({ ...prev, totalAmount: diffDays * prev.pricePerNight }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create booking
            const request: CreateBookingRequest = {
                propertyId: property.id,
                guestName: formData.guestName,
                guestPhone: formData.guestPhone,
                guestEmail: formData.guestEmail,
                numGuests: formData.numGuests,
                checkIn: formData.checkIn,
                checkOut: formData.checkOut,
                notes: formData.notes,
                specialRequests: formData.specialRequests,
                pricePerNight: formData.pricePerNight,
                totalAmount: formData.totalAmount,
            };

            const response = await api.createBooking(request);
            const bookingId = response.id;

            // 2. Log payment if balance exists
            if (formData.amountPaid > 0) {
                await api.logPayment(bookingId, {
                    amount: formData.amountPaid,
                    method: formData.paymentMethod,
                    reference: "Manual Entry Selection",
                    paymentDate: format(new Date(), "yyyy-MM-dd"),
                    notes: "Initial payment logged during manual entry",
                });
            }

            // 3. Mark as settled if full amount paid
            if (formData.amountPaid >= formData.totalAmount && formData.totalAmount > 0) {
                await api.updateBookingStatus(bookingId, "checked_out");
            }

            showToast("Historical booking logged successfully", "success");

            onSuccess();
        } catch (err: any) {
            showToast(err.error || "Failed to log booking", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in border-t-8 border-[var(--primary)]">
                <div className="p-8 border-b border-[var(--glass-border)] flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Log Previous Choice</h2>
                        <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mt-1">Manual entry for {property.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">Guest Details</h3>
                            <div className="relative">
                                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest ml-1 mb-1.5 block">Full Name</label>
                                <input
                                    type="text" required placeholder="Guest contact name"
                                    className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3 text-sm text-[var(--foreground)] outline-none transition-all"
                                    value={formData.guestName}
                                    onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest ml-1 mb-1.5 block">Phone Number</label>
                                <input
                                    type="tel" required placeholder="+91..."
                                    className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3 text-sm text-[var(--foreground)] outline-none transition-all"
                                    value={formData.guestPhone}
                                    onChange={e => setFormData({ ...formData, guestPhone: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest ml-1 mb-1.5 block">No. of Guests</label>
                                <input
                                    type="number" required min="1"
                                    className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3 text-sm font-black text-[var(--foreground)] outline-none transition-all"
                                    value={formData.numGuests}
                                    onChange={e => setFormData({ ...formData, numGuests: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">Stay Schedule</h3>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase ml-1">Check-in Date</label>
                                <input
                                    type="date" required
                                    className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3 text-sm text-[var(--foreground)] outline-none transition-all"
                                    value={formData.checkIn}
                                    onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                                    onBlur={handleCalculateTotal}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase ml-1">Check-out Date</label>
                                <input
                                    type="date" required
                                    className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3 text-sm text-[var(--foreground)] outline-none transition-all"
                                    value={formData.checkOut}
                                    onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                                    onBlur={handleCalculateTotal}
                                />
                            </div>
                        </section>
                    </div>

                    <section className="space-y-4 pt-8 border-t border-[var(--glass-border)]">
                        <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">Financials & Settlement</h3>

                        <div className="p-6 rounded-3xl bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1 mb-1.5 block">Price / Night</label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black">₹</span>
                                        <input
                                            type="number"
                                            className="w-full bg-white/10 border-b-2 border-white/20 focus:border-white focus:bg-white/20 rounded-t-lg pl-7 pr-4 py-2 text-sm font-black outline-none transition-all"
                                            value={formData.pricePerNight}
                                            onChange={e => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) || 0 })}
                                            onBlur={handleCalculateTotal}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1 mb-1.5 block">Amount Paid</label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-300">₹</span>
                                        <input
                                            type="number"
                                            className="w-full bg-white/10 border-b-2 border-emerald-500/30 focus:border-emerald-300 focus:bg-white/20 rounded-t-lg pl-7 pr-4 py-2 text-sm font-black text-emerald-300 outline-none transition-all"
                                            value={formData.amountPaid}
                                            onChange={e => setFormData({ ...formData, amountPaid: parseInt(e.target.value) || 0 })}
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
                                            className="w-full bg-white/10 border-b-2 border-[var(--secondary)]/50 focus:border-[var(--secondary)] focus:bg-white/20 rounded-t-lg pl-7 pr-4 py-2 text-lg font-black text-[var(--secondary)] outline-none transition-all"
                                            value={formData.totalAmount}
                                            onChange={e => setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1 mb-1.5 block">Method</label>
                                    <select
                                        className="w-full bg-white/10 border-b-2 border-white/20 focus:border-white focus:bg-white/20 rounded-t-lg px-4 py-2.5 text-sm font-bold text-white outline-none appearance-none transition-all"
                                        value={formData.paymentMethod}
                                        onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    >
                                        <option value="cash" className="text-black">Cash</option>
                                        <option value="upi" className="text-black">UPI</option>
                                        <option value="bank_transfer" className="text-black">Bank Transfer</option>
                                        <option value="other" className="text-black">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        {formData.amountPaid >= formData.totalAmount && formData.totalAmount > 0 && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                <CreditCard size={14} />
                                This stay will be marked as settled & checked-out
                            </div>
                        )}
                    </section>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            loading={loading}
                            fullWidth
                            className="h-14 !rounded-2xl"
                        >
                            <span className="flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest">
                                Save Entry
                                <Send size={20} />
                            </span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
