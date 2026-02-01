"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb, isAuthenticated, getUser } from '@/lib/pocketbase';
import PhotoCard from '@/components/PhotoCard';

export default function EventPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // Edit State
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [editEventName, setEditEventName] = useState('');
    const [editVisibility, setEditVisibility] = useState('public');
    const [editJoinMode, setEditJoinMode] = useState('open');

    const id = params.id as string;

    // Auth Check
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/');
        }
    }, []);

    // Fetch Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const eventRecord = await pb.collection('events').getOne(id);
                setEvent(eventRecord);

                const photoRecords = await pb.collection('photos').getList(1, 50, {
                    filter: `event = "${id}" && status = "approved"`,
                    sort: '-created',
                    expand: 'owner',
                });
                setPhotos(photoRecords.items);
            } catch (err) {
                console.error("Failed to load event data", err);
                // If 404, maybe invalid ID
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadData();

            // Realtime
            pb.collection('photos').subscribe('*', (e) => {
                if (e.record.event === id && e.record.status === 'approved') {
                    if (e.action === 'create') {
                        // Fetch expanded data for new photo
                        pb.collection('photos').getOne(e.record.id, { expand: 'owner' })
                            .then(newPhoto => {
                                setPhotos(prev => [newPhoto, ...prev]);
                            });
                    } else if (e.action === 'delete') {
                        setPhotos(prev => prev.filter(p => p.id !== e.record.id));
                    } else if (e.action === 'update') {
                        console.log("Realtime Update Received:", e.record);
                        setPhotos(prev => prev.map(p => {
                            if (p.id === e.record.id) {
                                return { ...p, ...e.record, expand: p.expand };
                            }
                            return p;
                        }));
                    }
                }
            });
        }

        return () => {
            pb.collection('photos').unsubscribe('*');
        };
    }, [id]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('event', id);
            formData.append('owner', getUser()?.id || '');
            formData.append('status', event?.approval_required ? 'pending' : 'approved');

            await pb.collection('photos').create(formData);

            // If approved immediately, it will come in via realtime
            // If pending, we might want to show a toast
            if (event?.approval_required) {
                alert("Photo uploaded! Waiting for host approval.");
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleUpdateEvent = async () => {
        if (!editEventName.trim()) return;
        try {
            await pb.collection('events').update(id, {
                name: editEventName,
                visibility: editVisibility,
                join_mode: editJoinMode
            });
            setEvent((prev: any) => ({
                ...prev,
                name: editEventName,
                visibility: editVisibility,
                join_mode: editJoinMode
            }));
            setIsEditingEvent(false);
        } catch (err) {
            console.error("Failed to update event", err);
            alert("Failed to update event");
        }
    };

    const handleDeleteEvent = async () => {
        const confirmResult = prompt("Type DELETE to confirm deletion of this event and all photos.");
        if (confirmResult !== 'DELETE') return;

        try {
            await pb.collection('events').delete(id);
            router.push('/');
        } catch (err) {
            console.error("Failed to delete event", err);
            alert("Failed to delete event");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-white">Loading Event...</div>;
    if (!event) return <div className="flex h-screen items-center justify-center text-red-500">Event not found</div>;

    const user = getUser();
    const isHost = event?.owner && user?.id === event.owner;

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
                <div className="w-8">
                    {/* Placeholder for back button if needed */}
                    <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
                <h1 className="text-xl font-bold text-white text-center truncate px-2">{event.name}</h1>
                <div className="w-8 flex justify-end">
                    {isHost && (
                        <button
                            onClick={() => {
                                setEditEventName(event.name);
                                setEditVisibility(event.visibility || 'public');
                                setEditJoinMode(event.join_mode || 'open');
                                setIsEditingEvent(true);
                            }}
                            className="text-gray-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    )}
                </div>
            </header>

            {/* Grid */}
            <main className="p-4">
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {photos.map(photo => (
                        <PhotoCard
                            key={photo.id}
                            photo={photo}
                            currentUserId={getUser()?.id}
                            eventOwnerId={event?.owner} // Assuming event owner is not expanded, just the ID
                        />
                    ))}
                </div>
                {photos.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                        No photos yet. Be the first to post!
                    </div>
                )}
            </main>

            {/* FAB */}
            <div className="fixed bottom-6 right-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                <button
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-4 shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    )}
                </button>
            </div>
            {/* Edit Modal */}
            {isEditingEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 p-6 rounded-xl w-full max-w-sm border border-gray-800 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Edit Event</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Event Name</label>
                                <input
                                    type="text"
                                    value={editEventName}
                                    onChange={(e) => setEditEventName(e.target.value)}
                                    className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-purple-500"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Visibility</label>
                                    <select
                                        value={editVisibility}
                                        onChange={(e) => setEditVisibility(e.target.value)}
                                        className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-purple-500 text-sm"
                                    >
                                        <option value="public">Public</option>
                                        <option value="unlisted">Unlisted</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Join Mode</label>
                                    <select
                                        value={editJoinMode}
                                        onChange={(e) => setEditJoinMode(e.target.value)}
                                        className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-purple-500 text-sm"
                                    >
                                        <option value="open">Open</option>
                                        <option value="pin">PIN Code</option>
                                        <option value="invite_only">Invite Only</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800">
                                <h3 className="text-red-500 text-xs font-bold uppercase mb-2">Danger Zone</h3>
                                <button
                                    onClick={handleDeleteEvent}
                                    className="w-full border border-red-900 text-red-500 hover:bg-red-900/20 text-sm py-2 rounded transition"
                                >
                                    Delete Event
                                </button>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-800">
                                <button
                                    onClick={() => setIsEditingEvent(false)}
                                    className="text-gray-400 hover:text-white px-4 py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateEvent}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
