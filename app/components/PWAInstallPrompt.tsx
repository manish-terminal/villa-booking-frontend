"use client";

import { X, Share, PlusSquare, Download } from "lucide-react";
import { usePWAInstall } from "@/app/hooks/usePWAInstall";
import { useEffect, useState } from "react";

export default function PWAInstallPrompt() {
    const { showPrompt, platform, triggerInstall, handleDismiss } = usePWAInstall();
    const [isVisible, setIsVisible] = useState(false);

    // Animation delay for smoother entrance
    useEffect(() => {
        if (showPrompt) {
            const timer = setTimeout(() => setIsVisible(true), 3000); // Delay 3s after load
            return () => clearTimeout(timer);
        }
    }, [showPrompt]);

    if (!showPrompt || !isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:w-96 animate-slide-up">
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-black/5">

                {/* Header / Dismiss */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(handleDismiss, 300);
                        }}
                        className="p-1.5 rounded-full bg-slate-100/50 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-start gap-5">
                        {/* App Icon (Placeholder or Actual) */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c1425] to-[#1a2c4e] flex items-center justify-center shadow-lg text-white font-serif text-2xl flex-shrink-0">
                            V
                        </div>

                        <div className="flex-1 pt-1">
                            <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">
                                Install VillaBook
                            </h3>
                            <p className="text-sm font-medium text-slate-500 leading-snug">
                                {platform === 'ios'
                                    ? "Add to your home screen for the best experience."
                                    : "Install the app for faster bookings and offline access."}
                            </p>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="mt-6">
                        {platform === 'ios' ? (
                            <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-600">
                                        <Share size={14} />
                                    </span>
                                    <span>Tap the <span className="text-blue-600">Share</span> button</span>
                                </div>
                                <div className="w-px h-3 bg-slate-200 ml-3" />
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-200 text-slate-600">
                                        <PlusSquare size={14} />
                                    </span>
                                    <span>Select <span className="text-slate-900">Add to Home Screen</span></span>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={triggerInstall}
                                className="w-full py-3.5 bg-[#0c1425] text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-900"
                            >
                                <Download size={18} />
                                Install App
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
