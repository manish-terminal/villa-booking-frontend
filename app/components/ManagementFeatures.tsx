"use client";

import React from "react";
import { Link2, Shield, Calendar, PieChart, Users, Repeat } from "lucide-react";

const features = [
    {
        title: "Instant Sync",
        description: "Real-time calendar synchronization across all major booking platforms and agent portals.",
        icon: Repeat,
        color: "bg-blue-500",
    },
    {
        title: "Secure Payments",
        description: "Automated escrow systems ensuring secure transactions and timely commission payouts.",
        icon: Shield,
        color: "bg-green-500",
    },
    {
        title: "Revenue Tracking",
        description: "Detailed analytics on property performance, occupancy rates, and seasonal trends.",
        icon: PieChart,
        color: "bg-purple-500",
    },
    {
        title: "Agent Network",
        description: "Access a global network of verified luxury travel agents to fill your calendar.",
        icon: Users,
        color: "bg-orange-500",
    },
    {
        title: "Smart Booking",
        description: "Advanced booking engine with dynamic pricing and inventory management.",
        icon: Calendar,
        color: "bg-red-500",
    },
    {
        title: "CRM Integration",
        description: "Maintain guest relationships with integrated communication and preference tracking.",
        icon: Link2,
        color: "bg-indigo-500",
    },
];

export default function ManagementFeatures() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">
                        The Complete Management Stack
                    </h2>
                    <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                        Everything you need to operate a high-performance villa portfolio
                        at scale. Built by hospitality experts for professionals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-10 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:rotate-6 transition-transform`}>
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-4">{feature.title}</h3>
                            <p className="text-foreground-muted leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
