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
    checkIn: string; // ISO string
    checkOut: string; // ISO string
    status: "pending_confirmation" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show";
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
    currency: string;
    status: string;
    bookedBy: string;
    notes?: string;
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
}

export interface BookingsListResponse {
    bookings: Booking[];
    count: number;
}
