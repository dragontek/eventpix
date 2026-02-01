"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pb, isAuthenticated, getUser } from '@/lib/pocketbase';

export default function Home() {
  const router = useRouter();

  // View State
  const [mode, setMode] = useState<'guest' | 'host'>('guest');
  const [subMode, setSubMode] = useState<'login' | 'dashboard' | 'create'>('login');

  // Data State
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [myEvents, setMyEvents] = useState<any[]>([]);

  // New Event State
  const [newEventName, setNewEventName] = useState('');
  const [newEventCode, setNewEventCode] = useState('');
  const [newVisibility, setNewVisibility] = useState('public');
  const [newJoinMode, setNewJoinMode] = useState('open');
  const [creating, setCreating] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial Auth Check
  useEffect(() => {
    if (isAuthenticated()) {
      // If we have a logged in user who actually has an email/password (not guest), default to host dashboard
      const user = getUser();
      if (user && user.email && !user.email.startsWith('guest_')) {
        setMode('host');
        setSubMode('dashboard');
        fetchMyEvents();
      }
    }
  }, []);

  const fetchMyEvents = async () => {
    try {
      const user = getUser();
      if (!user) return;
      const records = await pb.collection('events').getList(1, 50, {
        filter: `owner = "${user.id}"`,
        sort: '-created'
      });
      setMyEvents(records.items);
    } catch (err: any) {
      console.error("Failed to fetch events", err);
      if (err.data) console.error("PB Error Data:", err.data);
      // alert("Fetch failed: " + JSON.stringify(err.data));
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/join/${code.toUpperCase()}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await pb.collection('users').authWithPassword(email, password);
      setSubMode('dashboard');
      fetchMyEvents();
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const user = getUser();
      const record = await pb.collection('events').create({
        name: newEventName,
        code: newEventCode.toUpperCase(),
        owner: user?.id,
        date: new Date().toISOString(),
        approval_required: false,
        visibility: newVisibility,
        join_mode: newJoinMode
      });
      // Refresh list and go back
      await fetchMyEvents();
      setSubMode('dashboard');
      setNewEventName('');
      setNewEventCode('');
    } catch (err: any) {
      console.error(err);
      alert("Failed to create event. Code might be taken.");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setMode('guest');
    setSubMode('login');
    setEmail('');
    setPassword('');
    setMyEvents([]);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      {/* Top Right Toggle */}
      <div className="absolute top-4 right-4 flex gap-2">
        {mode === 'host' && subMode === 'dashboard' && (
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white px-3 py-1">
            Sign Out
          </button>
        )}
        <div className="bg-gray-900 p-1 rounded-lg flex text-xs font-medium">
          <button
            onClick={() => setMode('guest')}
            className={`px-3 py-1.5 rounded-md transition ${mode === 'guest' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Guest
          </button>
          <button
            onClick={() => setMode('host')}
            className={`px-3 py-1.5 rounded-md transition ${mode === 'host' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Host
          </button>
        </div>
      </div>

      <main className="flex flex-col items-center gap-8 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">EventPix</h1>

        {mode === 'guest' ? (
          <>
            <p className="text-gray-400">Join an event to add photos.</p>
            <form onSubmit={handleJoin} className="w-full space-y-4">
              <input
                type="text"
                placeholder="Enter Event Code (e.g. WEDDING)"
                className="w-full p-4 rounded-lg bg-gray-900 border border-gray-800 text-center text-xl uppercase tracking-widest focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-gray-600"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg transition shadow-lg shadow-blue-900/20 active:scale-95"
              >
                Join Event
              </button>
            </form>
          </>
        ) : (
          // HOST MODE
          <div className="w-full">
            {subMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <h2 className="text-xl font-semibold text-center mb-6">Host Login</h2>
                {error && <div className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-3 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-3 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg transition mt-4 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {subMode === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">My Events</h2>
                  <button
                    onClick={() => setSubMode('create')}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-3 py-1.5 rounded-md"
                  >
                    + New
                  </button>
                </div>
                <div className="space-y-3">
                  {myEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => router.push(`/event/${event.id}`)}
                      className="bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-lg p-4 flex justify-between items-center cursor-pointer transition group"
                    >
                      <div className="text-left">
                        <div className="font-bold group-hover:text-purple-400 transition-colors">{event.name}</div>
                        <div className="text-xs text-gray-500">Code: {event.code}</div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                  {myEvents.length === 0 && (
                    <div className="text-gray-500 py-8 text-sm">You haven't created any events yet.</div>
                  )}
                </div>
              </div>
            )}

            {subMode === 'create' && (
              <form onSubmit={handleCreateEvent} className="space-y-4 text-left">
                <div className="flex items-center gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setSubMode('dashboard')}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-semibold">Create Event</h2>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Event Name</label>
                  <input
                    type="text"
                    value={newEventName}
                    onChange={e => setNewEventName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-3 focus:outline-none focus:border-purple-500"
                    placeholder="e.g. Smith Wedding"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Event Code (Unique)</label>
                  <input
                    type="text"
                    value={newEventCode}
                    onChange={e => setNewEventCode(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-3 focus:outline-none focus:border-purple-500 uppercase tracking-widest"
                    placeholder="e.g. SMITH2025"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Visibility</label>
                    <select
                      value={newVisibility}
                      onChange={(e) => setNewVisibility(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 text-gray-300 rounded p-3 focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Join Mode</label>
                    <select
                      value={newJoinMode}
                      onChange={(e) => setNewJoinMode(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 text-gray-300 rounded p-3 focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="pin">PIN Code</option>
                      <option value="invite_only">Invite Only</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-lg transition mt-4 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Event'}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
