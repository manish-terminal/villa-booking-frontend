"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Users,
  BarChart3,
  Calendar,
  Shield,
  ArrowRight,
  ChevronRight,
  Smartphone,
  Globe,
  Zap,
  Star,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";

export default function TabblLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0a192f] font-[var(--font-inter)] overflow-x-hidden">
      {/* =========================================
          NAVBAR
          ========================================= */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)] py-3"
          : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-[#0a192f] rounded-xl flex items-center justify-center shadow-lg shadow-[#0a192f]/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-sm tracking-tighter">
                t.
              </span>
            </div>
            <span className="text-xl font-black tracking-tight text-[#0a192f]">
              tabbl
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-semibold text-slate-500 hover:text-[#0a192f] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-500 hover:text-[#0a192f] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#roles"
              className="text-sm font-semibold text-slate-500 hover:text-[#0a192f] transition-colors"
            >
              For You
            </a>
            <Link
              href="/login"
              className="text-sm font-bold text-[#0a192f] hover:text-[#0f766e] transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="bg-[#0a192f] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#112240] hover:shadow-lg hover:shadow-[#0a192f]/20 transition-all active:scale-95"
            >
              Get Started
            </Link>
            <a
              href="https://wa.me/918920972146?text=Hi, I'd like to book a demo of tabbl."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-bold px-6 py-2.5 rounded-full hover:bg-emerald-100 transition-all"
            >
              <MessageCircle size={16} />
              Book a Demo
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#0a192f]"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl animate-slide-up">
            <div className="p-6 space-y-4">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-600 py-2"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-600 py-2"
              >
                How It Works
              </a>
              <a
                href="#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-600 py-2"
              >
                For You
              </a>
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <Link
                  href="/login"
                  className="block text-center text-sm font-bold text-[#0a192f] py-2"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="block text-center bg-[#0a192f] text-white text-sm font-bold px-6 py-3 rounded-full"
                >
                  Get Started
                </Link>
                <a
                  href="https://wa.me/918920972146?text=Hi, I'd like to book a demo of tabbl."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-black px-6 py-3 rounded-full uppercase tracking-widest"
                >
                  <MessageCircle size={18} />
                  Book a Demo
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* =========================================
          HERO SECTION
          ========================================= */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/tabbl-hero.png"
            alt="Luxury villa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f]/95 via-[#0a192f]/75 to-[#0a192f]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">
                Villa Management Reimagined
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6">
              Your villas.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                One platform.
              </span>
              <br />
              Zero chaos.
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/60 font-medium leading-relaxed mb-10 max-w-lg">
              tabbl connects villa owners and booking agents on a single
              platform. Track bookings, payments, and performance — effortlessly.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="group bg-white text-[#0a192f] text-sm font-black px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-white/20 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest"
              >
                Start Free
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <a
                href="https://wa.me/918920972146?text=Hi, I'd like to book a demo of tabbl."
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-emerald-600 text-white text-sm font-black px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest"
              >
                Book a Demo
                <MessageCircle
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-bold text-white/70 px-8 py-4 rounded-full border border-white/15 hover:bg-white/5 hover:border-white/25 transition-all flex items-center gap-2"
              >
                See How It Works
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-14 flex items-center gap-8">
              <div>
                <p className="text-3xl font-black text-white">500+</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Villas Managed
                </p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-3xl font-black text-white">150+</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Active Agents
                </p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-3xl font-black text-white">₹8Cr+</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Revenue Tracked
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FEATURES SECTION
          ========================================= */}
      <section id="features" className="py-28 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="text-[11px] font-black text-[#0f766e] uppercase tracking-[0.3em] mb-4 block">
              Why Tabbl
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0a192f] tracking-tight mb-6">
              Everything you need.
              <br />
              Nothing you don&apos;t.
            </h2>
            <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto">
              A focused toolkit built specifically for villa booking operations —
              not a bloated hotel PMS.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Smart Calendar",
                desc: "Real-time availability with check-in/check-out overlap support. No double bookings, ever.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: BarChart3,
                title: "Revenue Analytics",
                desc: "Track collections, pending payments, ADR, and occupancy — per property or across your portfolio.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Users,
                title: "Agent Management",
                desc: "Invite agents via codes. Track their bookings, commissions, and performance transparently.",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: Shield,
                title: "Role-Based Access",
                desc: "Owners see what owners need. Agents see their own data. Admins see everything. Clean and secure.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: Smartphone,
                title: "Mobile-First PWA",
                desc: "Installs like an app on any phone. Works offline-ready and loads blazingly fast.",
                color: "bg-rose-50 text-rose-600",
              },
              {
                icon: Zap,
                title: "Instant Settlements",
                desc: "Mark payments as settled with one tap. Full transaction history and advance tracking.",
                color: "bg-teal-50 text-teal-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-[2rem] p-8 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-500"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-black text-[#0a192f] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          HOW IT WORKS
          ========================================= */}
      <section id="how-it-works" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[11px] font-black text-[#0f766e] uppercase tracking-[0.3em] mb-4 block">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0a192f] tracking-tight mb-6">
              Up and running in minutes
            </h2>
            <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto">
              No setup fees. No complex onboarding. Just sign up and go.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Add Your Properties",
                desc: "List your villas with pricing, photos, and availability rules. Takes under 5 minutes per property.",
              },
              {
                step: "02",
                title: "Invite Your Agents",
                desc: "Generate invite codes for your booking agents. They sign up, link to your properties, and start booking.",
              },
              {
                step: "03",
                title: "Track Everything",
                desc: "Monitor bookings, payments, and agent performance from your dashboard. Real-time insights, zero spreadsheets.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 rounded-3xl bg-[#0a192f] text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#0a192f]/15 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <span className="text-2xl font-black">{item.step}</span>
                </div>
                <h3 className="text-lg font-black text-[#0a192f] mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
                {i < 2 && (
                  <div className="hidden md:flex items-center justify-center mt-6">
                    <ChevronRight size={20} className="text-slate-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          ROLES SECTION
          ========================================= */}
      <section id="roles" className="py-28 bg-[#0a192f] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block">
              Built For You
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              One platform, two perspectives
            </h2>
            <p className="text-lg text-white/40 font-medium max-w-xl mx-auto">
              Whether you own properties or manage bookings — tabbl adapts to
              your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Owner Card */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] p-10 hover:bg-white/10 hover:border-white/20 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Building2 size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4">For Villa Owners</h3>
              <ul className="space-y-3 mb-8">
                {[
                  "Real-time booking calendar per property",
                  "Revenue, occupancy & ADR analytics",
                  "Agent performance tracking",
                  "One-tap payment settlements",
                  "Full transaction history",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-white/60"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star size={10} className="text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-black text-emerald-400 uppercase tracking-widest group-hover:gap-3 transition-all"
              >
                Start as Owner
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Agent Card */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] p-10 hover:bg-white/10 hover:border-white/20 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4">For Booking Agents</h3>
              <ul className="space-y-3 mb-8">
                {[
                  "Browse & book available villas instantly",
                  "Track your personal commission earnings",
                  "Manage guest information securely",
                  "Record advance payments on the go",
                  "View your booking history & performance",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-white/60"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star size={10} className="text-blue-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-black text-blue-400 uppercase tracking-widest group-hover:gap-3 transition-all"
              >
                Start as Agent
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          STATS BAR
          ========================================= */}
      <section className="py-20 bg-[#fafaf9]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "<2s", label: "Load Time" },
              { value: "Free", label: "To Start" },
              { value: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-black text-[#0a192f] mb-1">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          CTA SECTION
          ========================================= */}
      <section className="py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-[#0a192f] to-[#112240] rounded-[3rem] p-14 md:p-20 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <Globe
                size={40}
                className="text-emerald-400 mx-auto mb-8 opacity-60"
              />
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
                Ready to simplify
                <br />
                your villa business?
              </h2>
              <p className="text-lg text-white/40 font-medium mb-10 max-w-md mx-auto">
                Join hundreds of owners and agents already using tabbl to
                manage their properties smarter.
              </p>
              <Link
                href="/login"
                className="group inline-flex items-center gap-3 bg-white text-[#0a192f] text-sm font-black px-10 py-5 rounded-full hover:shadow-2xl hover:shadow-white/10 transition-all active:scale-95 uppercase tracking-widest"
              >
                Get Started — It&apos;s Free
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <div className="mt-4">
                <a
                  href="https://wa.me/918920972146?text=Hi, I'd like to book a demo of tabbl."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle size={16} />
                  Prefer a walk-through? Book a Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer className="bg-[#0a192f] text-white py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm tracking-tighter">
                    t.
                  </span>
                </div>
                <span className="text-xl font-black tracking-tight">tabbl</span>
              </div>
              <p className="text-sm text-white/30 font-medium max-w-xs">
                The smartest way to manage villa bookings, agents, and payments.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-16">
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">
                  Product
                </p>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#features"
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#how-it-works"
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#roles"
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      For You
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">
                  Account
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/login"
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      Log In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      Sign Up
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/20 font-medium">
              © {new Date().getFullYear()} tabbl. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-xs text-white/20 hover:text-white/50 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-xs text-white/20 hover:text-white/50 transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
