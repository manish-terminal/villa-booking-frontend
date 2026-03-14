"use client";

import React from "react";
import Link from "next/link";
import { UserCog, Wallet, CalendarRange, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function RoleSelection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">
                        Choose Your Profile
                    </h2>
                    <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                        Access specialized tools designed for your specific role in the
                        villa management ecosystem.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Owner Portal Card */}
                    <div className="group relative glass-card p-10 bg-gray-50 border-gray-100 hover:border-secondary/30 transition-all duration-500 hover:shadow-2xl">
                        <div className="flex justify-between items-start mb-10">
                            <div className="p-4 bg-primary rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <UserCog size={32} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/30">Owner Portal</span>
                        </div>

                        <h3 className="text-3xl font-bold text-primary mb-4">Villa Owners</h3>
                        <p className="text-foreground-muted mb-8 leading-relaxed">
                            Maximize your ROl with advanced analytics, guest screening, and
                            automated property maintenance scheduling.
                        </p>

                        <ul className="space-y-4 mb-10">
                            <li className="flex items-center gap-3 text-primary font-medium">
                                <BarChart3 size={18} className="text-secondary" />
                                <span>Real-time Revenue Analytics</span>
                            </li>
                            <li className="flex items-center gap-3 text-primary font-medium">
                                <ShieldCheck size={18} className="text-secondary" />
                                <span>Professional Guest Screening</span>
                            </li>
                            <li className="flex items-center gap-3 text-primary font-medium">
                                <CalendarRange size={18} className="text-secondary" />
                                <span>Multi-calendar Sync (OTA)</span>
                            </li>
                        </ul>

                        <Link
                            href="/owner/login"
                            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-hover transition-all w-full justify-center"
                        >
                            <span>Access Owner Dashboard</span>
                        </Link>
                    </div>

                    {/* Agent Portal Card */}
                    <div className="group relative glass-card p-10 bg-secondary-muted border-secondary/10 hover:border-secondary/30 transition-all duration-500 hover:shadow-2xl">
                        <div className="flex justify-between items-start mb-10">
                            <div className="p-4 bg-secondary rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Wallet size={32} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-secondary/30">Agent Portal</span>
                        </div>

                        <h3 className="text-3xl font-bold text-primary mb-4">Booking Agents</h3>
                        <p className="text-foreground-muted mb-8 leading-relaxed">
                            Streamline your booking workflow with instant availability lookups,
                            commission tracking, and white-labeled property brochures.
                        </p>

                        <ul className="space-y-4 mb-10">
                            <li className="flex items-center gap-3 text-primary font-medium">
                                <Zap size={18} className="text-secondary" />
                                <span>Instant API Availability</span>
                            </li>
                            <li className="flex items-center gap-3 text-primary font-medium">
                                <Wallet size={18} className="text-secondary" />
                                <span>Automated Commission Payouts</span>
                            </li>
                            <li className="flex items-center gap-3 text-primary font-medium">
                                <CalendarRange size={18} className="text-secondary" />
                                <span>Quick Booking Flow</span>
                            </li>
                        </ul>

                        <Link
                            href="/agent/login"
                            className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold hover:bg-secondary/90 transition-all w-full justify-center"
                        >
                            <span>Access Agent Portal</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Background decorations */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0" />
        </section>
    );
}
