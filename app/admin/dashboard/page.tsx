"use client";

import { useState } from "react";
import { api } from "@/app/lib/api";
import { useToast } from "@/app/components/Toast";
import { Download, Shield, FileSpreadsheet } from "lucide-react";

type ExportKey = "csv" | "bookings" | "users" | "agents";

const excelExports: { key: ExportKey; label: string; filename: string; apiFn: () => Promise<Blob> }[] = [
    {
        key: "bookings",
        label: "📥 Export Bookings",
        filename: "bookings_export",
        apiFn: () => api.exportBookings(),
    },
    {
        key: "users",
        label: "📥 Export Users",
        filename: "users_export",
        apiFn: () => api.exportUsers(),
    },
    {
        key: "agents",
        label: "📥 Export Agents",
        filename: "agents_export",
        apiFn: () => api.exportAgents(),
    },
];

export default function AdminDashboard() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState<Record<ExportKey, boolean>>({
        csv: false,
        bookings: false,
        users: false,
        agents: false,
    });

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const today = () => new Date().toISOString().split("T")[0];

    const handleCsvExport = async () => {
        setLoading((p) => ({ ...p, csv: true }));
        try {
            const blob = await api.exportAnalytics();
            downloadBlob(blob, `master-data-${today()}.csv`);
            showToast("Export downloaded successfully", "success");
        } catch {
            showToast("Failed to download export", "error");
        } finally {
            setLoading((p) => ({ ...p, csv: false }));
        }
    };

    const handleExcelExport = async (exp: (typeof excelExports)[number]) => {
        setLoading((p) => ({ ...p, [exp.key]: true }));
        try {
            const blob = await exp.apiFn();
            downloadBlob(blob, `${exp.filename}_${today()}.xlsx`);
            showToast(`${exp.label.replace("📥 ", "")} downloaded`, "success");
        } catch {
            showToast("Failed to download export", "error");
        } finally {
            setLoading((p) => ({ ...p, [exp.key]: false }));
        }
    };

    const anyLoading = Object.values(loading).some(Boolean);

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

                {/* Master CSV Export */}
                <div className="pt-4 space-y-3">
                    <button
                        onClick={handleCsvExport}
                        disabled={anyLoading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading.csv ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Download size={20} />
                        )}
                        Download Master Data (CSV)
                    </button>
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            Excel Exports
                        </span>
                    </div>
                </div>

                {/* Excel Export Buttons */}
                <div className="space-y-3">
                    {excelExports.map((exp) => (
                        <button
                            key={exp.key}
                            onClick={() => handleExcelExport(exp)}
                            disabled={anyLoading}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading[exp.key] ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <FileSpreadsheet size={20} />
                            )}
                            {exp.label}
                        </button>
                    ))}
                </div>

                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    Secure Download
                </p>
            </div>
        </div>
    );
}
