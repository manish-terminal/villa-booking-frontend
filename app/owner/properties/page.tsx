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
        <div className="glass-card p-5 hover:shadow-xl transition-shadow animate-fade-in">
            {/* Image Placeholder */}
            <div className="relative h-40 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4 overflow-hidden">
                {property.images && property.images.length > 0 ? (
                    <img
                        src={property.images[0]}
                        alt={property.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <svg className="w-12 h-12 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                )}
                {/* Status Badge */}
                <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${property.isActive
                        ? "bg-green-500/90 text-white"
                        : "bg-gray-500/90 text-white"
                    }`}>
                    {property.isActive ? "Active" : "Inactive"}
                </span>
            </div>

            {/* Content */}
            <h3 className="font-semibold text-lg text-[var(--foreground)] mb-1 truncate">
                {property.name}
            </h3>
            <p className="text-sm text-[var(--foreground-muted)] mb-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.city}, {property.state}
            </p>

            {/* Price */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-[var(--foreground)]">
                    ₹{property.pricePerNight.toLocaleString()}
                    <span className="text-sm font-normal text-[var(--foreground-muted)]">/night</span>
                </span>
            </div>

            {/* Details */}
            <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)] mb-4">
                <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.maxGuests} guests
                </span>
                <span className="flex items-center gap-1">
                    🛏️ {property.bedrooms} beds
                </span>
                <span className="flex items-center gap-1">
                    🚿 {property.bathrooms} baths
                </span>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {property.amenities.slice(0, 4).map((amenity) => (
                    <span
                        key={amenity}
                        className="px-2 py-1 bg-[var(--input-bg)] rounded-md text-xs text-[var(--foreground-muted)]"
                    >
                        {amenity}
                    </span>
                ))}
                {property.amenities.length > 4 && (
                    <span className="px-2 py-1 bg-[var(--input-bg)] rounded-md text-xs text-[var(--foreground-muted)]">
                        +{property.amenities.length - 4} more
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(property)}
                    className="flex-1 btn-secondary text-sm py-2"
                >
                    Edit
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
                amenities: property.amenities,
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
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[var(--foreground)]">
                        {property ? "Edit Property" : "Add New Property"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="form-label">Property Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Sunset Beach Villa"
                            className={`w-full glass-input px-4 py-3 text-[var(--foreground)] ${errors.name ? "error" : ""}`}
                        />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="form-label">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                            placeholder="Describe your property..."
                            rows={3}
                            className="w-full glass-input px-4 py-3 text-[var(--foreground)] resize-none"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="form-label">Address *</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                            placeholder="Street address"
                            className={`w-full glass-input px-4 py-3 text-[var(--foreground)] ${errors.address ? "error" : ""}`}
                        />
                        {errors.address && <p className="form-error">{errors.address}</p>}
                    </div>

                    {/* City, State, Country */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="form-label">City *</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                                placeholder="City"
                                className={`w-full glass-input px-4 py-3 text-[var(--foreground)] ${errors.city ? "error" : ""}`}
                            />
                            {errors.city && <p className="form-error">{errors.city}</p>}
                        </div>
                        <div>
                            <label className="form-label">State *</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                                placeholder="State"
                                className={`w-full glass-input px-4 py-3 text-[var(--foreground)] ${errors.state ? "error" : ""}`}
                            />
                            {errors.state && <p className="form-error">{errors.state}</p>}
                        </div>
                        <div>
                            <label className="form-label">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                                placeholder="Country"
                                className="w-full glass-input px-4 py-3 text-[var(--foreground)]"
                            />
                        </div>
                    </div>

                    {/* Price and Capacity */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="form-label">Price/Night *</label>
                            <input
                                type="number"
                                value={formData.pricePerNight || ""}
                                onChange={(e) => setFormData((p) => ({ ...p, pricePerNight: parseInt(e.target.value) || 0 }))}
                                placeholder="₹0"
                                className={`w-full glass-input px-4 py-3 text-[var(--foreground)] ${errors.pricePerNight ? "error" : ""}`}
                            />
                            {errors.pricePerNight && <p className="form-error">{errors.pricePerNight}</p>}
                        </div>
                        <div>
                            <label className="form-label">Max Guests *</label>
                            <input
                                type="number"
                                min={1}
                                value={formData.maxGuests}
                                onChange={(e) => setFormData((p) => ({ ...p, maxGuests: parseInt(e.target.value) || 1 }))}
                                className={`w-full glass-input px-4 py-3 text-[var(--foreground)] ${errors.maxGuests ? "error" : ""}`}
                            />
                        </div>
                        <div>
                            <label className="form-label">Bedrooms</label>
                            <input
                                type="number"
                                min={0}
                                value={formData.bedrooms}
                                onChange={(e) => setFormData((p) => ({ ...p, bedrooms: parseInt(e.target.value) || 0 }))}
                                className="w-full glass-input px-4 py-3 text-[var(--foreground)]"
                            />
                        </div>
                        <div>
                            <label className="form-label">Bathrooms</label>
                            <input
                                type="number"
                                min={0}
                                value={formData.bathrooms}
                                onChange={(e) => setFormData((p) => ({ ...p, bathrooms: parseInt(e.target.value) || 0 }))}
                                className="w-full glass-input px-4 py-3 text-[var(--foreground)]"
                            />
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="form-label">Amenities</label>
                        <div className="flex flex-wrap gap-2">
                            {AMENITY_OPTIONS.map((amenity) => (
                                <button
                                    key={amenity.id}
                                    type="button"
                                    onClick={() => toggleAmenity(amenity.id)}
                                    className={`px-3 py-2 rounded-lg text-sm transition-all ${formData.amenities.includes(amenity.id)
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                                            : "bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                        }`}
                                >
                                    {amenity.icon} {amenity.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="form-label">Image URL (optional)</label>
                        <input
                            type="url"
                            value={formData.images?.[0] || ""}
                            onChange={(e) => setFormData((p) => ({ ...p, images: e.target.value ? [e.target.value] : [] }))}
                            placeholder="https://example.com/image.jpg"
                            className="w-full glass-input px-4 py-3 text-[var(--foreground)]"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-[var(--glass-border)]">
                    <button onClick={onClose} className="flex-1 btn-secondary">
                        Cancel
                    </button>
                    <Button onClick={handleSubmit} loading={loading} fullWidth>
                        {property ? "Save Changes" : "Create Property"}
                    </Button>
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
                <div key={i} className="glass-card p-5 animate-pulse">
                    <div className="h-40 bg-[var(--input-bg)] rounded-xl mb-4"></div>
                    <div className="h-6 bg-[var(--input-bg)] rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-[var(--input-bg)] rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-[var(--input-bg)] rounded w-1/3"></div>
                </div>
            ))}
        </div>
    );
}

// Empty State
function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No properties yet</h3>
            <p className="text-[var(--foreground-muted)] mb-6">Add your first property to start accepting bookings</p>
            <Button onClick={onAdd} fullWidth={false}>
                Add Your First Property
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">My Properties</h1>
                    <p className="text-[var(--foreground-muted)]">
                        Manage your listed properties
                    </p>
                </div>

                <Button onClick={handleAddNew} fullWidth={false}>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Property
                </Button>
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
