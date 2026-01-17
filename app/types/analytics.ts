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

export interface AnalyticsFilters {
    startDate?: string;
    endDate?: string;
}
