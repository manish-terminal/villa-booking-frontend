// Analytics Types

export interface PropertyStats {
    propertyId: string;
    propertyName: string;
    totalBookings: number;
    totalRevenue: number;
    totalCollected: number;
    occupancyDays: number;
    averagePrice?: number; // ADR for this specific villa
}

export interface OwnerAnalytics {
    ownerName: string;
    ownerPhone: string;
    totalProperties: number;
    totalBookings: number;
    totalRevenue: number;
    totalCollected: number;
    totalPending: number;
    averagePrice?: number; // Portfolio ADR
    currency: string;
    bookingsByStatus: Record<string, number>;
    paymentsByStatus: Record<string, number>;
    propertyStats: PropertyStats[];
    periodStart: string;
    periodEnd: string;
}

export interface AgentAnalyticsDelta {
    revenueChange: number;
    commissionChange: number;
    avgCommissionChange: number;
    bookingsChange: number;
}

export interface AgentAnalytics {
    agentName: string;
    agentPhone: string;
    totalBookings: number;
    totalBookingValue: number;
    totalCollected: number;
    totalCommission: number;
    averageCommission: number;
    deltas: AgentAnalyticsDelta;
    currency: string;
    bookingsByStatus: Record<string, number>;
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
    monthlyPerformance: MonthlyPerformance[];
    volumeStats: VolumeStats;
    periodStart: string;
    periodEnd: string;
}

export interface MonthlyPerformance {
    month: string;
    revenue: number;
    commission: number;
    bookingCount: number;
}

export interface VolumeStats {
    highestMonth: string;
    slowestMonth: string;
}

export interface PropertyPerformance {
    propertyId: string;
    propertyName: string;
    totalRevenue: number;
    totalCommission: number;
    bookingCount: number;
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

export interface GlobalStats {
    totalGMV: number;
    activeProperties: number;
    activeAgents: number;
    totalBookings: number;
    totalUsers: number;
}

export interface TopProperty {
    propertyId: string;
    propertyName: string;
    ownerName: string;
    totalRevenue: number;
    bookingCount: number;
}

export interface TopAgent {
    agentName: string;
    agentPhone: string;
    totalSales: number;
    bookingCount: number;
}

export interface AdminDashboardResponse {
    globalStats: GlobalStats;
    topProperties: TopProperty[];
    topAgents: TopAgent[];
}
