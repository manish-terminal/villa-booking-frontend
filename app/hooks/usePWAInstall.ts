import { useState, useEffect } from 'react';

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type PWAInstallState = {
    isInstalled: boolean;
    canInstall: boolean;
    platform: 'ios' | 'android' | 'desktop' | 'unknown';
    showPrompt: boolean;
};

export const usePWAInstall = () => {
    const [installState, setInstallState] = useState<PWAInstallState>({
        isInstalled: false,
        canInstall: false,
        platform: 'unknown',
        showPrompt: false
    });
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        // 1. Detect Platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';

        // 2. Detect Install State (Standalone Mode)
        const nav = window.navigator as unknown as { standalone?: boolean };
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || !!nav.standalone;

        // 3. Handle dismiss cool-down
        const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
        const COOLDOWN_DAYS = 7;
        const isCoolingDown = lastDismissed &&
            (Date.now() - parseInt(lastDismissed)) < (COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

        // Initial State Update - ensure it's not synchronous to avoid React warning
        const timer = setTimeout(() => {
            setInstallState({
                isInstalled: !!isStandalone,
                canInstall: false,
                platform,
                // On iOS, we can always show instructions if not installed and not cooling down
                // On Android, we wait for the event
                showPrompt: !isStandalone && !isCoolingDown && isIOS
            });
        }, 0);

        // 4. Handle Android Event
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Update state to show prompt only if not cooling down
            if (!isStandalone && !isCoolingDown) {
                setInstallState(prev => ({ ...prev, canInstall: true, showPrompt: true }));
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Cleanup
        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    // Methods
    const triggerInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
                setInstallState(prev => ({ ...prev, showPrompt: false, isInstalled: true }));
            } else {
                console.log('User dismissed the A2HS prompt');
                handleDismiss();
            }
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setInstallState(prev => ({ ...prev, showPrompt: false }));
        localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    };

    return {
        ...installState,
        triggerInstall,
        handleDismiss
    };
};
