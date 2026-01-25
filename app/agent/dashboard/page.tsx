"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/app/lib/api";
import { getUser } from "@/app/lib/auth";
import { Booking, Property } from "@/app/types/property";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import BookingDetailsModal from "@/app/components/BookingDetailsModal";
import AgentBookingSidebar from "@/app/components/AgentBookingSidebar";
import BookingCard, { BookingWithPayment } from "@/app/components/BookingCard";
import { AgentAnalytics } from "@/app/types/analytics";

export default function AgentDashboard() {
  const { showToast } = useToast();
  const [user] = useState(() => getUser());

  // State
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithPayment[]>([]);
  const [historyBookings, setHistoryBookings] = useState<BookingWithPayment[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    try {
      // 1. Fetch Properties & Analytics for quick stats
      const [propertiesRes, analyticsData] = await Promise.all([
        api.getProperties(),
        api.getAgentAnalytics() // Get overall analytics for quick stats
      ]);
      const currentProperties = propertiesRes.properties || [];
      setProperties(currentProperties);
      setAnalytics(analyticsData);

      // 2. Fetch Bookings for all properties
      const bookingsPromises = currentProperties.map((p: Property) => api.getBookings(p.id));
      const bookingsResults = await Promise.all(bookingsPromises);

      // 3. Process & Filter Data
      const allBookingsFlat: Booking[] = [];
      bookingsResults.forEach((res) => {
        if (res.bookings) allBookingsFlat.push(...res.bookings);
      });

      const agentBookings = allBookingsFlat.filter(b => b.bookedBy === user?.phone);

      const todayISO = new Date().toISOString().split('T')[0];
      const active = agentBookings
        .filter(b => b.checkIn >= todayISO)
        .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

      const history = agentBookings
        .filter(b => b.checkIn < todayISO)
        .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
        .slice(0, 5);

      // 4. Fetch Payment Status for Active Bookings
      const enrichWithPayments = async (bookings: Booking[]) => {
        return Promise.all(bookings.map(async (b) => {
          try {
            const paymentSummary = await api.getBookingPaymentStatus(b.id);
            return { ...b, paymentSummary };
          } catch {
            return b;
          }
        }));
      };

      const [activeEnriched, historyEnriched] = await Promise.all([
        enrichWithPayments(active),
        enrichWithPayments(history)
      ]);

      setUpcomingBookings(activeEnriched);
      setHistoryBookings(historyEnriched);
      setHasMoreHistory(agentBookings.filter(b => b.checkIn < todayISO).length > 5);
      setError(null);
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.error || "Failed to load dashboard");
      showToast(apiError.error || "Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, user?.phone]);

  const loadMoreHistory = async () => {
    if (loadingHistory) return;
    setLoadingHistory(true);
    try {
      // Re-fetch logic (simplified: re-fetch all properties to get raw list)
      // Ideally we should cache the full list or paginate from backend, but current API is per-property.
      // For now, reusing the fetch logic pattern
      const propertiesRes = await api.getProperties();
      const properties = propertiesRes.properties || [];
      const bookingsPromises = properties.map((p: Property) => api.getBookings(p.id));
      const bookingsResults = await Promise.all(bookingsPromises);

      const allBookingsFlat: Booking[] = [];
      bookingsResults.forEach((res) => {
        if (res.bookings) allBookingsFlat.push(...res.bookings);
      });

      const agentBookings = allBookingsFlat.filter(b => b.bookedBy === user?.phone);
      const todayISO = new Date().toISOString().split('T')[0];
      const startIdx = historyPage * 5;

      const nextHistory = agentBookings
        .filter(b => b.checkIn < todayISO)
        .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
        .slice(startIdx, startIdx + 5);

      const nextEnriched = await Promise.all(nextHistory.map(async (b) => {
        try {
          const paymentSummary = await api.getBookingPaymentStatus(b.id);
          return { ...b, paymentSummary };
        } catch {
          return b;
        }
      }));

      setHistoryBookings(prev => [...prev, ...nextEnriched]);
      setHistoryPage(prev => prev + 1);
      setHasMoreHistory(agentBookings.filter(b => b.checkIn < todayISO).length > startIdx + 5);
    } catch (err) {
      console.error("Failed to load more history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setSelectedBooking(null);
  };

  const formatCurrency = (value: number, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return (
    <div className="animate-pulse space-y-6 max-w-7xl mx-auto p-4">
      <div className="space-y-4 px-4">
        {[1, 2, 3].map(i => <div key={i} className="bg-white/50 rounded-[2rem] h-40"></div>)}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-1 pt-4">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 mb-1">
            Hello, {user?.name?.split(' ')[0] || 'Partner'}! 👋
          </h1>
          <p className="text-slate-400 text-sm font-medium">Here&apos;s what&apos;s happening today</p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {/* Active Bookings Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Upcoming Stays</p>
          <h4 className="text-2xl font-black text-slate-900 mt-1">{upcomingBookings.length}</h4>
        </div>

        {/* Total Collected (Quick View) */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Month Earnings</p>
          <h4 className="text-2xl font-black text-emerald-600 mt-1">
            {analytics ? formatCurrency(analytics.totalCommission) : '-'}
          </h4>
        </div>
      </div>

      {error ? (
        <div className="mx-4 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
          <p className="text-red-600 text-sm font-bold">{error}</p>
          <button onClick={() => fetchDashboardData(true)} className="text-red-600 text-xs mt-2 underline font-bold">Retry</button>
        </div>
      ) : (
        <>
          {/* Upcoming Bookings */}
          <div className="px-4">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                Upcoming Bookings
              </h3>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
                <p className="text-slate-400 text-sm">No upcoming bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    onEdit={() => handleEdit(booking)}
                    onSelect={() => setSelectedBooking(booking)}
                    commission={booking.agentCommission}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Booking History */}
          <div className="mt-8 px-4">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Booking History
              </h3>
            </div>

            {historyBookings.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
                <p className="text-slate-400 text-sm">No past bookings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    isHistory
                    onEdit={() => handleEdit(booking)}
                    onSelect={() => setSelectedBooking(booking)}
                    commission={booking.agentCommission}
                  />
                ))}

                {hasMoreHistory && (
                  <button
                    onClick={loadMoreHistory}
                    disabled={loadingHistory}
                    className="w-full py-4 bg-white border border-slate-100 rounded-[2rem] text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    {loadingHistory ? "Loading..." : "Load Older Records"}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={() => fetchDashboardData(true)}
          onEdit={handleEdit}
        />
      )}

      {editingBooking && properties.find(p => p.id === editingBooking.propertyId) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setEditingBooking(null)}
          />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
            <AgentBookingSidebar
              bookingToEdit={editingBooking}
              property={properties.find(p => p.id === editingBooking.propertyId)!}
              checkIn={new Date(editingBooking.checkIn)}
              checkOut={new Date(editingBooking.checkOut)}
              onCancel={() => setEditingBooking(null)}
              onSuccess={() => {
                setEditingBooking(null);
                fetchDashboardData(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}