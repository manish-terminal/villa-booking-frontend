"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/app/lib/api";
import { getUser } from "@/app/lib/auth";
import { AgentAnalytics } from "@/app/types/analytics";
import { Booking, Property } from "@/app/types/property";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import { 
  Calendar, 
  Filter, 
  RefreshCw, 
  Wallet, 
  Eye, 
  ChevronRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import BookingDetailsModal from "@/app/components/BookingDetailsModal";

// --- Date Helpers ---
const getLocalISO = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

export default function AgentDashboard() {
  const { showToast } = useToast();
  const [user] = useState(() => getUser());

  // Default date boundaries
  const today = new Date();
  const firstDay = getLocalISO(new Date(today.getFullYear(), today.getMonth(), 1));
  const lastDay = getLocalISO(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  // State
  const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: firstDay, endDate: lastDay });

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch Summary Analytics
      const data = await api.getAgentAnalytics(dateRange.startDate, dateRange.endDate);
      setAnalytics(data);

      // 2. Fetch Detailed Bookings Across Properties
      const propertiesRes = await api.getProperties();
      const properties = propertiesRes.properties || [];
      const bookingsPromises = properties.map((p: Property) => api.getBookings(p.id));
      const bookingsResults = await Promise.all(bookingsPromises);

      // 3. Process & Filter Data
      const allBookingsFlat: Booking[] = [];
      bookingsResults.forEach((res) => {
        if (res.bookings) allBookingsFlat.push(...res.bookings);
      });

      const agentBookings = allBookingsFlat.filter(b => b.bookedBy === user?.phone);
      agentBookings.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

      setAllBookings(agentBookings);
      setError(null);
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.error || "Failed to load analytics");
      showToast(apiError.error || "Failed to load analytics", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, showToast, user?.phone]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // --- Sub-sections ---

  if (loading && !refreshing) return <LoadingSkeleton />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-1">
      
      {/* 1. Dashboard Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">
            Hello, {analytics?.agentName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Partner'}! 👋
          </h1>
          <p className="text-sm font-medium text-[var(--foreground-muted)] flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" />
            Performance insights for your portfolio
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[2rem] shadow-sm backdrop-blur-md self-start lg:self-auto">
          <div className="flex items-center px-3 gap-2">
             <Calendar size={14} className="text-[var(--foreground-muted)]" />
             <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none cursor-pointer"
             />
             <div className="h-4 w-px bg-[var(--glass-border)] mx-1" />
             <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none cursor-pointer"
             />
          </div>
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className={`p-3 rounded-2xl bg-[var(--input-bg)] transition-all ${refreshing ? 'animate-spin text-[var(--secondary)]' : 'hover:scale-105 active:scale-95 text-[var(--foreground-muted)]'}`}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {error || !analytics ? (
        <div className="bg-[var(--glass-bg)] border-2 border-dashed border-[var(--glass-border)] rounded-[3rem] p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
            <AlertCircle size={32} />
          </div>
          <p className="text-[var(--foreground-muted)] font-bold uppercase text-xs tracking-widest">{error || "No data available"}</p>
          <button onClick={() => fetchAnalytics()} className="px-8 py-3 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-black text-xs uppercase tracking-widest hover:bg-[var(--primary)] hover:text-white transition-all">
            Retry Fetch
          </button>
        </div>
      ) : (
        <>
          {/* 2. Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Payments Collected" 
              value={analytics.totalCollected} 
              currency={analytics.currency} 
              icon={<CheckCircle2 size={18}/>}
              progress={(analytics.totalCollected / (analytics.totalBookingValue || 1)) * 100}
              variant="default"
            />
            <StatCard 
              label="Total Commission" 
              value={analytics.totalCommission} 
              currency={analytics.currency} 
              icon={<Wallet size={18}/>}
              variant="primary"
            />
          </div>

          {/* 3. Detailed Booking Activity */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse" />
                  <h3 className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em]">Transaction Registry</h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-[var(--input-bg)] text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">
                   {allBookings.length} Logged Stays
                </div>
            </div>

            {/* Desktop Registry */}
            <div className="hidden lg:block bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--input-bg)]/50 border-b border-[var(--glass-border)]">
                  <tr>
                    <TableHead>Property Listing</TableHead>
                    <TableHead>Guest Detail</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Stay Gross</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {allBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-[var(--input-bg)]/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-[var(--foreground)]">{booking.propertyName}</div>
                        <div className="text-[10px] text-[var(--foreground-muted)] font-black uppercase mt-1 opacity-50 tracking-tighter">#{booking.id.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="text-sm font-medium text-[var(--foreground)]">{booking.guestName}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-[var(--foreground-muted)]">
                           {new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-sm font-black text-[var(--secondary)]">₹{(booking.agentCommission || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-sm font-black text-[var(--foreground)]">₹{booking.totalAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-3 rounded-2xl bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all active:scale-95 shadow-sm"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allBookings.length === 0 && <EmptyTableState />}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Activity Stream */}
            <div className="lg:hidden space-y-4">
              {allBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  onClick={() => setSelectedBooking(booking)}
                  className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-5 space-y-5 active:scale-[0.98] transition-all"
                >
                   <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                         <h4 className="font-bold text-[var(--foreground)] truncate">{booking.propertyName}</h4>
                         <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-tighter">#{booking.id.slice(-8)}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                   </div>
                   <div className="grid grid-cols-2 gap-4 py-4 border-y border-[var(--glass-border)] border-dashed">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">Guest</p>
                         <p className="text-xs font-bold">{booking.guestName}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">Arrival</p>
                         <p className="text-xs font-bold">{new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                   </div>
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1">Commission</p>
                         <p className="text-lg font-black text-[var(--secondary)] leading-none">₹{(booking.agentCommission || 0).toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-[var(--input-bg)] flex items-center justify-center text-[var(--foreground-muted)]">
                         <ChevronRight size={18} />
                      </div>
                   </div>
                </div>
              ))}
              {allBookings.length === 0 && <div className="text-center py-10 opacity-40 uppercase text-[10px] font-black tracking-widest">No Logged History</div>}
            </div>
          </div>
        </>
      )}

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={() => fetchAnalytics(true)}
        />
      )}
    </div>
  );
}

// --- Internal UI Components ---

function StatCard({ label, value, currency, icon, progress, variant }: { label: string; value: number; currency: string; icon: React.ReactNode; progress?: number; variant: 'default' | 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-all duration-500 hover:-translate-y-1 ${
      isPrimary 
      ? "bg-[var(--foreground)] text-[var(--background)] border-transparent" 
      : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--foreground)]"
    }`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
          isPrimary ? "bg-white/10 text-white" : "bg-[var(--input-bg)] text-[var(--secondary)]"
        }`}>
          {icon}
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPrimary ? "text-white/60" : "text-[var(--foreground-muted)]"}`}>
            {label}
          </p>
          <h3 className="text-2xl font-black tracking-tight leading-none">
            <span className="text-[10px] mr-1 opacity-50">{currency}</span>
            {value.toLocaleString()}
          </h3>
        </div>
      </div>

    </div>
  );
}

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-5 text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em] ${className}`}>
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    pending_confirmation: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    checked_in: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    checked_out: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    cancelled: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.cancelled}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function EmptyTableState() {
  return (
    <tr>
      <td colSpan={7} className="px-6 py-24 text-center">
        <div className="opacity-20 flex flex-col items-center">
          <Calendar size={48} className="mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Activity in Current Window</p>
        </div>
      </td>
    </tr>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-12 animate-pulse">
      <div className="flex justify-between items-end">
        <div className="space-y-3"><div className="h-10 w-64 bg-[var(--input-bg)] rounded-2xl"/><div className="h-4 w-48 bg-[var(--input-bg)] rounded-xl"/></div>
        <div className="h-16 w-80 bg-[var(--input-bg)] rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-[var(--input-bg)]/50 rounded-[2.5rem]"/>)}
      </div>
      <div className="h-96 bg-[var(--input-bg)]/30 rounded-[3rem]" />
    </div>
  );
}