"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  X,
  Calendar,
  Users,
  FileText,
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  UserCheck,
  LogOut,
  Ban,
  ExternalLink,
  Phone,
  Mail,
  ReceiptIndianRupee,
  ShieldCheck,
  History
} from "lucide-react";
import { api } from "@/app/lib/api";
import { getUser } from "@/app/lib/auth";
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
  const [user] = useState(() => getUser());
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
      showToast(`Status: ${newStatus.replace("_", " ").toUpperCase()}`, "success");
      onUpdate();
    } catch (err: any) {
      showToast(err.error || "Status update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!paymentSummary || paymentSummary.totalDue <= 0) return;
    setLoading(true);
    try {
      await api.logPayment(booking.id, {
        amount: paymentSummary.totalDue,
        method: "cash",
        reference: "Balance Settlement",
        paymentDate: format(new Date(), "yyyy-MM-dd"),
        notes: "Quick settlement of full remaining balance",
      });
      await api.updateBookingStatus(booking.id, "checked_out");
      showToast("Settled & Checked Out", "success");
      fetchPaymentInfo();
      onUpdate();
    } catch (err: any) {
      showToast(err.error || "Settlement failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.logPayment(booking.id, newPayment);
      showToast("Transaction Logged", "success");
      setShowPaymentForm(false);
      fetchPaymentInfo();
      onUpdate();
    } catch (err: any) {
      showToast(err.error || "Logging failed", "error");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl max-h-[95vh] bg-[var(--background)] border border-[var(--glass-border)] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        {/* Visual Header Strip */}
        <div className="h-2 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)]" />

        {/* Modal Header */}
        <header className="px-8 py-6 border-b border-[var(--glass-border)] bg-[var(--input-bg)]/30 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-black text-xl shadow-lg">
              {booking.guestName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">{booking.guestName}</h2>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${currentStatus.color} ${currentStatus.bg} border-current/20`}>
                  <currentStatus.icon size={10} strokeWidth={3} />
                  {currentStatus.label}
                </span>
              </div>
              <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <span className="text-[var(--primary)]">REF #{booking.id.slice(-8)}</span>
                <span className="opacity-20">|</span>
                <span className="flex items-center gap-1"><Users size={12} /> {booking.numGuests} Guests</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-red-500 transition-all duration-300">
            <X size={20} />
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Details & Ops */}
            <div className="lg:col-span-7 p-8 space-y-10 border-r border-[var(--glass-border)]">
              
              {/* Timeline Info */}
              <div className="grid grid-cols-2 gap-4">
                <TimelineCard label="Check-in" date={booking.checkIn} icon={<Calendar className="text-emerald-500" />} />
                <TimelineCard label="Check-out" date={booking.checkOut} icon={<Calendar className="text-rose-500" />} />
              </div>

              {/* Status Management */}
              <section className="space-y-4">
                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1 block">Workflow Stage</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-[var(--input-bg)]/50 border border-[var(--glass-border)] rounded-2xl">
                  {statuses.map(s => (
                    <button
                      key={s.id}
                      disabled={loading || booking.status === s.id}
                      onClick={() => handleStatusUpdate(s.id)}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300
                        ${booking.status === s.id 
                          ? "bg-[var(--background)] text-[var(--primary)] shadow-md border border-[var(--glass-border)] scale-100" 
                          : "text-[var(--foreground-muted)] opacity-50 hover:opacity-100 hover:bg-[var(--background)]/80"
                        }
                      `}
                    >
                      <s.icon size={16} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">{s.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Contacts & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ContactItem icon={<Phone size={16}/>} label="Phone Number" value={booking.guestPhone} />
                <ContactItem icon={<Mail size={16}/>} label="Email Address" value={booking.guestEmail || "Not Provided"} />
              </div>

              {booking.notes && (
                <section className="bg-[var(--input-bg)]/30 border border-[var(--glass-border)] p-6 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FileText size={40} />
                  </div>
                  <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest block mb-3">Front-Desk Notes</label>
                  <p className="text-sm font-medium leading-relaxed italic">"{booking.notes}"</p>
                </section>
              )}
            </div>

            {/* Right Column: Ledger & Finance */}
            <div className="lg:col-span-5 p-8 bg-[var(--input-bg)]/20 space-y-8">
              
              {/* Balance Hero Card */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">Financial Ledger</h3>
                   {paymentSummary && (
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter text-white ${paymentSummary.status === 'completed' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                        {paymentSummary.status}
                      </span>
                   )}
                </div>

                <div className="bg-[var(--foreground)] text-[var(--background)] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <p className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Stay Total</p>
                        <p className="text-3xl font-black tracking-tight">₹{booking.totalAmount.toLocaleString()}</p>
                      </div>
                      {user?.role === "agent" && (
                        <div className="text-right">
                          <p className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Agent Fee</p>
                          <p className="text-xl font-black text-[var(--secondary)]">₹{(booking.agentCommission || 0).toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 mb-8">
                      <div>
                        <p className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1 text-emerald-300">Received</p>
                        <p className="text-lg font-black text-emerald-300">₹{paymentSummary?.totalPaid.toLocaleString() || "0"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1 text-rose-300">Due Balance</p>
                        <p className="text-lg font-black text-rose-300">₹{paymentSummary?.totalDue.toLocaleString() || "0"}</p>
                      </div>
                    </div>

                    {paymentSummary && paymentSummary.totalDue > 0 && (
                      <button
                        onClick={handleSettle}
                        disabled={loading}
                        className="w-full h-14 bg-[var(--secondary)] text-[var(--primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <ReceiptIndianRupee size={16} /> Quick Settle Full Balance
                      </button>
                    )}
                  </div>
                  {/* Decorative Gradient */}
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[var(--primary)] rounded-full blur-3xl opacity-20" />
                </div>
              </section>

              {/* Transaction History */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History size={14} className="text-[var(--foreground-muted)]" />
                    <h3 className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">Transaction History</h3>
                  </div>
                  <button
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg hover:rotate-90 transition-all duration-300"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>

                {/* Inline Payment Form */}
                {showPaymentForm && (
                  <form onSubmit={handleLogPayment} className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl animate-in slide-in-from-top-4 duration-300 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                         <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest ml-1">Manual Amount</label>
                         <input
                           type="number" required
                           className="w-full bg-white border border-emerald-500/20 rounded-xl px-4 py-2 text-sm font-bold text-emerald-600 outline-none"
                           value={newPayment.amount}
                           onChange={e => setNewPayment({ ...newPayment, amount: parseInt(e.target.value) || 0 })}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest ml-1">Mode</label>
                         <select
                           className="w-full bg-white border border-emerald-500/20 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                           value={newPayment.method}
                           onChange={e => setNewPayment({ ...newPayment, method: e.target.value })}
                         >
                           <option value="upi">UPI</option>
                           <option value="cash">Cash</option>
                           <option value="bank_transfer">Transfer</option>
                         </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button type="submit" disabled={loading} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Commit Entry</button>
                       <button onClick={() => setShowPaymentForm(false)} className="px-4 py-3 bg-white text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest">Cancel</button>
                    </div>
                  </form>
                )}

                {/* Payment List */}
                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-[var(--glass-border)] rounded-3xl text-center opacity-30">
                      <CreditCard size={24} className="mx-auto mb-2" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]">No records found</p>
                    </div>
                  ) : (
                    payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-[var(--background)] border border-[var(--glass-border)] rounded-2xl hover:border-[var(--primary)] transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[var(--input-bg)] flex items-center justify-center text-[var(--foreground-muted)] group-hover:text-[var(--primary)] transition-colors">
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black">₹{p.amount.toLocaleString()}</p>
                            <p className="text-[8px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">{p.method} • {format(new Date(p.paymentDate), "MMM dd, hh:mm a")}</p>
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

        {/* Modal Footer */}
        <footer className="px-8 py-6 bg-[var(--input-bg)]/30 border-t border-[var(--glass-border)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--foreground-muted)] opacity-50">
             <ShieldCheck size={14} />
             <p className="text-[9px] font-bold uppercase tracking-widest">Audited: {format(new Date(), "PPpp")}</p>
          </div>
          <button
            onClick={onClose}
            className="px-10 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[var(--primary)] hover:text-white transition-all shadow-xl active:scale-95"
          >
            Exit Dashboard
          </button>
        </footer>
      </div>
    </div>
  );
}

// --- Internal Support UI ---

function TimelineCard({ label, date, icon }: { label: string; date: string; icon: React.ReactNode }) {
  return (
    <div className="p-5 bg-[var(--input-bg)]/40 border border-[var(--glass-border)] rounded-3xl flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[var(--background)] flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xs font-black">{format(new Date(date), "EEE, MMM dd, yyyy")}</p>
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-5 border border-dashed border-[var(--glass-border)] rounded-3xl flex items-center gap-4 group hover:bg-[var(--input-bg)] transition-all">
      <div className="w-10 h-10 rounded-xl bg-[var(--input-bg)] text-[var(--foreground-muted)] flex items-center justify-center group-hover:text-[var(--primary)] transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xs font-black truncate">{value}</p>
      </div>
    </div>
  );
}