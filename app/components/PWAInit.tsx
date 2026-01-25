"use client";

import { useEffect } from "react";
import PWAInstallPrompt from "./PWAInstallPrompt";

export default function PWAInit() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then((registration) => {
                        console.log("SW registered: ", registration);
                    })
                    .catch((registrationError) => {
                        console.log("SW registration failed: ", registrationError);
                    });
            });
        }
    }, []);

    return <PWAInstallPrompt />;
}
