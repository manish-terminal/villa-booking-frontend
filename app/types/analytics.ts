// Analytics Types

export interface PropertyStats {
    propertyId: string;
    propertyName: string;
    totalBookings: number;
    totalRevenue: number;
    totalCollected: number;
    occupancyDays: number;
}

export interface OwnerAnalytics {
    ownerName: string;
    ownerPhone: string;
    totalProperties: number;
    totalBookings: number;
    totalRevenue: number;
    totalCollected: number;
    totalPending: number;
    currency: string;
    bookingsByStatus: {
        confirmed: number;
        pending_confirmation: number;
        checked_out: number;
    };
    paymentsByStatus: {
        completed: number;
        due: number;
        pending: number;
    };
    propertyStats: PropertyStats[];
    periodStart: string;
    periodEnd: string;
}

export interface AgentAnalytics {
    agentName: string;
    agentPhone: string;
    totalBookings: number;
    totalBookingValue: number;
    totalCollected: number;
    totalCommission: number;
    currency: string;
    bookingsByStatus: {
        confirmed: number;
        pending_confirmation: number;
    };
    recentBookings: {
        bookingId: string;
        propertyName: string;
        guestName: string;
        checkIn: string;
        checkOut: string;
        totalAmount: number;
        agentCommission: number;
        status: string;
        paymentStatus: string;
    }[];
    periodStart: string;
    periodEnd: string;
}

export interface DashboardStats {
    todayCheckIns: number;
    todayCheckOuts: number;
    pendingApprovals: number;
    pendingPayments: number;
    totalDueAmount: number;
    currency: string;
}

export interface AnalyticsFilters {
    startDate?: string;
    endDate?: string;
}
