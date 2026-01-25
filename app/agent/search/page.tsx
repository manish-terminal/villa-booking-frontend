"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { api } from "@/app/lib/api";
import { Property } from "@/app/types/property";
import { useToast } from "@/app/components/Toast";
import Button from "@/app/components/Button";
import { Calendar, Search, MapPin, Users, BedDouble, Bath, ArrowRight, Loader2 } from "lucide-react";

export default function AgentSearch() {
    const router = useRouter();
    const { showToast } = useToast();

    // Default dates: Tomorrow and Day after
    const defaultCheckIn = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const defaultCheckOut = format(addDays(new Date(), 2), 'yyyy-MM-dd');

    const [checkIn, setCheckIn] = useState(defaultCheckIn);
    const [checkOut, setCheckOut] = useState(defaultCheckOut);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!checkIn || !checkOut) {
            showToast("Please select valid dates", "error");
            return;
        }

        setLoading(true);
        setHasSearched(true);
        try {
            const response = await api.findAvailableProperties(checkIn, checkOut);
            setProperties(response.properties || []);
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch available properties", "error");
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = (propertyId: string) => {
        // Navigate to bookings page with params to auto-open booking flow
        const params = new URLSearchParams({
            propertyId,
            checkIn,
            checkOut,
            action: "book" // Flag to trigger modal
        });
        router.push(`/agent/bookings?${params.toString()}`);
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 pt-8 space-y-8 animate-in fade-in duration-700">

            {/* Header & Search Section */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Find Availability</h1>
                    <p className="text-slate-500 font-medium">Search across all properties for your clients.</p>
                </div>

                <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-2">
                    {/* Check In */}
                    <div className="flex-1 bg-slate-50 rounded-3xl px-6 py-4 border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Calendar size={12} /> Check In
                        </label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full bg-transparent font-bold text-slate-900 outline-none"
                            min={format(new Date(), 'yyyy-MM-dd')}
                        />
                    </div>

                    {/* Check Out */}
                    <div className="flex-1 bg-slate-50 rounded-3xl px-6 py-4 border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Calendar size={12} /> Check Out
                        </label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full bg-transparent font-bold text-slate-900 outline-none"
                            min={checkIn || format(new Date(), 'yyyy-MM-dd')}
                        />
                    </div>

                    {/* Search Button */}
                    <div className="p-1">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="h-full w-full md:w-auto px-10 rounded-[1.8rem] bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                            <span className="md:hidden lg:inline">Search</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
                {hasSearched && (
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">
                        {loading ? "Searching..." : `${properties.length} Properties Found`}
                    </h3>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-100 rounded-[2.5rem]" />)}
                    </div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map(property => (
                            <div key={property.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden flex flex-col">
                                {/* Image Placeholder or Actual Image */}
                                <div className="h-48 bg-slate-200 relative overflow-hidden">
                                    {property.images && property.images.length > 0 ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <MapPin size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black text-slate-900 shadow-sm border border-white/50">
                                        {property.currency || 'INR'} {property.pricePerNight.toLocaleString()} / night
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{property.name}</h3>
                                    <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{property.description}</p>

                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6">
                                        <span className="flex items-center gap-1"><Users size={14} className="text-indigo-500" /> {property.maxGuests} Guests</span>
                                        <span className="flex items-center gap-1"><BedDouble size={14} className="text-indigo-500" /> {property.bedrooms} Beds</span>
                                        <span className="flex items-center gap-1"><Bath size={14} className="text-indigo-500" /> {property.bathrooms} Baths</span>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-50">
                                        <button
                                            onClick={() => handleBookNow(property.id)}
                                            className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 group-active:scale-95"
                                        >
                                            Book Now <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : hasSearched && !loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center">
                        <Calendar size={48} className="mb-4 text-slate-900" />
                        <p className="font-black text-slate-900 uppercase tracking-widest">No availability found</p>
                        <p className="text-sm font-medium">Try changing your dates</p>
                    </div>
                ) : (
                    !hasSearched && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                            <Search size={48} className="mb-4 text-slate-900" />
                            <p className="font-black text-slate-900 uppercase tracking-widest">Enter dates to start searching</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
