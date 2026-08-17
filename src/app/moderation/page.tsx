"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { listPendingPhotos, updatePhotoStatus, getPhotoUrl, type Photo } from '@/lib/db';
import UserProfile from '@/components/UserProfile';

export default function ModerationQueuePage() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingPhotos = async () => {
        try {
            const records = await listPendingPhotos();
            setPhotos(records);
        } catch (error) {
            console.error("Failed to fetch pending photos", error);
            enqueueSnackbar("Failed to fetch pending photos", { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingPhotos();
    }, []);

    const handleModeration = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updatePhotoStatus(id, status);
            enqueueSnackbar(`Photo ${status}`, { variant: status === 'approved' ? 'success' : 'info' });
            setPhotos((current) => current.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Failed to update status", error);
            enqueueSnackbar("Failed to update status", { variant: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-12">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold">Moderation Queue</h1>
                </div>

                <UserProfile />
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <h2 className="text-2xl font-bold">Pending Photos</h2>
                        <p className="text-sm text-gray-400">Review photos waiting for approval across all events.</p>
                    </div>
                    <span className="text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
                        {photos.length} Pending
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-48 text-gray-500">
                        Loading pending photos...
                    </div>
                ) : photos.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 p-12 rounded-xl text-center text-gray-400 space-y-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-emerald-400/80 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-bold text-white">All caught up!</p>
                        <p className="text-sm text-gray-400">No photos are currently pending moderation.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
                                <div className="relative w-full h-48 bg-gray-950">
                                    <img
                                        src={getPhotoUrl(photo)}
                                        alt={photo.caption || 'Pending photo'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Pending</p>
                                            <p className="text-xs text-gray-500">{new Date(photo.taken_at || photo.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        {photo.caption && <p className="text-sm text-white mb-2 line-clamp-2">{photo.caption}</p>}
                                        <p className="text-xs text-gray-400 truncate">Uploaded by: {photo.owner_name || 'Guest'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                                        <button
                                            onClick={() => handleModeration(photo.id, 'approved')}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleModeration(photo.id, 'rejected')}
                                            className="bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
