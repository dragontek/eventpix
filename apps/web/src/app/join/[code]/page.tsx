"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

export default function JoinPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const code = params.code as string;

    const authenticating = useRef(false);

    const authenticateAnonymously = async () => {
        if (pb.authStore.isValid || authenticating.current) return;

        authenticating.current = true;
        console.log("Starting anonymous auth...");

        try {
            const randomId = Math.random().toString(36).substring(7);
            const email = `guest_${randomId}@eventpix.local`;
            const password = `pass_${randomId}`;

            await pb.collection('users').create({
                email,
                password,
                passwordConfirm: password,
                name: "Guest " + randomId
            });
            await pb.collection('users').authWithPassword(email, password);
            console.log("Auth successful:", pb.authStore.model?.id);
        } catch (err) {
            console.error("Auth failed:", err);
            authenticating.current = false; // Reset if failed so they can try again? Or maybe just failed.
        }
    };

    useEffect(() => {
        const init = async () => {
            await authenticateAnonymously();

            try {
                // Find event by code (case-insensitive by convention)
                const normalizedCode = code.toUpperCase();
                const records = await pb.collection('events').getList(1, 1, {
                    filter: `code = "${normalizedCode}"`,
                });

                if (records.items.length > 0) {
                    setEvent(records.items[0]);
                } else {
                    setError('Event not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load event');
            } finally {
                setLoading(false);
            }
        };

        if (code) init();
    }, [code]);

    const handleJoin = async () => {
        if (event) {
            router.push(`/event/${event.id}`);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
            <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
            <p className="text-gray-400 mb-8">Join Code: {event.code}</p>

            <div className="w-full max-w-sm space-y-4">
                <button
                    onClick={handleJoin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                    Continue as Guest
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                    By joining, you agree to share photos with the event host.
                </p>
            </div>
        </div>
    );
}
