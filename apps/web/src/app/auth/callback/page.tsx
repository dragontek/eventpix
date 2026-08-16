"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authRefresh, onAuthChange } from '@/lib/db';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error')) {
            setStatus('error');
            return;
        }

        const from = params.get('from') || '/';

        let redirected = false;
        const finish = (path: string) => {
            if (redirected) return;
            redirected = true;
            router.replace(path);
        };

        authRefresh()
            .then(() => {
                setStatus('success');
                onAuthChange((user) => {
                    if (user) {
                        finish(from);
                    }
                });
                setTimeout(() => finish(from), 2000);
            })
            .catch(() => {
                setStatus('error');
            });
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4 p-6">
            {status === 'loading' && (
                <>
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Completing sign in...</p>
                </>
            )}
            {status === 'success' && <p className="text-gray-300">Sign in successful, redirecting...</p>}
            {status === 'error' && (
                <>
                    <p className="text-red-400">Sign in failed or was cancelled.</p>
                    <button
                        onClick={() => router.replace('/')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg"
                    >
                        Back to Home
                    </button>
                </>
            )}
        </div>
    );
}
