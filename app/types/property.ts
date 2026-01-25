// Property Types

export interface Property {
    id: string;
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    ownerId: string;
    pricePerNight: number;
    currency: string;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    images?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePropertyRequest {
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pricePerNight: number;
    currency?: string;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    images?: string[];
}

export interface PropertiesListResponse {
    properties: Property[];
    count: number;
}

// Invite Code Types
export interface InviteCode {
    code: string;
    propertyId: string;
    propertyName: string;
    createdBy: string;
    createdAt: string;
    expiresAt: string;
    maxUses: number;
    usedCount: number;
    isActive: boolean;
    // DynamoDB fields (optional, returned by API)
    PK?: string;
    SK?: string;
    GSI1PK?: string;
    GSI1SK?: string;
    TTL?: number;
}

export interface CreateInviteCodeRequest {
    expiresInDays: number;
    maxUses: number;
}

// Calendar & Booking Types
export interface OccupiedRange {
    bookingId?: string; // ID to link to full booking details
    checkIn: string; // ISO string
    checkOut: string; // ISO string
    status: "pending_confirmation" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show" | "partial" | "settled";
    guestName?: string; // Only for owners/admins
}

export interface PropertyCalendarResponse {
    propertyId: string;
    startDate: string;
    endDate: string;
    occupied: OccupiedRange[];
}

export interface AvailabilityResponse {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    available: boolean;
    bookings?: Booking[];
}

export interface Booking {
    id: string;
    propertyId: string;
    propertyName: string;
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    numGuests: number;
    checkIn: string;
    checkOut: string;
    numNights: number;
    pricePerNight: number;
    totalAmount: number;
    agentCommission: number;
    currency: string;
    status: string;
    bookedBy: string;
    advanceMethod?: string;
    notes?: string;
    specialRequests?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookingRequest {
    propertyId: string;
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    numGuests: number;
    checkIn: string;
    checkOut: string;
    notes?: string;
    specialRequests?: string;
    inviteCode?: string;
    pricePerNight?: number;
    totalAmount?: number;
    agentCommission?: number;
    advanceAmount?: number;
    advanceMethod?: string;
}

export interface BookingsListResponse {
    bookings: Booking[];
    count: number;
}

// Payment Types
export interface Payment {
    id: string;
    bookingId: string;
    amount: number;
    currency: string;
    method: "cash" | "upi" | "bank_transfer" | "cheque" | "other";
    reference: string;
    recordedBy: string;
    notes?: string;
    paymentDate: string;
    createdAt: string;
}

export interface OfflinePaymentRequest {
    amount: number;
    method: string;
    reference: string;
    notes?: string;
    paymentDate: string;
}

export interface PaymentSummary {
    bookingId: string;
    totalAmount: number;
    totalPaid: number;
    totalDue: number;
    status: "pending" | "partial" | "completed" | "due";
    paymentCount?: number;
    currency: string;
    lastUpdated: string;
    lastPaymentDate?: string;
}

export interface PaymentListResponse {
    payments: Payment[];
    count: number;
}
