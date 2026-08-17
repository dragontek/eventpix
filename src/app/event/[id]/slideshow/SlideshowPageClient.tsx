"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { listApprovedPhotos, getPhotoUrl, subscribeToPhotos } from '@/lib/db';
import QRCode from 'react-qr-code';
import Image from 'next/image';


export default function SlideshowPage({ id: propId }: { id?: string }) {
    const params = useParams();
    const router = useRouter();
    const id = propId || (params.id as string);

    const [photos, setPhotos] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [prevIndex, setPrevIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadPhotos = async () => {
            try {
                const records = await listApprovedPhotos(id);
                setPhotos(records);
            } catch (err) {
                console.error("Error loading photos", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadPhotos();

            // Realtime
            const unsubscribe = subscribeToPhotos((e) => {
                if (e.record.event === id && e.record.status === 'approved') {
                    if (e.action === 'create') {
                        setPhotos(prev => [e.record, ...prev]);
                    } else if (e.action === 'delete') {
                        setPhotos(prev => prev.filter(p => p.id !== e.record.id));
                    }
                }
            });
            
            return () => unsubscribe();
        }
    }, [id]);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && photos.length > 0) {
            interval = setInterval(() => {
                setPrevIndex(currentIndex);
                setCurrentIndex(prev => (prev + 1) % photos.length);
            }, 5000); // 5 seconds
        }
        return () => clearInterval(interval);
    }, [isPlaying, photos.length, currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                setPrevIndex(currentIndex);
                setCurrentIndex(prev => (prev + 1) % photos.length);
                setIsPlaying(false); // Pause on manual interaction
            } else if (e.key === 'ArrowLeft') {
                setPrevIndex(currentIndex);
                setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);
                setIsPlaying(false);
            } else if (e.key === 'Escape') {
                router.back();
            } else if (e.key === ' ') {
                setIsPlaying(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [photos.length, router, currentIndex]);


    if (loading) return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
    if (photos.length === 0) return <div className="flex h-screen items-center justify-center bg-black text-white">No photos yet.</div>;

    const currentPhoto = photos[currentIndex];
    const prevPhoto = photos[prevIndex];
    const albumUrl = typeof window !== 'undefined' ? `${window.location.origin}/event/${id}` : '';

    // Safety check if index is out of bounds or photo missing
    if (!currentPhoto || !currentPhoto.file) {
        // If we have photos but index is bad, reset to 0
        if (photos.length > 0 && currentIndex >= photos.length) {
            setCurrentIndex(0);
        }
        return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
    }

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden">
            {/* Background Image (Previous) - only if we have switched at least once or prev exists */}
            {/* Logic: prevPhoto exists. If prevIndex != currentIndex, we show prev in background. */}

            {/* We want exact crossfade. So Prev should look identical to Current. */}
            {prevPhoto && prevPhoto.file && (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    <img
                        src={getPhotoUrl(prevPhoto)}
                        alt=""
                        className="w-full h-full object-contain animate-fade-out"
                    />
                </div>
            )}

            {/* Main Image (Current) - Fades in over Previous */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        key={currentPhoto.id} // Key forces remount and triggers animation
                        src={getPhotoUrl(currentPhoto)}
                        alt={currentPhoto.caption || "Event Photo"}
                        className="w-full h-full object-contain animate-fade-in"
                    />
                </div>
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
                <p className="text-xl font-medium line-clamp-2">{currentPhoto.caption}</p>
                <p className="text-sm text-white/60 mt-1">
                    Uploaded by {currentPhoto.expand?.owner?.email || 'Guest'} • {new Date(currentPhoto.taken_at || currentPhoto.created).toLocaleTimeString()}
                </p>
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-4 z-10">
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition"
                >
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                </button>
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Progress Bar */}
            {isPlaying && (
                <div className="absolute top-0 left-0 h-1 bg-white/20 w-full">
                    {/* CSS Animation could go here for the progress bar, but for now just static background */}
                </div>
            )}

            {/* Scan-to-join QR */}
            {albumUrl && (
                <div className="absolute bottom-4 left-4 z-20 flex flex-col items-center gap-1 bg-black/60 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                    <QRCode
                        value={albumUrl}
                        size={120}
                        bgColor="#000000"
                        fgColor="#FFFFFF"
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Scan to join</p>
                </div>
            )}
        </div>
    );
}
