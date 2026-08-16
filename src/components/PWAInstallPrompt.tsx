'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'eventpix_pwa_install_dismissed';

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || (navigator as any).standalone === true;
        if (standalone) {
            setIsInstalled(true);
            return;
        }

        if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
            setIsIos(true);
        }

        if (localStorage.getItem(DISMISS_KEY)) {
            setDismissed(true);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(DISMISS_KEY, '1');
    };

    const showAndroid = !isInstalled && !dismissed && !!deferredPrompt;
    const showIos = !isInstalled && !dismissed && isIos && !deferredPrompt;

    if (!showAndroid && !showIos) return null;

    return (
        <div className="fixed bottom-4 inset-x-0 z-30 px-4 pointer-events-none">
            <div className="mx-auto max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl flex items-center gap-3 pointer-events-auto">
                <img
                    src="/icons/icon-maskable-192.png"
                    alt=""
                    className="h-12 w-12 rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">Install EventPix</p>
                    <p className="text-xs text-gray-400">
                        {showIos
                            ? 'Tap the Share button, then "Add to Home Screen".'
                            : 'Get one-tap access to your event photos.'}
                    </p>
                </div>
                {showAndroid ? (
                    <button
                        onClick={handleInstall}
                        className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition active:scale-95"
                    >
                        Install
                    </button>
                ) : (
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-gray-400 hover:text-white text-sm font-bold px-2 py-2 rounded-lg transition"
                        title="Dismiss"
                    >
                        OK
                    </button>
                )}
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 text-gray-500 hover:text-gray-300 p-1 rounded-full"
                    title="Dismiss"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
