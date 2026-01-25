"use client";

import { useState } from "react";
import { api } from "@/app/lib/api";
import { useToast } from "@/app/components/Toast";
import { Download, Shield } from "lucide-react";

export default function AdminDashboard() {
    const { showToast } = useToast();
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const blob = await api.exportAnalytics();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `master-data-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast("Export downloaded successfully", "success");
        } catch {
            showToast("Failed to download export", "error");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-8">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-indigo-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 font-medium">Global System Export</p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {exporting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Download size={20} />
                        )}
                        Download Master Data (CSV)
                    </button>
                    <p className="text-xs text-slate-400 font-bold mt-4 uppercase tracking-widest">
                        Secure Download
                    </p>
                </div>
            </div>
        </div>
    );
}
