"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStats, getUser, type DashboardStats } from '@/lib/db';
import UserProfile from '@/components/UserProfile';

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const user = getUser();

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-12">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold">Host Dashboard</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/moderation')}
                        className="text-xs bg-amber-600/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-600/30 transition font-medium"
                    >
                        Moderation Queue
                    </button>
                    <UserProfile />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">Platform Overview</h2>
                    <p className="text-sm text-gray-400">Live metrics across your events and content.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-48 text-gray-500">
                        Loading statistics...
                    </div>
                ) : !stats ? (
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl text-center text-gray-400">
                        No statistics available right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Events */}
                        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Events</p>
                                <p className="text-3xl font-extrabold mt-1 text-white">{stats.totalEvents}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Total Photos */}
                        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Photos</p>
                                <p className="text-3xl font-extrabold mt-1 text-white">{stats.totalPhotos}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Total Users */}
                        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</p>
                                <p className="text-3xl font-extrabold mt-1 text-white">{stats.totalUsers}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Pending Approvals */}
                        <div
                            onClick={() => router.push('/moderation')}
                            className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition"
                        >
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Approvals</p>
                                <p className="text-3xl font-extrabold mt-1 text-amber-400">{stats.pendingPhotos}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
