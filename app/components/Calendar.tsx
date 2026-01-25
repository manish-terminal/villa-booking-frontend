"use client";

import { useState, useMemo } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addDays,
    isBefore,
    isAfter,
    parseISO,
    startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { OccupiedRange } from "@/app/types/property";

interface CalendarProps {
    occupiedRanges: OccupiedRange[];
    onRangeSelect: (start: Date | null, end: Date | null) => void;
    onBookingClick?: (bookingId: string) => void;
    selectedStart: Date | null;
    selectedEnd: Date | null;
    pricePerNight: number;
    currency: string;
    isOwner?: boolean;
    hideLegend?: boolean;
}

export default function Calendar({
    occupiedRanges,
    onRangeSelect,
    onBookingClick,
    selectedStart,
    selectedEnd,
    pricePerNight,
    currency,
    isOwner = false,
    hideLegend = false,
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const days = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({
            start: startDate,
            end: endDate,
        });
    }, [currentMonth]);

    const handleDateClick = (day: Date) => {
        const occupied = getOccupiedStatus(day);
        if (occupied) {
            // Priority 1: Open details if we have an ID
            const bId = occupied.bookingId || ('id' in occupied ? (occupied as { id?: string }).id : undefined);
            if (bId && isOwner && onBookingClick) {
                onBookingClick(bId);
            }
            // Always return if occupied to prevent "Check-in" selection state
            return;
        }

        // Only block new date selection for past dates
        if (isBefore(day, startOfDay(new Date()))) return;

        if (!selectedStart || (selectedStart && selectedEnd)) {
            onRangeSelect(day, null);
        } else if (selectedStart && !selectedEnd) {
            if (isSameDay(day, selectedStart) || isBefore(day, selectedStart)) {
                onRangeSelect(day, null);
            } else {
                // Check if interval has occupied days
                const hasOccupied = daysInRange(selectedStart, day).some(d => getOccupiedStatus(d));
                if (hasOccupied) {
                    // If range contains occupied dates, just start a new selection at the clicked date
                    onRangeSelect(day, null);
                } else {
                    onRangeSelect(selectedStart, day);
                }
            }
        }
    };

    const getOccupiedStatus = (day: Date) => {
        return occupiedRanges.find((range) => {
            const start = startOfDay(parseISO(range.checkIn));
            const end = startOfDay(parseISO(range.checkOut));
            return (isAfter(day, start) || isSameDay(day, start)) && isBefore(day, end);
        });
    };

    const daysInRange = (start: Date, end: Date) => {
        return eachDayOfInterval({ start, end });
    };

    const isInRange = (day: Date) => {
        if (!selectedStart || !selectedEnd) return false;
        return (
            (isAfter(day, selectedStart) || isSameDay(day, selectedStart)) &&
            (isBefore(day, selectedEnd) || isSameDay(day, selectedEnd))
        );
    };

    const getStatusColor = (status: string) => {
        return "bg-emerald-500 text-white";
    };

    return (
        <div className="glass-card overflow-hidden shadow-2xl">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)] bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                <h2 className="text-xl font-bold text-[var(--foreground)] capitalize">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-[var(--input-bg)] rounded-xl transition-all text-[var(--foreground)] active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-[var(--input-bg)] rounded-xl transition-all text-[var(--foreground)] active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-[var(--glass-border)] bg-[var(--input-bg)]/30">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {days.map((day, idx) => {
                    const occupied = getOccupiedStatus(day);
                    const isSelected = selectedStart && isSameDay(day, selectedStart);
                    const isSelectedEnd = selectedEnd && isSameDay(day, selectedEnd);
                    const inRange = isInRange(day);
                    const isTodayDate = isToday(day);
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => handleDateClick(day)}
                            className={`
                                relative h-24 sm:h-32 border-r border-b border-[var(--glass-border)] cursor-pointer transition-all duration-200
                                ${!isCurrentMonth ? "opacity-30" : "hover:bg-indigo-500/5"}
                                ${isPast && !occupied ? "cursor-not-allowed bg-gray-100/10 grayscale" : ""}
                                ${occupied ? "bg-white/5" : ""}
                                ${inRange ? "bg-indigo-500/10" : ""}
                                ${idx % 7 === 6 ? "border-r-0" : ""}
                            `}
                        >
                            <div
                                className={`
                  absolute top-2 left-2 text-sm font-medium w-8 h-8 flex items-center justify-center rounded-lg pointer-events-none
                  ${isTodayDate ? "bg-indigo-500 text-white shadow-lg" : "text-[var(--foreground)]"}
                  ${isSelected || isSelectedEnd ? "ring-2 ring-indigo-500" : ""}
                `}
                            >
                                {format(day, "d")}
                            </div>

                            {occupied && (
                                <div
                                    className={`
                                        absolute inset-x-2 bottom-3 h-1.5 rounded-full shadow-sm pointer-events-none
                                        ${getStatusColor(occupied.status).replace('text-white', '')}
                                    `}
                                />
                            )}

                            {isSelected && !selectedEnd && (
                                <div className="absolute inset-x-2 bottom-3 h-1.5 rounded-full bg-emerald-500 shadow-md animate-pulse pointer-events-none" />
                            )}

                            {isSelected && selectedEnd && (
                                <div className="absolute inset-x-2 bottom-3 h-1.5 rounded-full bg-indigo-500 shadow-md pointer-events-none" />
                            )}

                            {isSelectedEnd && (
                                <div className="absolute inset-x-2 bottom-3 h-1.5 rounded-full bg-indigo-500 shadow-md pointer-events-none" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
