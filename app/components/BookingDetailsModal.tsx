"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    X,
    Calendar,
    User,
    Phone,
    Mail,
    Users,
    FileText,
    CreditCard,
    Plus,
    CheckCircle2,
    AlertCircle,
    Clock,
    UserCheck,
    LogOut,
    Ban,
    ExternalLink
} from "lucide-react";
import { api } from "@/app/lib/api";
import { Booking, Payment, PaymentSummary, OfflinePaymentRequest } from "@/app/types/property";
import { useToast } from "@/app/components/Toast";
import Button from "@/app/components/Button";

interface BookingDetailsModalProps {
    booking: Booking;
    onClose: () => void;
    onUpdate: () => void;
}

export default function BookingDetailsModal({ booking, onClose, onUpdate }: BookingDetailsModalProps) {
    const { showToast } = useToast();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [newPayment, setNewPayment] = useState<OfflinePaymentRequest>({
        amount: 0,
        method: "upi",
        reference: "",
        notes: "",
        paymentDate: format(new Date(), "yyyy-MM-dd"),
    });

    useEffect(() => {
        fetchPaymentInfo();
    }, [booking.id]);

    const fetchPaymentInfo = async () => {
        try {
            const [pRes, sRes] = await Promise.all([
                api.getBookingPayments(booking.id),
                api.getBookingPaymentStatus(booking.id)
            ]);
            setPayments(pRes.payments || []);
            setPaymentSummary(sRes);
        } catch (err) {
            console.error("Failed to fetch payment info", err);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        setLoading(true);
        try {
            await api.updateBookingStatus(booking.id, newStatus);
            showToast(`Booking marked as ${newStatus.replace("_", " ")}`, "success");

            onUpdate();
        } catch (err: any) {
            showToast(err.error || "Failed to update status", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSettle = async () => {
        if (!paymentSummary || paymentSummary.totalDue <= 0) return;

        setLoading(true);
        try {
            // 1. Log full balance payment
            await api.logPayment(booking.id, {
                amount: paymentSummary.totalDue,
                method: "cash", // Assuming cash for quick settle, or can prompt
                reference: "Balance Settlement",
                paymentDate: format(new Date(), "yyyy-MM-dd"),
                notes: "Quick settlement of full remaining balance",
            });

            // 2. Mark as checked out
            await api.updateBookingStatus(booking.id, "checked_out");

            showToast("Booking settled and marked as Checked Out", "success");
            fetchPaymentInfo();
            onUpdate();
        } catch (err: any) {
            showToast(err.error || "Failed to settle booking", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleLogPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.logPayment(booking.id, newPayment);
            showToast("Payment logged successfully", "success");

            setShowPaymentForm(false);
            fetchPaymentInfo();
            onUpdate();
        } catch (err: any) {
            showToast(err.error || "Failed to log payment", "error");
        } finally {
            setLoading(false);
        }
    };

    const statuses = [
        { id: "pending_confirmation", label: "Pending", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
        { id: "confirmed", label: "Confirmed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { id: "checked_in", label: "Checked In", icon: UserCheck, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
        { id: "checked_out", label: "Checked Out", icon: LogOut, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
        { id: "cancelled", label: "Cancelled", icon: Ban, color: "text-rose-500", bg: "bg-rose-500/10" },
    ];

    const currentStatus = statuses.find(s => s.id === booking.status) || statuses[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in border-t-8 border-[var(--primary)]">
                {/* Header */}
                <div className="p-8 border-b border-[var(--glass-border)] flex items-center justify-between bg-[var(--input-bg)]/30">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-[var(--primary)] text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-[var(--primary)]/30">
                            {booking.guestName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight">{booking.guestName}</h2>
                                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${currentStatus.bg} ${currentStatus.color}`}>
                                    <currentStatus.icon size={12} />
                                    {currentStatus.label}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><ExternalLink size={12} className="text-[var(--primary)]" /> #{booking.id.slice(-8)}</span>
                                <span className="w-1 h-1 rounded-full bg-[var(--glass-border)]" />
                                <span className="flex items-center gap-1.5"><Users size={12} className="text-[var(--primary)]" /> {booking.numGuests} Guests</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-rose-500 transition-all group">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--glass-border)]">

                        {/* Left Column: Details & Status (7 cols) */}
                        <div className="lg:col-span-7 p-8 space-y-10">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">Stay Schedule</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--input-bg)]/30 border border-[var(--glass-border)] group">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Check-in</p>
                                                <p className="text-sm font-black text-[var(--foreground)]">{format(new Date(booking.checkIn), "EEE, MMM d, yyyy")}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--input-bg)]/30 border border-[var(--glass-border)] group">
                                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Check-out</p>
                                                <p className="text-sm font-black text-[var(--foreground)]">{format(new Date(booking.checkOut), "EEE, MMM d, yyyy")}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">Contact Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--input-bg)]/10 border border-dashed border-[var(--glass-border)]">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                                <Phone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Phone</p>
                                                <p className="text-sm font-black text-[var(--foreground)]">{booking.guestPhone}</p>
                                            </div>
                                        </div>
                                        {booking.guestEmail && (
                                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--input-bg)]/10 border border-dashed border-[var(--glass-border)]">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--secondary)]/10 flex items-center justify-center text-[var(--secondary)]">
                                                    <Mail size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Email</p>
                                                    <p className="text-sm font-black text-[var(--foreground)] truncate">{booking.guestEmail}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">Reservation Actions</h3>
                                <div className="p-2 rounded-2xl bg-[var(--input-bg)]/30 border border-[var(--glass-border)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {statuses.map(status => (
                                        <button
                                            key={status.id}
                                            disabled={loading || booking.status === status.id}
                                            onClick={() => handleStatusUpdate(status.id)}
                                            className={`
                                                flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                                                ${booking.status === status.id
                                                    ? `${status.bg} ${status.color} shadow-lg shadow-current/10 border-2 border-current/50`
                                                    : "bg-[var(--input-bg)]/20 text-[var(--foreground-muted)] hover:bg-white hover:text-[var(--primary)] border border-transparent"
                                                }
                                                disabled:opacity-50 disabled:cursor-not-allowed group
                                            `}
                                        >
                                            <status.icon size={18} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-tight text-center">{status.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {booking.notes && (
                                <section className="space-y-3">
                                    <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FileText size={14} /> Guest Selection Notes
                                    </h3>
                                    <div className="p-6 rounded-2xl bg-[var(--primary)]/5 border-l-4 border-[var(--primary)] text-sm leading-relaxed text-[var(--foreground)] italic">
                                        "{booking.notes}"
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right Column: Payments (5 cols) */}
                        <div className="lg:col-span-5 p-8 bg-[var(--input-bg)]/10 h-full space-y-8">

                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em]">Payment Summary</h3>
                                    {paymentSummary && (
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${paymentSummary.status === 'completed' ? 'bg-emerald-500 text-white' :
                                            paymentSummary.status === 'partial' ? 'bg-orange-500 text-white' : 'bg-rose-500 text-white'
                                            }`}>
                                            {paymentSummary.status}
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 rounded-[2rem] bg-[var(--primary)] text-white shadow-2xl shadow-[var(--primary)]/30 relative overflow-hidden group">
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">Total Amount</p>
                                                <p className="text-3xl font-black tracking-tight">₹{booking.totalAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">Your Fee</p>
                                                <p className="text-xl font-black text-[var(--secondary)]">₹{(booking.agentCommission || 0).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">Received</p>
                                                <p className="text-xl font-black text-emerald-300">₹{paymentSummary?.totalPaid.toLocaleString() || "0"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">Balance</p>
                                                <p className="text-xl font-black text-rose-300">₹{paymentSummary?.totalDue.toLocaleString() || "0"}</p>
                                            </div>
                                        </div>

                                        {paymentSummary && paymentSummary.totalDue > 0 && (
                                            <button
                                                onClick={handleSettle}
                                                disabled={loading}
                                                className="w-full mt-2 h-14 rounded-2xl bg-white text-[var(--primary)] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 active:scale-95"
                                            >
                                                Settle Balance
                                            </button>
                                        )}
                                    </div>
                                    <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em]">Transaction Log</h3>
                                    <button
                                        onClick={() => setShowPaymentForm(!showPaymentForm)}
                                        className="p-2 rounded-xl bg-[var(--primary)] text-white hover:scale-110 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {showPaymentForm && (
                                    <form onSubmit={handleLogPayment} className="p-6 rounded-[2rem] bg-emerald-500/5 border-2 border-emerald-500/20 space-y-4 animate-slide-down">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1 mb-1.5 block">Amount</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-600">₹</span>
                                                    <input
                                                        type="number" required
                                                        className="w-full bg-white border-2 border-transparent focus:border-emerald-500 rounded-2xl pl-8 pr-4 py-2.5 text-sm font-black text-emerald-600 outline-none transition-all"
                                                        value={newPayment.amount}
                                                        onChange={(e) => setNewPayment({ ...newPayment, amount: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1 mb-1.5 block">Method</label>
                                                <select
                                                    className="w-full bg-white border-2 border-transparent focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-[var(--foreground)] outline-none appearance-none transition-all"
                                                    value={newPayment.method}
                                                    onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                                                >
                                                    <option value="upi">UPI</option>
                                                    <option value="cash">Cash</option>
                                                    <option value="bank_transfer">Transfer</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                                                Confirm Transaction
                                            </button>
                                            <button onClick={() => setShowPaymentForm(false)} className="px-6 rounded-xl bg-rose-500/10 text-rose-500 font-black text-[10px] uppercase tracking-widest">
                                                Hide
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="space-y-4">
                                    {payments.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed border-[var(--glass-border)] rounded-[2rem] opacity-40">
                                            <p className="text-[10px] font-black uppercase tracking-widest">History is Empty</p>
                                        </div>
                                    ) : (
                                        payments.map(payment => (
                                            <div key={payment.id} className="group flex items-center justify-between p-5 rounded-2xl bg-white/40 border border-[var(--glass-border)] hover:border-[var(--primary)]/30 hover:shadow-xl transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                        <CreditCard size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-[var(--foreground)] tracking-tight">₹{payment.amount.toLocaleString()}</p>
                                                        <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">{payment.method} • {format(new Date(payment.paymentDate), "MMM d, h:mm a")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-[var(--glass-border)] bg-[var(--input-bg)]/30 flex justify-between items-center">
                    <p className="text-xs text-[var(--foreground-muted)] font-medium">Last updated: {format(new Date(), "PPpp")}</p>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}
