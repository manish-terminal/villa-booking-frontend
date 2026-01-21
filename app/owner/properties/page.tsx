"use client";

import { useState, useEffect } from "react";
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
];

// --- Sub-components ---

/**
 * Property Card: Displays individual property summary
 */
function PropertyCard({ property, onEdit }: { property: Property; onEdit: (p: Property) => void }) {
  return (
    <div className="group relative flex flex-col bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-in fade-in zoom-in duration-300">
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--input-bg)] text-[var(--foreground-muted)]">
            <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
            property.isActive ? "bg-emerald-500/90 text-white" : "bg-gray-500/90 text-white"
          }`}>
            {property.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-white/20">
          <p className="text-sm font-bold text-[var(--primary)]">
            ₹{property.pricePerNight.toLocaleString()}
            <span className="text-[10px] font-medium opacity-60 ml-1">/ night</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[var(--foreground)] leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-1">
            {property.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-[var(--foreground-muted)]">
            <svg className="w-3.5 h-3.5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">{property.city}, {property.state}</span>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-1 p-3 rounded-2xl bg-[var(--input-bg)]/50 border border-[var(--glass-border)] mb-6">
          <div className="text-center">
            <p className="text-[9px] font-bold text-[var(--foreground-muted)] uppercase tracking-tighter">Guests</p>
            <p className="text-sm font-bold">{property.maxGuests}</p>
          </div>
          <div className="text-center border-x border-[var(--glass-border)]">
            <p className="text-[9px] font-bold text-[var(--foreground-muted)] uppercase tracking-tighter">Beds</p>
            <p className="text-sm font-bold">{property.bedrooms}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-[var(--foreground-muted)] uppercase tracking-tighter">Baths</p>
            <p className="text-sm font-bold">{property.bathrooms}</p>
          </div>
        </div>

        <button
          onClick={() => onEdit(property)}
          className="mt-auto w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-widest bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--primary)] hover:text-white transition-all duration-300 shadow-sm"
        >
          Manage Listing
        </button>
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
      property ? await api.updateProperty(property.id, formData) : await api.createProperty(formData);
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-[var(--background)] border border-[var(--glass-border)] rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-500 flex flex-col">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{property ? "Edit Property" : "New Listing"}</h2>
      
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl bg-[var(--input-bg)] hover:rotate-90 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-grow overflow-y-auto px-8 py-4 space-y-8 custom-scrollbar">
          {/* Section: Identity */}
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="group">
                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-2 block ml-1">Title</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="The Sunset Penthouse"
                  className={`w-full bg-[var(--input-bg)] border ${errors.name ? 'border-red-500' : 'border-[var(--glass-border)]'} focus:ring-4 focus:ring-[var(--primary)]/10 rounded-2xl px-5 py-4 text-sm transition-all outline-none`}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-2 block ml-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl px-5 py-4 text-sm outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest block ml-1">Location Details</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address"
              className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl px-5 py-4 text-sm outline-none mb-3"
            />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="City" className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm outline-none" />
              <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="State" className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm outline-none" />
              <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="India" className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm outline-none col-span-2 lg:col-span-1" />
            </div>
          </div>

          {/* Section: Amenities */}
          <div>
            <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-4 block ml-1">Included Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    amenities: prev.amenities.includes(a.id) ? prev.amenities.filter(i => i !== a.id) : [...prev.amenities, a.id]
                  }))}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    formData.amenities.includes(a.id) 
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md" 
                    : "bg-[var(--input-bg)] text-[var(--foreground-muted)] border-transparent hover:border-[var(--glass-border)]"
                  }`}
                >
                  <span className="text-base">{a.icon}</span> {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Metadata (Numbers) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
            {[
              { label: "Price", key: "pricePerNight", icon: "₹" },
              { label: "Guests", key: "maxGuests", icon: "👥" },
              { label: "Beds", key: "bedrooms", icon: "🛏️" },
              { label: "Baths", key: "bathrooms", icon: "🚿" }
            ].map(field => (
              <div key={field.key}>
                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-tighter mb-2 block">{field.label}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={(formData as any)[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl px-4 py-3 text-sm font-bold outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
             <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-2 block ml-1">Cover Image URL</label>
             <input
                type="url"
                value={formData.images?.[0] || ""}
                onChange={e => setFormData({ ...formData, images: e.target.value ? [e.target.value] : [] })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl px-5 py-4 text-sm outline-none"
              />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-[var(--input-bg)]/30 backdrop-blur-xl border-t border-[var(--glass-border)] flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest hover:text-[var(--foreground)] text-[var(--foreground-muted)] transition-colors">
            Cancel
          </button>
          <div className="flex-[2]">
            <Button onClick={handleSubmit} loading={loading} fullWidth className="rounded-2xl shadow-xl shadow-[var(--primary)]/20">
              {property ? "Save Changes" : "Post Property"}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-[var(--input-bg)]/50 rounded-[2rem] aspect-[4/5] animate-pulse overflow-hidden border border-[var(--glass-border)]">
          <div className="h-1/2 bg-[var(--input-bg)]" />
          <div className="p-6 space-y-4">
            <div className="h-6 w-2/3 bg-[var(--input-bg)] rounded-lg" />
            <div className="h-4 w-1/2 bg-[var(--input-bg)] rounded-lg" />
            <div className="h-16 bg-[var(--input-bg)] rounded-2xl mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-[var(--glass-bg)] border-2 border-dashed border-[var(--glass-border)] rounded-[3rem] animate-in fade-in zoom-in duration-700">
      <div className="w-24 h-24 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      </div>
      <h3 className="text-2xl font-bold mb-2">No Properties Found</h3>
      <p className="text-[var(--foreground-muted)] max-w-sm mb-8">You haven't added any listings to your portfolio yet. Let's get started with your first luxury villa.</p>
      <Button onClick={onAdd} className="px-10">Add Your First Listing</Button>
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

  const fetchProperties = async () => {
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
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleAddNew = () => { setEditingProperty(null); setModalOpen(true); };
  const handleEdit = (p: Property) => { setEditingProperty(p); setModalOpen(true); };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)]">My Properties</h1>
          <p className="text-[var(--foreground-muted)] font-medium uppercase text-xs tracking-[0.2em] opacity-80">Portfolio Management Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchProperties} 
            className="p-3 rounded-2xl bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-all active:scale-95"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <Button onClick={handleAddNew} className="px-6 py-4 rounded-2xl shadow-lg shadow-[var(--primary)]/10">
         
            Add Listing
          </Button>
        </div>
      </header>

      {/* Main Grid Logic */}
      <section className="min-h-[400px]">
        {error && !loading && (
          <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/20 text-center animate-in fade-in duration-500">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <Button onClick={fetchProperties} variant="secondary">Try Reconnecting</Button>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : properties.length === 0 && !error ? (
          <EmptyState onAdd={handleAddNew} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </section>

      {/* Modal Integration */}
      <PropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        property={editingProperty}
        onSave={fetchProperties}
      />
    </main>
  );
}