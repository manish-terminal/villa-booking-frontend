"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (
        message: string,
        type?: "success" | "error" | "info",
        duration?: number
    ) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (
            message: string,
            type: "success" | "error" | "info" = "info",
            duration = 4000
        ) => {
            const id = Math.random().toString(36).slice(2);
            const toast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, toast]);

            // Auto-remove after duration
            setTimeout(() => {
                removeToast(id);
            }, duration);
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const icons = {
        success: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
    };

    return (
        <div className={`toast ${toast.type}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">{icons[toast.type]}</div>
                <p className="flex-1 text-sm font-medium">{toast.message}</p>
                <button
                    onClick={() => onRemove(toast.id)}
                    className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Dismiss"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
            <div
                className="toast-progress"
                style={{ animationDuration: `${toast.duration}ms` }}
            />
        </div>
    );
}
