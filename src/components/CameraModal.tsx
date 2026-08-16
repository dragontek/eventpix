"use client";

import { useEffect, useRef, useState } from 'react';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => Promise<void>;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [capturing, setCapturing] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            stopStream();
            return;
        }

        startCamera(facingMode);

        // Check if multiple camera devices exist
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                const videoDevices = devices.filter((d) => d.kind === 'videoinput');
                setHasMultipleCameras(videoDevices.length > 1);
            }).catch(() => {});
        }

        return () => {
            stopStream();
        };
    }, [isOpen, facingMode]);

    const startCamera = async (mode: 'user' | 'environment') => {
        setError(null);
        stopStream();

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API is not supported on this browser.");
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err: any) {
            console.error("Camera access error:", err);
            setError(err.message || "Could not access camera. Please check browser permissions.");
        }
    };

    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const toggleCamera = () => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    };

    const handleSnap = async () => {
        if (!videoRef.current || capturing) return;
        setCapturing(true);

        try {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not create canvas context");

            // Flip horizontally if front-facing camera for natural mirror effect
            if (facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/jpeg', 0.92)
            );

            if (!blob) throw new Error("Failed to generate photo file");

            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
            await onCapture(file);
            stopStream();
            onClose();
        } catch (err: any) {
            console.error("Capture error:", err);
            setError(err.message || "Failed to capture photo.");
        } finally {
            setCapturing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Camera Preview</h3>
                    </div>

                    <button
                        onClick={() => {
                            stopStream();
                            onClose();
                        }}
                        className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Video Container */}
                <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] overflow-hidden">
                    {error ? (
                        <div className="p-6 text-center text-red-400 space-y-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm font-medium">{error}</p>
                            <button
                                onClick={() => startCamera(facingMode)}
                                className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition border border-gray-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                        />
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
                    <div>
                        {hasMultipleCameras && !error && (
                            <button
                                onClick={toggleCamera}
                                className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition border border-gray-700 active:scale-95"
                                title="Flip Camera"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Snap Shutter Button */}
                    {!error && (
                        <button
                            onClick={handleSnap}
                            disabled={capturing || !stream}
                            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl transition-all transform active:scale-90 disabled:opacity-50 border-4 border-white/20"
                            title="Snap Photo"
                        >
                            {capturing ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-white" />
                            )}
                        </button>
                    )}

                    <div>
                        <button
                            onClick={() => {
                                stopStream();
                                onClose();
                            }}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 hover:text-white rounded-lg transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
