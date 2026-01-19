"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import { Property, CreatePropertyRequest } from "@/app/types/property";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import Button from "@/app/components/Button";

// Amenity options
const AMENITY_OPTIONS = [
    { id: "wifi", label: "WiFi", icon: "📶" },
    { id: "pool", label: "Pool", icon: "🏊" },
    { id: "ac", label: "Air Conditioning", icon: "❄️" },
    { id: "parking", label: "Parking", icon: "🅿️" },
    { id: "kitchen", label: "Kitchen", icon: "🍳" },
    { id: "tv", label: "TV", icon: "📺" },
    { id: "washer", label: "Washer", icon: "🧺" },
    { id: "gym", label: "Gym", icon: "💪" },
    { id: "pet_friendly", label: "Pet Friendly", icon: "🐕" },
    { id: "beach_access", label: "Beach Access", icon: "🏖️" },
];

// Property Card Component
function PropertyCard({
    property,
    onEdit,
}: {
    property: Property;
    onEdit: (property: Property) => void;
}) {
    return (
        <div className="glass-card overflow-hidden group hover:shadow-2xl transition-all duration-300">
            {/* Image Section */}
            <div className="relative h-48 sm:h-56 bg-[var(--input-bg)] overflow-hidden">
                {property.images && property.images.length > 0 ? (
                    <img
                        src={property.images[0]}
                        alt={property.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--foreground-muted)] opacity-50">
                        <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                    </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${property.isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-500/80 text-white"
                        }`}>
                        {property.isActive ? "Active" : "Inactive"}
                    </span>
                </div>
                {/* Price Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg">
                    <p className="text-sm font-black text-[var(--primary)]">
                        ₹{property.pricePerNight.toLocaleString()}
                        <span className="text-[10px] font-normal text-[var(--foreground-muted)] ml-0.5">/night</span>
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                <div>
                    <h3 className="font-bold text-lg text-[var(--foreground)] leading-tight truncate">
                        {property.name}
                    </h3>
                    <p className="text-xs font-medium text-[var(--foreground-muted)] flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {property.city}, {property.state}
                    </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--glass-border)]">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase mb-0.5">Guests</p>
                        <p className="text-sm font-black text-[var(--foreground)]">{property.maxGuests}</p>
                    </div>
                    <div className="text-center border-x border-[var(--glass-border)]">
                        <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase mb-0.5">Beds</p>
                        <p className="text-sm font-black text-[var(--foreground)]">{property.bedrooms}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase mb-0.5">Baths</p>
                        <p className="text-sm font-black text-[var(--foreground)]">{property.bathrooms}</p>
                    </div>
                </div>

                {/* Actions */}
                <button
                    onClick={() => onEdit(property)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-[var(--input-bg)] text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-white transition-all duration-300"
                >
                    Management Details
                </button>
            </div>
        </div>
    );
}

// Create/Edit Modal Component
function PropertyModal({
    isOpen,
    onClose,
    property,
    onSave,
}: {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
    onSave: () => void;
}) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreatePropertyRequest>({
        name: "",
        description: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        pricePerNight: 0,
        currency: "INR",
        maxGuests: 1,
        bedrooms: 1,
        bathrooms: 1,
        amenities: [],
        images: [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Populate form when editing
    useEffect(() => {
        if (property) {
            setFormData({
                name: property.name,
                description: property.description,
                address: property.address,
                city: property.city,
                state: property.state,
                country: property.country,
                pricePerNight: property.pricePerNight,
                currency: property.currency,
                maxGuests: property.maxGuests,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                amenities: property.amenities || [],
                images: property.images || [],
            });
        } else {
            // Reset form for new property
            setFormData({
                name: "",
                description: "",
                address: "",
                city: "",
                state: "",
                country: "India",
                pricePerNight: 0,
                currency: "INR",
                maxGuests: 1,
                bedrooms: 1,
                bathrooms: 1,
                amenities: [],
                images: [],
            });
        }
        setErrors({});
    }, [property, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Property name is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.state.trim()) newErrors.state = "State is required";
        if (formData.pricePerNight <= 0) newErrors.pricePerNight = "Price must be greater than 0";
        if (formData.maxGuests < 1) newErrors.maxGuests = "At least 1 guest is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (property) {
                await api.updateProperty(property.id, formData);
                showToast("Property updated successfully!", "success");
            } else {
                await api.createProperty(formData);
                showToast("Property created successfully!", "success");
            }
            onSave();
            onClose();
        } catch (err) {
            const apiError = err as APIError;
            showToast(apiError.error || "Failed to save property", "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (amenityId: string) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenityId)
                ? prev.amenities.filter((a) => a !== amenityId)
                : [...prev.amenities, amenityId],
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[var(--primary)]/20 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-slide-up shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)]">
                            {property ? "Property Settings" : "New Property"}
                        </h2>
                        <p className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest mt-1">Configure your listing details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-2 block">Display Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Ocean Blue Villa"
                                className={`w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm text-[var(--foreground)] transition-all outline-none ${errors.name ? "border-rose-500" : ""}`}
                            />
                            {errors.name && <p className="text-[10px] text-rose-500 font-bold uppercase mt-1.5 ml-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-2 block">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Highlight the best features of your property..."
                                rows={3}
                                className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm text-[var(--foreground)] transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] block">Location Details *</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                            placeholder="Full street address"
                            className={`w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm text-[var(--foreground)] transition-all outline-none ${errors.address ? "border-rose-500" : ""}`}
                        />
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                                placeholder="City"
                                className={`bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm text-[var(--foreground)] transition-all outline-none ${errors.city ? "border-rose-500" : ""}`}
                            />
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                                placeholder="State"
                                className={`bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm text-[var(--foreground)] transition-all outline-none ${errors.state ? "border-rose-500" : ""}`}
                            />
                            <div className="col-span-2 lg:col-span-1">
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                                    placeholder="Country"
                                    className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm text-[var(--foreground)] transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Numbers */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-[var(--glass-border)]">
                        <div>
                            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-2 block">Price/Night</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--foreground-muted)]">₹</span>
                                <input
                                    type="number"
                                    value={formData.pricePerNight || ""}
                                    onChange={(e) => setFormData((p) => ({ ...p, pricePerNight: parseInt(e.target.value) || 0 }))}
                                    className={`w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl pl-8 pr-4 py-3.5 text-sm font-black text-[var(--foreground)] outline-none ${errors.pricePerNight ? "border-rose-500" : ""}`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-2 block">Max Guests</label>
                            <input
                                type="number"
                                min={1}
                                value={formData.maxGuests}
                                onChange={(e) => setFormData((p) => ({ ...p, maxGuests: parseInt(e.target.value) || 1 }))}
                                className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm font-black text-[var(--foreground)] outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-2 block">Bedrooms</label>
                            <input
                                type="number"
                                min={0}
                                value={formData.bedrooms}
                                onChange={(e) => setFormData((p) => ({ ...p, bedrooms: parseInt(e.target.value) || 0 }))}
                                className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm font-black text-[var(--foreground)] outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-2 block">Bathrooms</label>
                            <input
                                type="number"
                                min={0}
                                value={formData.bathrooms}
                                onChange={(e) => setFormData((p) => ({ ...p, bathrooms: parseInt(e.target.value) || 0 }))}
                                className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm font-black text-[var(--foreground)] outline-none"
                            />
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-3 block">Amenities & Features</label>
                        <div className="flex flex-wrap gap-2">
                            {AMENITY_OPTIONS.map((amenity) => (
                                <button
                                    key={amenity.id}
                                    type="button"
                                    onClick={() => toggleAmenity(amenity.id)}
                                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${formData.amenities.includes(amenity.id)
                                        ? "bg-[var(--secondary)] text-white shadow-lg shadow-[var(--secondary)]/20"
                                        : "bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:bg-[var(--foreground)]/10"
                                        }`}
                                >
                                    <span className="mr-2 text-sm">{amenity.icon}</span>
                                    {amenity.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-2 block">Cover Photo URL</label>
                        <input
                            type="url"
                            value={formData.images?.[0] || ""}
                            onChange={(e) => setFormData((p) => ({ ...p, images: e.target.value ? [e.target.value] : [] }))}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-[var(--input-bg)] border-2 border-transparent focus:border-[var(--secondary)] rounded-2xl px-5 py-3.5 text-sm text-[var(--foreground)] outline-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row gap-3 mt-10">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-[var(--foreground-muted)] bg-[var(--input-bg)] hover:bg-[var(--foreground)]/10 transition-colors"
                    >
                        Discard
                    </button>
                    <div className="flex-[2]">
                        <Button onClick={handleSubmit} loading={loading} fullWidth>
                            {property ? "Update Property" : "Launch Listing"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card overflow-hidden animate-pulse">
                    <div className="h-48 sm:h-56 bg-[var(--input-bg)]"></div>
                    <div className="p-5 space-y-4">
                        <div className="space-y-2">
                            <div className="h-6 bg-[var(--input-bg)] rounded-lg w-3/4"></div>
                            <div className="h-3 bg-[var(--input-bg)] rounded-lg w-1/2"></div>
                        </div>
                        <div className="h-12 bg-[var(--input-bg)] rounded-xl"></div>
                        <div className="h-10 bg-[var(--input-bg)] rounded-xl"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Empty State
function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="glass-card p-8 sm:p-12 text-center animate-fade-in border-dashed border-2">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[var(--primary)] text-white flex items-center justify-center shadow-xl shadow-[var(--primary)]/20">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Portfolio Empty</h3>
            <p className="text-sm text-[var(--foreground-muted)] mb-8 max-w-xs mx-auto">Start by adding your first luxury property to the VillaBook catalog.</p>
            <Button onClick={onAdd}>
                Add First Property
            </Button>
        </div>
    );
}

// Main Page Component
export default function PropertiesPage() {
    const { showToast } = useToast();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    const fetchProperties = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getProperties();
            setProperties(response.properties || []);
        } catch (err) {
            const apiError = err as APIError;
            setError(apiError.error || "Failed to load properties");
            showToast(apiError.error || "Failed to load properties", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleAddNew = () => {
        setEditingProperty(null);
        setModalOpen(true);
    };

    const handleEdit = (property: Property) => {
        setEditingProperty(property);
        setModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">Properties</h1>
                    <p className="text-sm text-[var(--foreground-muted)]">
                        Manage and monitor your property portfolio
                    </p>
                </div>

                <div className="sm:shrink-0">
                    <Button onClick={handleAddNew}>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Listing
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && !loading && (
                <div className="glass-card p-4 border-[var(--error)] bg-red-500/10">
                    <p className="text-[var(--error)]">{error}</p>
                    <button onClick={fetchProperties} className="link text-sm mt-2">
                        Try again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && <LoadingSkeleton />}

            {/* Empty State */}
            {!loading && !error && properties.length === 0 && (
                <EmptyState onAdd={handleAddNew} />
            )}

            {/* Properties Grid */}
            {!loading && !error && properties.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <PropertyModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                property={editingProperty}
                onSave={fetchProperties}
            />
        </div>
    );
}
