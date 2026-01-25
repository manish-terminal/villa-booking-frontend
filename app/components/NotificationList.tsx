"use client";

import { Notification } from "@/app/types/notification";
import { format } from "date-fns";
import { Bell, Check, ExternalLink, Info, Calendar, CreditCard, AlertTriangle } from "lucide-react";

interface NotificationListProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'booking_created':
            return <Calendar className="w-5 h-5 text-emerald-500" />;
        case 'booking_updated':
            return <Info className="w-5 h-5 text-blue-500" />;
        case 'booking_cancelled':
            return <AlertTriangle className="w-5 h-5 text-rose-500" />;
        case 'payment_received':
            return <CreditCard className="w-5 h-5 text-amber-500" />;
        default:
            return <Bell className="w-5 h-5 text-slate-400" />;
    }
};

export default function NotificationList({ notifications, onMarkRead, onMarkAllRead }: NotificationListProps) {
    if (notifications.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">No notifications yet</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col max-h-[400px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
                <button
                    onClick={onMarkAllRead}
                    className="text-[10px] font-bold text-[#0D7A6B] uppercase tracking-wider hover:underline"
                >
                    Mark all as read
                </button>
            </div>

            <div className="overflow-y-auto flex-1">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`p-4 border-b border-slate-50 flex gap-4 transition-colors hover:bg-slate-50 ${n.isRead ? 'opacity-60' : 'bg-emerald-50/30'}`}
                    >
                        <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${n.isRead ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                            {getNotificationIcon(n.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className={`text-sm leading-tight ${n.isRead ? 'font-bold text-slate-600' : 'font-black text-slate-900'}`}>
                                    {n.title}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap mt-0.5">
                                    {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 mb-3 break-words line-clamp-2">
                                {n.message}
                            </p>

                            <div className="flex items-center gap-3">
                                {!n.isRead && (
                                    <button
                                        onClick={() => onMarkRead(n.id)}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-[#0D7A6B] uppercase tracking-wider bg-white border border-[#0D7A6B]/20 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                                    >
                                        <Check className="w-3 h-3" />
                                        Mark Read
                                    </button>
                                )}
                                {n.bookingId && (
                                    <button
                                        onClick={() => window.location.href = `/owner/bookings?bookingId=${n.bookingId}`}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-white border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        View Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
