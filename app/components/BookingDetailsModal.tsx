"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  X,
  Calendar,

  Phone,
  Mail,
  ReceiptIndianRupee,
  PencilLine,
  Trash2,
  Check
} from "lucide-react";
import { api } from "@/app/lib/api";
import { isValidDisplayValue } from "@/app/lib/utils";
import { APIError } from "@/app/types/auth";
import { Booking, PaymentSummary } from "@/app/types/property";
import { useToast } from "@/app/components/Toast";

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdate: () => void;
  onEdit?: (booking: Booking) => void;
}

export default function BookingDetailsModal({ booking, onClose, onUpdate, onEdit }: BookingDetailsModalProps) {
  const { showToast } = useToast();
  // Removed unused user state
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);


  const fetchPaymentInfo = useCallback(async () => {
    try {
      const sRes = await api.getBookingPaymentStatus(booking.id);
      setPaymentSummary(sRes);
    } catch (err) {
      console.error("Failed to fetch payment info", err);
    }
  }, [booking.id]);

  useEffect(() => {
    fetchPaymentInfo();
  }, [fetchPaymentInfo]);

  // Removed unused handleStatusUpdate and handleSettle functions

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      await api.deleteBooking(booking.id);
      showToast("Booking deleted successfully", "success");
      onUpdate();
      onClose();
    } catch (err: unknown) {
      const apiError = err as APIError;
      showToast(apiError.error || "Failed to delete booking", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!window.confirm("Are you sure you want to mark this booking as fully paid?")) {
      return;
    }
    setLoading(true);
    try {
      await api.settleBooking(booking.id);
      showToast("Booking settled successfully", "success");
      fetchPaymentInfo();
      onUpdate();
    } catch (err: unknown) {
      const apiError = err as APIError;
      showToast(apiError.error || "Failed to settle booking", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div className="relative w-full max-w-xl h-full bg-[#f8fafc] shadow-[-20px_0_80px_rgba(0,0,0,0.08)] border-l border-slate-200 animate-in slide-in-from-right duration-500 flex flex-col">

        {/* Header Section */}
        <header className="px-10 py-12 relative overflow-hidden flex-shrink-0 bg-white border-b border-slate-100">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 pointer-events-none text-slate-900">
            <Calendar size={120} />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-900 hover:bg-slate-50 transition-all border border-slate-200 active:scale-90"
              >
                <X size={20} />
              </button>
              <div className="flex gap-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(booking)}
                    className="h-12 px-6 rounded-2xl bg-[#0F172A] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <PencilLine size={16} /> Edit
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all border border-rose-100 active:scale-90"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-xl">
                  {(isValidDisplayValue(booking.guestName) ? booking.guestName : "Guest").charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A] tracking-tight leading-none mb-2">
                    {isValidDisplayValue(booking.guestName) ? booking.guestName : "Guest"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-sm ${getStatusStyleSimplified(paymentSummary?.status || booking.status)}`}>
                      {getStatusTextSimplified(paymentSummary?.status || booking.status)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REF #{booking.id.slice(-8)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar space-y-12 bg-[#f8fafc]/50">

          {/* Guest Context Cards */}
          <div className="grid grid-cols-2 gap-4">
            <TimelineCard
              label="Check-in"
              date={booking.checkIn}
              time={booking.checkInTime}
              icon={<Calendar size={18} className="text-emerald-600" />}
            />
            <TimelineCard
              label="Check-out"
              date={booking.checkOut}
              time={booking.checkOutTime}
              icon={<Calendar size={18} className="text-rose-600" />}
            />
          </div>

          {/* Masked Contact Items */}
          <div className="grid grid-cols-1 gap-4">
            {isValidDisplayValue(booking.guestPhone) && (
              <ContactItem icon={<Phone size={18} className="text-sky-600" />} label="Phone Number" value={booking.guestPhone} />
            )}
            {isValidDisplayValue(booking.guestEmail) && (
              <ContactItem icon={<Mail size={18} className="text-indigo-600" />} label="Email Address" value={booking.guestEmail} />
            )}
          </div>

          {/* Financials Breakdown */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <ReceiptIndianRupee size={20} className="text-indigo-600" />
              <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-[0.2em]">Financial Summary</h3>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8 relative overflow-hidden group">
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stay Total</p>
                  <p className="text-4xl font-black text-[#0F172A] tracking-tight">₹{(paymentSummary?.totalAmount ?? booking.totalAmount).toLocaleString()}</p>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                <div>
                  <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">Paid Amount</p>
                  <p className="text-xl font-black text-emerald-600">₹{paymentSummary?.totalPaid.toLocaleString() || "0"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-rose-600/50 uppercase tracking-widest mb-1">Outstanding</p>
                  <p className="text-xl font-black text-rose-600">₹{paymentSummary?.totalDue.toLocaleString() || "0"}</p>
                </div>
              </div>

              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-slate-100 rounded-full blur-[80px] opacity-50 group-hover:opacity-80 transition-opacity" />
            </div>
          </section>

          {/* Metadata Section */}
          <section className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">Agent/Staff</p>
              <p className="text-xs font-black text-slate-700">{booking.bookedByName || "Direct Booking"}</p>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">Advance Method</p>
              <p className="text-xs font-black text-slate-700">{booking.advanceMethod || "N/A"}</p>
            </div>
          </section>

          {/* Settle Action */}
          <section className="pb-12">
            {(paymentSummary?.totalDue ?? 0) > 0 ? (
              <button
                onClick={handleSettle}
                disabled={loading}
                className="w-full py-4 bg-[#0F172A] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ReceiptIndianRupee size={16} />
                {loading ? "Processing..." : `Settle Outstanding ₹${(paymentSummary?.totalDue ?? 0).toLocaleString()}`}
              </button>
            ) : (
              <div className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-100">
                <Check size={16} />
                Payment Settled
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// Support components remain outside for cleanliness
function TimelineCard({ label, date, time, icon }: { label: string; date: string; time?: string; icon: React.ReactNode }) {
  return (
    <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center gap-5 group hover:border-slate-200 hover:shadow-sm transition-all shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 group-hover:bg-white transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-xs font-black text-[#0F172A]">{format(new Date(date), "EEE, MMM dd")}</p>
        {time && <p className="text-[10px] font-bold text-slate-500 mt-0.5">{time}</p>}
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-6 bg-white border border-dashed border-slate-200 rounded-[2rem] flex items-center gap-5 hover:bg-slate-50 hover:border-solid hover:border-slate-300 transition-all cursor-pointer shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-sm font-black text-[#0F172A] truncate break-all">{value}</p>
      </div>
    </div>
  );
}

const getStatusStyleSimplified = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'settled' || s === 'confirmed' || s === 'completed' || s === 'checked_in' || s === 'checked_out') {
    return 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_5px_15px_rgba(16,185,129,0.2)]';
  } else if (s === 'partial') {
    return 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-[0_5px_15px_rgba(56,189,248,0.2)]';
  }
  return 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-[0_5px_15px_rgba(245,158,11,0.2)]';
};

const getStatusTextSimplified = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'settled' || s === 'confirmed' || s === 'completed' || s === 'checked_in' || s === 'checked_out') {
    return 'Settled';
  } else if (s === 'partial') {
    return 'Partial';
  }
  return 'Pending';
};