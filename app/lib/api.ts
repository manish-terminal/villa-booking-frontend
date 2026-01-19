import {
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
    LoginRequest,
    LoginResponse,
    ValidateInviteCodeRequest,
    ValidateInviteCodeResponse,
    APIError,
} from "@/app/types/auth";
import { OwnerAnalytics, AgentAnalytics, DashboardStats } from "@/app/types/analytics";
import { Property, CreatePropertyRequest, PropertiesListResponse, InviteCode, PropertyCalendarResponse, AvailabilityResponse, CreateBookingRequest, Booking, BookingsListResponse, Payment, OfflinePaymentRequest, PaymentSummary, PaymentListResponse } from "@/app/types/property";

const API_BASE_URL =
    "https://vwn08g3i79.execute-api.ap-south-1.amazonaws.com/prod";

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string>),
        };

        // Add auth token if available
        const token =
            typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        // Log API Interaction
        console.group(`API ${options.method || "GET"} ${endpoint}`);
        console.log("URL:", url);
        if (options.body) console.log("Payload:", JSON.parse(options.body as string));
        console.log("Response:", data);
        console.groupEnd();

        if (!response.ok) {
            const error: APIError = {
                error: data.error || data.message || "An error occurred",
                message: data.message,
                statusCode: response.status,
            };
            throw error;
        }

        return data as T;
    }

    // Send OTP to phone number
    async sendOTP(phone: string): Promise<SendOTPResponse> {
        const payload: SendOTPRequest = { phone };
        return this.request<SendOTPResponse>("/auth/send-otp", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    // Verify OTP and authenticate
    async verifyOTP(
        phone: string,
        code: string,
        name?: string,
        role?: "admin" | "owner" | "agent"
    ): Promise<VerifyOTPResponse> {
        const payload: VerifyOTPRequest = { phone, code };
        if (name) payload.name = name;
        if (role) payload.role = role;

        return this.request<VerifyOTPResponse>("/auth/verify-otp", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    // Login with password
    async login(phone: string, password: string): Promise<LoginResponse> {
        const payload: LoginRequest = { phone, password };
        return this.request<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    // Validate invite code
    async validateInviteCode(
        code: string
    ): Promise<ValidateInviteCodeResponse> {
        const payload: ValidateInviteCodeRequest = { code };
        return this.request<ValidateInviteCodeResponse>("/invite-codes/validate", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    // Refresh token
    async refreshToken(): Promise<LoginResponse> {
        return this.request<LoginResponse>("/auth/refresh", {
            method: "POST",
        });
    }

    // Set password
    async setPassword(
        password: string,
        oldPassword?: string
    ): Promise<{ message: string }> {
        const payload = { password, oldPassword };
        return this.request<{ message: string }>("/users/password", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    // --- Property Management ---

    // Get my properties
    async getProperties(): Promise<PropertiesListResponse> {
        return this.request<PropertiesListResponse>("/properties", {
            method: "GET",
        });
    }

    // Get single property
    async getProperty(id: string): Promise<Property> {
        return this.request<Property>(`/properties/${id}`, {
            method: "GET",
        });
    }

    // Create property
    async createProperty(data: CreatePropertyRequest): Promise<Property> {
        return this.request<Property>("/properties", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // Update property
    async updateProperty(id: string, data: Partial<CreatePropertyRequest>): Promise<Property> {
        return this.request<Property>(`/properties/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    // Delete/deactivate property
    async deleteProperty(id: string): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/properties/${id}`, {
            method: "DELETE",
        });
    }

    // Generate invite code for a property
    async generateInviteCode(
        propertyId: string,
        expiresInDays: number = 30,
        maxUses: number = 10
    ): Promise<InviteCode> {
        return this.request<InviteCode>(`/properties/${propertyId}/invite-codes`, {
            method: "POST",
            body: JSON.stringify({ expiresInDays, maxUses }),
        });
    }

    // Get invite codes for a property
    async getPropertyInviteCodes(propertyId: string): Promise<{ codes: InviteCode[] }> {
        return this.request<{ codes: InviteCode[] }>(`/properties/${propertyId}/invite-codes`, {
            method: "GET",
        });
    }

    // --- Booking Management ---

    // Get property calendar
    async getPropertyCalendar(propertyId: string, startDate?: string, endDate?: string): Promise<PropertyCalendarResponse> {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        const query = params.toString() ? `?${params.toString()}` : "";
        return this.request<PropertyCalendarResponse>(`/properties/${propertyId}/calendar${query}`, {
            method: "GET",
        });
    }

    // Check availability
    async checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<AvailabilityResponse> {
        return this.request<AvailabilityResponse>(`/properties/${propertyId}/availability?checkIn=${checkIn}&checkOut=${checkOut}`, {
            method: "GET",
        });
    }

    // Create booking
    async createBooking(data: CreateBookingRequest): Promise<Booking> {
        return this.request<Booking>("/bookings", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // List bookings
    async getBookings(propertyId: string, startDate?: string, endDate?: string): Promise<BookingsListResponse> {
        const params = new URLSearchParams({ propertyId });
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        const query = `?${params.toString()}`;
        return this.request<BookingsListResponse>(`/bookings${query}`, {
            method: "GET",
        });
    }

    // Get booking by ID
    async getBooking(id: string): Promise<Booking> {
        return this.request<Booking>(`/bookings/${id}`, {
            method: "GET",
        });
    }

    // Update booking status
    async updateBookingStatus(id: string, status: string): Promise<{ message: string; bookingId: string; status: string }> {
        return this.request<{ message: string; bookingId: string; status: string }>(`/bookings/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
    }

    // --- Payment Management ---

    // Log offline payment
    async logPayment(bookingId: string, data: OfflinePaymentRequest): Promise<{ payment: Payment; summary: PaymentSummary; message: string }> {
        return this.request<{ payment: Payment; summary: PaymentSummary; message: string }>(`/bookings/${bookingId}/payments`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // Get all payments for a booking
    async getBookingPayments(bookingId: string): Promise<PaymentListResponse> {
        return this.request<PaymentListResponse>(`/bookings/${bookingId}/payments`, {
            method: "GET",
        });
    }

    // Get payment status summary
    async getBookingPaymentStatus(bookingId: string): Promise<PaymentSummary> {
        return this.request<PaymentSummary>(`/bookings/${bookingId}/payment-status`, {
            method: "GET",
        });
    }

    // --- Analytics ---

    // Get owner analytics
    async getOwnerAnalytics(
        startDate?: string,
        endDate?: string
    ): Promise<OwnerAnalytics> {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const query = params.toString() ? `?${params.toString()}` : "";
        return this.request<OwnerAnalytics>(`/analytics/owner${query}`, {
            method: "GET",
        });
    }

    // Get agent analytics
    async getAgentAnalytics(
        startDate?: string,
        endDate?: string
    ): Promise<AgentAnalytics> {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const query = params.toString() ? `?${params.toString()}` : "";
        return this.request<AgentAnalytics>(`/analytics/agent${query}`, {
            method: "GET",
        });
    }

    // Get dashboard stats
    async getDashboardStats(): Promise<DashboardStats> {
        return this.request<DashboardStats>("/analytics/dashboard", {
            method: "GET",
        });
    }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// Export class for testing
export { ApiClient };
