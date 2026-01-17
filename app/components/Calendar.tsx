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
    selectedStart: Date | null;
    selectedEnd: Date | null;
    pricePerNight: number;
    currency: string;
    isOwner?: boolean;
}

export default function Calendar({
    occupiedRanges,
    onRangeSelect,
    selectedStart,
    selectedEnd,
    pricePerNight,
    currency,
    isOwner = false,
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
        if (isBefore(day, startOfDay(new Date()))) return;

        // Check if day is occupied
        const occupied = getOccupiedStatus(day);
        if (occupied) return; // Strictly prevent selecting an occupied day

        if (!selectedStart || (selectedStart && selectedEnd)) {
            onRangeSelect(day, null);
        } else if (selectedStart && !selectedEnd) {
            if (isBefore(day, selectedStart)) {
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
        switch (status) {
            case "confirmed":
                return "bg-rose-500 text-white";
            case "pending_confirmation":
                return "bg-rose-300 text-white";
            default:
                return "bg-rose-500 text-white";
        }
    };

    return (
        <div className="glass-card overflow-hidden animate-fade-in shadow-2xl">
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
                ${isPast || occupied ? "cursor-not-allowed bg-gray-100/10 grayscale" : ""}
                ${inRange ? "bg-indigo-500/10" : ""}
                ${idx % 7 === 6 ? "border-r-0" : ""}
              `}
                        >
                            <div
                                className={`
                  absolute top-2 left-2 text-sm font-medium w-8 h-8 flex items-center justify-center rounded-lg
                  ${isTodayDate ? "bg-indigo-500 text-white shadow-lg" : "text-[var(--foreground)]"}
                  ${isSelected || isSelectedEnd ? "ring-2 ring-indigo-500" : ""}
                `}
                            >
                                {format(day, "d")}
                            </div>

                            {occupied && (
                                <div
                                    className={`
                    absolute inset-x-1 bottom-2 p-1.5 rounded-lg text-[10px] font-bold truncate shadow-sm animate-slide-up
                    ${getStatusColor(occupied.status)}
                  `}
                                >
                                    {isOwner && occupied.guestName ? occupied.guestName : "Occupied"}
                                </div>
                            )}

                            {isSelected && !selectedEnd && (
                                <div className="absolute inset-x-1 bottom-2 p-1.5 rounded-lg text-[10px] font-bold bg-emerald-500 text-white text-center shadow-md animate-pulse">
                                    Check-in
                                </div>
                            )}

                            {isSelected && selectedEnd && (
                                <div className="absolute inset-x-1 bottom-2 p-1.5 rounded-lg text-[10px] font-bold bg-indigo-500 text-white text-center shadow-md">
                                    Check-in
                                </div>
                            )}

                            {isSelectedEnd && (
                                <div className="absolute inset-x-1 bottom-2 p-1.5 rounded-lg text-[10px] font-bold bg-indigo-500 text-white text-center shadow-md">
                                    Check-out
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="p-4 bg-[var(--input-bg)]/30 border-t border-[var(--glass-border)] flex flex-wrap gap-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500"></div>
                    <span className="text-[var(--foreground-muted)]">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-rose-500"></div>
                    <span className="text-[var(--foreground-muted)]">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-rose-300"></div>
                    <span className="text-[var(--foreground-muted)]">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-indigo-500"></div>
                    <span className="text-[var(--foreground-muted)]">Selected</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--primary-500)] ml-auto cursor-help group relative">
                    <Info size={14} />
                    <span>About selection</span>
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 text-[var(--foreground)] font-normal text-xs pointer-events-none">
                        Click twice to select stay dates. Past dates and occupied slots are locked.
                    </div>
                </div>
            </div>
        </div>
    );
}
