export type NotificationType =
    | 'booking_created'
    | 'booking_updated'
    | 'booking_cancelled'
    | 'payment_received'
    | 'system_alert';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    bookingId?: string;
    propertyId?: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    count: number;
}

export interface UnreadCountResponse {
    unreadCount: number;
}
