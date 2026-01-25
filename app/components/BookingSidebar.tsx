"use client";

import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { api } from "@/app/lib/api";
import { useToast } from "@/app/components/Toast";
import { CreateBookingRequest, Property, Booking } from "@/app/types/property";

interface BookingSidebarProps {
    property: Property;
    checkIn: Date | null;
    checkOut: Date | null;
    bookingToEdit?: Booking;
    onSuccess: () => void;
    onCancel: () => void;
}

// Step indicator component
function StepIndicator({ currentStep }: { currentStep: number; totalSteps: number }) {
    const steps = ["Guest Info", "Pricing", "Confirm"];
    return (
        <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center relative">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${index + 1 <= currentStep
                                ? 'bg-[#0D7A6B] text-white'
                                : 'bg-slate-100 text-slate-400'
                                }`}
                        >
                            {index + 1 <= currentStep - 1 ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                index + 1
                            )}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${index + 1 <= currentStep ? 'text-[#0D7A6B]' : 'text-slate-400'
                            }`}>
                            {step}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 transition-all ${index + 1 < currentStep ? 'bg-[#0D7A6B]' : 'bg-slate-200'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export default function BookingSidebar({
    property,
    checkIn,
    checkOut,
    bookingToEdit,
    onSuccess,
    onCancel,
}: BookingSidebarProps) {
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        guestName: bookingToEdit?.guestName || "",
        guestPhone: bookingToEdit?.guestPhone || "",
        guestEmail: bookingToEdit?.guestEmail || "",
        checkInTime: bookingToEdit?.checkInTime || "14:00",
        checkOutTime: bookingToEdit?.checkOutTime || "11:00",
        numGuests: bookingToEdit?.numGuests || 1,
        notes: bookingToEdit?.notes || "",
        specialRequests: bookingToEdit?.specialRequests || "",
        pricePerNight: bookingToEdit?.pricePerNight || property?.pricePerNight || 0,
        totalAmount: bookingToEdit?.totalAmount || 0,
        agentCommission: bookingToEdit?.agentCommission || 0,
        advancePayment: 0, // Usually not updated during edit unless it's a new log
        paymentMethod: "upi",
    });

    const numNights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

    // Sync pricePerNight when property changes
    useEffect(() => {
        if (property?.pricePerNight && !bookingToEdit) {
            setFormData(prev => ({ ...prev, pricePerNight: property.pricePerNight }));
        }
    }, [property?.pricePerNight, bookingToEdit]);

    // Effect to update total when price or nights changes
    useEffect(() => {
        if (numNights > 0) {
            setFormData(prev => ({ ...prev, totalAmount: numNights * prev.pricePerNight }));
        }
    }, [numNights, formData.pricePerNight]);

    const validateStep1 = () => {
        if (!formData.guestName.trim()) {
            showToast("Please enter guest name", "error");
            return false;
        }
        if (!formData.guestPhone.trim() || formData.guestPhone.length < 10) {
            showToast("Please enter valid phone number", "error");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (formData.pricePerNight <= 0) {
            showToast("Please enter price per night", "error");
            return false;
        }
        if (formData.totalAmount <= 0) {
            showToast("Please enter total amount", "error");
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!checkIn || !checkOut) return;

        setLoading(true);
        try {
            // 1. Check availability
            const availability = await api.checkAvailability(
                property.id,
                format(checkIn, "yyyy-MM-dd"),
                format(checkOut, "yyyy-MM-dd")
            );

            if (!availability.available) {
                // If editing, exclude the current booking from availability check
                const otherBookings = availability.bookings?.filter(b => b.id !== bookingToEdit?.id) || [];
                if (otherBookings.length > 0) {
                    showToast("These dates are no longer available.", "error");
                    setLoading(false);
                    return;
                }
            }

            // 2. Prepare request
            const request: Partial<CreateBookingRequest> = {
                guestName: formData.guestName,
                guestPhone: formData.guestPhone,
                guestEmail: formData.guestEmail,
                numGuests: formData.numGuests,
                checkIn: format(checkIn, "yyyy-MM-dd"),
                checkInTime: formData.checkInTime,
                checkOut: format(checkOut, "yyyy-MM-dd"),
                checkOutTime: formData.checkOutTime,
                notes: formData.notes,
                specialRequests: formData.specialRequests,
                pricePerNight: formData.pricePerNight,
                totalAmount: formData.totalAmount,
                agentCommission: formData.agentCommission,
            };

            // Add advance payment info if present
            if (formData.advancePayment > 0) {
                request.advanceAmount = formData.advancePayment;
                request.advanceMethod = formData.paymentMethod;

                // For updates, we might want to flag this is an additional payment
                // The user explicitly requested this note format in the payload example
                if (bookingToEdit && !formData.notes) {
                    request.notes = "Additional payment logged during booking update";
                } else if (bookingToEdit && formData.notes) {
                    // Append if notes already exist? 
                    // Or just let the backend handle it? 
                    // Im going to stick to just sending the fields. The 'notes' in the user example 
                    // likely referred to the fact that they saw that string in the logPayment call 
                    // and wanted to show me 'this is the kind of data involved'.
                    // I will leave request.notes as formData.notes (user editable booking notes).
                }
            }

            if (bookingToEdit) {
                // Update mode
                await api.updateBooking(bookingToEdit.id, {
                    ...request,
                    propertyId: property.id
                } as Parameters<typeof api.updateBooking>[1]);
                showToast("Booking updated successfully!", "success");
            } else {
                // Create mode
                await api.createBooking({
                    ...request,
                    propertyId: property.id
                } as CreateBookingRequest);
                showToast("Booking created successfully!", "success");
            }

            // Successfully processed
            onSuccess();
        } catch (err: unknown) {
            const error = err as { error?: string };
            showToast(error.error || `Failed to ${bookingToEdit ? 'update' : 'create'} booking`, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!checkIn || !property) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: property.currency || "INR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#051325] text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-black">{bookingToEdit ? 'Edit Booking' : 'New Booking'}</h2>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">{property.name}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Date Display */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-white/10 rounded-xl">
                    <div>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">Check-in</p>
                        <p className="text-sm font-black">{format(checkIn, "MMM d, yyyy")}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">Check-out</p>
                        <p className="text-sm font-black">{checkOut ? format(checkOut, "MMM d, yyyy") : "Select..."}</p>
                    </div>
                </div>
                <div className="text-center mt-3">
                    <span className="text-xs font-bold text-emerald-400">{numNights} Night{numNights !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="p-6 pb-0">
                <StepIndicator currentStep={currentStep} totalSteps={3} />
            </div>

            {/* Step Content */}
            <div className="p-6">
                {/* Step 1: Guest Information */}
                {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-sm font-black text-slate-900 mb-4">Guest Information</h3>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Full Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="Enter guest name"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7A6B] transition-colors"
                                value={formData.guestName}
                                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Check-in Time</label>
                                <input
                                    type="time"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#0D7A6B] transition-colors"
                                    value={formData.checkInTime}
                                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Check-out Time</label>
                                <input
                                    type="time"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#0D7A6B] transition-colors"
                                    value={formData.checkOutTime}
                                    onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Phone *</label>
                                <div className="relative flex">
                                    <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3 py-3 text-sm font-bold text-slate-500">+91</span>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="9876543210"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-4 py-3 text-sm outline-none focus:border-[#0D7A6B] transition-colors"
                                        value={formData.guestPhone}
                                        onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Guests</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max={property.maxGuests}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#0D7A6B] transition-colors"
                                        value={formData.numGuests}
                                        onChange={(e) => setFormData({ ...formData, numGuests: parseInt(e.target.value) || 1 })}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">/ {property.maxGuests}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email (Optional)</label>
                            <input
                                type="email"
                                placeholder="guest@email.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7A6B] transition-colors"
                                value={formData.guestEmail}
                                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Pricing */}
                {currentStep === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-sm font-black text-slate-900 mb-4">Pricing Details</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Price / Night</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm font-bold outline-none focus:border-[#0D7A6B] transition-colors"
                                        value={formData.pricePerNight}
                                        onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nights</label>
                                <div className="bg-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-700">
                                    {numNights}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0D7A6B] text-white p-4 rounded-xl">
                            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-2 block">Total Amount</label>
                            <div className="relative">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-lg font-black">₹</span>
                                <input
                                    type="number"
                                    className="w-full bg-transparent pl-6 py-1 text-2xl font-black outline-none"
                                    value={formData.totalAmount}
                                    onChange={(e) => setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Advance Payment (Optional)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm font-bold outline-none focus:border-[#0D7A6B] transition-colors"
                                    value={formData.advancePayment}
                                    onChange={(e) => setFormData({ ...formData, advancePayment: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {formData.advancePayment > 0 && (
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Payment Method</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["upi", "cash", "other"].map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                            className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${formData.paymentMethod === method
                                                ? "bg-[#051325] text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-sm font-black text-slate-900 mb-4">Confirm Booking</h3>

                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Guest</span>
                                <span className="text-sm font-bold text-slate-900">{formData.guestName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Phone</span>
                                <span className="text-sm font-bold text-slate-900">{formData.guestPhone}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Guests</span>
                                <span className="text-sm font-bold text-slate-900">{formData.numGuests}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">Duration</span>
                                    <span className="text-sm font-bold text-slate-900">{numNights} Nights</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0D7A6B]/10 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#0D7A6B]">Price per night</span>
                                <span className="text-sm font-bold text-[#0D7A6B]">{formatCurrency(formData.pricePerNight)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#0D7A6B]">Total Amount</span>
                                <span className="text-lg font-black text-[#0D7A6B]">{formatCurrency(formData.totalAmount)}</span>
                            </div>
                            {formData.advancePayment > 0 && (
                                <>
                                    <div className="border-t border-[#0D7A6B]/20 pt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-[#0D7A6B]">Advance ({formData.paymentMethod.toUpperCase()})</span>
                                            <span className="text-sm font-bold text-[#0D7A6B]">{formatCurrency(formData.advancePayment)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-amber-600">Balance Due</span>
                                        <span className="text-sm font-bold text-amber-600">{formatCurrency(formData.totalAmount - formData.advancePayment)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Special Requests (Optional)</label>
                            <textarea
                                placeholder="Meal preferences, pickup info, etc."
                                rows={2}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-[#0D7A6B] transition-colors"
                                value={formData.specialRequests}
                                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="p-6 pt-0 space-y-3">
                {currentStep < 3 ? (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={currentStep === 1 ? onCancel : prevStep}
                            className="py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            {currentStep === 1 ? 'Cancel' : 'Back'}
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={!checkOut}
                            className="py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#0D7A6B] hover:bg-[#0a6358] transition-colors disabled:opacity-50"
                        >
                            Next Step
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest text-white bg-[#0D7A6B] hover:bg-[#0a6358] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {bookingToEdit ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    {bookingToEdit ? 'Update Booking' : 'Confirm Booking'}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                        <button
                            onClick={prevStep}
                            disabled={loading}
                            className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Back to Pricing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
