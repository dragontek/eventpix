"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess?: (code: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerId = 'qr-reader-container';

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        setError(null);

        const startScanner = async () => {
            try {
                // Ensure container exists in DOM before starting
                await new Promise((resolve) => setTimeout(resolve, 100));

                const html5Qrcode = new Html5Qrcode(containerId);
                scannerRef.current = html5Qrcode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                };

                await html5Qrcode.start(
                    { facingMode: 'environment' },
                    config,
                    (decodedText) => {
                        if (!isMounted) return;
                        console.log("QR Code Scanned:", decodedText);

                        // Stop scanner and close modal
                        html5Qrcode.stop().catch(console.error);

                        // Extract event code from URL or raw text
                        let code = decodedText.trim();
                        if (code.includes('/join/')) {
                            const parts = code.split('/join/');
                            code = parts[parts.length - 1].split('?')[0].split('#')[0];
                        } else if (code.includes('/event/')) {
                            const parts = code.split('/event/');
                            code = parts[parts.length - 1].split('?')[0].split('#')[0];
                        }

                        if (onScanSuccess) {
                            onScanSuccess(code);
                        } else {
                            router.push(`/join/${code.toUpperCase()}`);
                        }
                        onClose();
                    },
                    () => {
                        // QR Code search in frame (silent ignore per frame)
                    }
                );
            } catch (err: any) {
                if (!isMounted) return;
                console.error("QR Scanner error:", err);
                let msg = err.message || "Failed to access camera for QR scanning.";
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    msg = "Camera access was denied. Please grant camera permissions in your site settings.";
                }
                setError(msg);
            }
        };

        startScanner();

        return () => {
            isMounted = false;
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [isOpen, router, onClose, onScanSuccess]);

    const handleClose = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (e) {
                console.error("Error stopping scanner:", e);
            }
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Scan Event QR Code
                        </h3>
                    </div>

                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scanner Container */}
                <div className="relative p-4 bg-black flex flex-col items-center justify-center min-h-[300px]">
                    {error ? (
                        <div className="p-6 text-center text-red-400 space-y-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    ) : (
                        <div className="w-full relative overflow-hidden rounded-xl">
                            <div id={containerId} className="w-full bg-gray-950" />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 text-center">
                    <p className="text-xs text-gray-400">
                        Point your camera at an EventPix QR Code to join instantly
                    </p>
                </div>
            </div>
        </div>
    );
}
