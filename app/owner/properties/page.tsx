"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/app/lib/api";
import { Property, CreatePropertyRequest } from "@/app/types/property";
import { APIError } from "@/app/types/auth";
import { useToast } from "@/app/components/Toast";
import Button from "@/app/components/Button";

// --- Constants ---
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
  { id: "lawn", label: "Lawn", icon: "🌿" },
];

// Format currency
const formatCurrency = (value: number, currency: string = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

// --- Sub-components ---

/**
 * Property Card: Displays individual property in an enhanced card style
 */
function PropertyCard({ property, onEdit }: { property: Property; onEdit: (p: Property) => void }) {
  const handleClick = () => {
    // Navigate to bookings page with property pre-selected
    window.location.href = `/owner/bookings?propertyId=${property.id}`;
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:shadow-lg hover:border-[#0D7A6B]/20 transition-all group overflow-hidden"
    >
      {/* Header with Image and Status */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
          {property.images?.[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${property.isActive
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-500 text-white'
            }`}>
            {property.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm text-[#0D7A6B] font-black text-sm px-3 py-1.5 rounded-xl shadow-sm">
            {formatCurrency(property.pricePerNight)}<span className="text-[10px] font-medium text-slate-400 ml-1">/night</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h4 className="font-black text-slate-900 text-lg leading-snug group-hover:text-[#0D7A6B] transition-colors mb-2">
          {property.name}
        </h4>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-400 mb-4">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-medium">{property.city}, {property.state}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Beds</p>
            <p className="text-sm font-black text-slate-700">{property.bedrooms}</p>
          </div>
          <div className="text-center border-x border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Baths</p>
            <p className="text-sm font-black text-slate-700">{property.bathrooms}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Guests</p>
            <p className="text-sm font-black text-slate-700">{property.maxGuests}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(property);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={handleClick}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0D7A6B] text-white rounded-xl text-xs font-bold hover:bg-[#0a6358] transition-colors"
          >
            Bookings
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


/**
 * Property Modal: Create/Edit form handling
 */
function PropertyModal({ isOpen, onClose, property, onSave }: { isOpen: boolean; onClose: () => void; property: Property | null; onSave: () => void }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreatePropertyRequest>({
    name: "", description: "", address: "", city: "", state: "", country: "India",
    pricePerNight: 0, currency: "INR", maxGuests: 1, bedrooms: 1, bathrooms: 1,
    amenities: [], images: [],
  });

  useEffect(() => {
    if (isOpen) {
      if (property) {
        setFormData({ ...property, amenities: property.amenities || [], images: property.images || [] });
      } else {
        setFormData({ name: "", description: "", address: "", city: "", state: "", country: "India", pricePerNight: 0, currency: "INR", maxGuests: 1, bedrooms: 1, bathrooms: 1, amenities: [], images: [] });
      }
      setErrors({});
    }
  }, [property, isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Required";
    if (!formData.address.trim()) e.address = "Required";
    if (!formData.city.trim()) e.city = "Required";
    if (formData.pricePerNight <= 0) e.price = "Invalid Price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (property) {
        await api.updateProperty(property.id, formData);
      } else {
        await api.createProperty(formData);
      }
      showToast(`Property ${property ? "updated" : "created"}!`, "success");
      onSave();
      onClose();
    } catch (err) {
      showToast((err as APIError).error || "Error saving property", "error");
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900">{property ? "Edit Property" : "New Listing"}</h2>
            <p className="text-slate-400 text-xs font-medium mt-1">Fill in the property details</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-grow overflow-y-auto px-8 py-6 space-y-6">
          {/* Section: Identity */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Property Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="The Sunset Penthouse"
                className={`w-full bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7A6B] transition-colors`}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe your property..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-[#0D7A6B] transition-colors"
              />
            </div>
          </div>

          {/* Section: Location */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Location</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full Address"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7A6B] transition-colors"
            />
            <div className="grid grid-cols-3 gap-3">
              <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="City" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7A6B] transition-colors" />
              <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="State" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7A6B] transition-colors" />
              <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="Country" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7A6B] transition-colors" />
            </div>
          </div>

          {/* Section: Amenities */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    amenities: prev.amenities.includes(a.id) ? prev.amenities.filter(i => i !== a.id) : [...prev.amenities, a.id]
                  }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${formData.amenities.includes(a.id)
                    ? "bg-[#0D7A6B] text-white border-[#0D7A6B]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#0D7A6B]"
                    }`}
                >
                  <span>{a.icon}</span> {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Price/Night", key: "pricePerNight", prefix: "₹" },
              { label: "Max Guests", key: "maxGuests" },
              { label: "Bedrooms", key: "bedrooms" },
              { label: "Bathrooms", key: "bathrooms" }
            ].map(field => (
              <div key={field.key}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">{field.label}</label>
                <input
                  type="number"
                  value={(formData as unknown as Record<string, number>)[field.key]}
                  onChange={e => setFormData({ ...formData, [field.key]: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#0D7A6B] transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Image URL */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Cover Image URL</label>
            <input
              type="url"
              value={formData.images?.[0] || ""}
              onChange={e => setFormData({ ...formData, images: e.target.value ? [e.target.value] : [] })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D7A6B] transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
            Cancel
          </button>
          <div className="flex-[2]">
            <Button onClick={handleSubmit} loading={loading} fullWidth className="rounded-xl">
              {property ? "Save Changes" : "Create Property"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Status Components ---

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 animate-pulse">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-slate-100 rounded-[1.5rem] mr-4"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
              <div className="h-3 w-1/3 bg-slate-100 rounded"></div>
              <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 bg-[#0D7A6B]/10 text-[#0D7A6B] rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-2">No Properties Yet</h3>
      <p className="text-slate-400 text-sm max-w-sm mb-6">Start by adding your first property listing to your portfolio.</p>
      <button
        onClick={onAdd}
        className="px-6 py-3 bg-[#0D7A6B] text-white font-bold text-sm rounded-xl hover:bg-[#0a6358] transition-colors"
      >
        Add Your First Property
      </button>
    </div>
  );
}

// --- Main Component ---

export default function PropertiesPage() {
  const { showToast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getProperties();
      setProperties(response.properties || []);
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.error || "Failed to load properties");
      showToast(apiError.error || "Network error", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleAddNew = () => { setEditingProperty(null); setModalOpen(true); };
  const handleEdit = (p: Property) => { setEditingProperty(p); setModalOpen(true); };

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="p-6 pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Your Estates</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Property Management</p>
        </div>
        <button
          onClick={handleAddNew}
          className="w-12 h-12 bg-[#051325] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 hover:bg-[#0D7A6B] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
            <p className="text-red-600 text-sm font-medium mb-2">{error}</p>
            <button onClick={fetchProperties} className="text-red-600 text-xs font-bold underline">
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Empty State */}
        {!loading && properties.length === 0 && !error && (
          <EmptyState onAdd={handleAddNew} />
        )}

        {/* Properties Grid */}
        {!loading && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      {/* Add New Button */}
      {!loading && properties.length > 0 && (
        <div className="px-6">
          <button
            onClick={handleAddNew}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-[#0D7A6B] hover:text-[#0D7A6B] transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Register New Property
            </span>
          </button>
        </div>
      )}

      {/* Modal */}
      <PropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        property={editingProperty}
        onSave={fetchProperties}
      />
    </div>
  );
}