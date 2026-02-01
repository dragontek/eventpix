"use client";

import { useState } from 'react';
import PocketBase from 'pocketbase';

export default function AdminFixPage() {
    const [status, setStatus] = useState('Idle');
    const [log, setLog] = useState<string[]>([]);

    // Create a fresh instance to avoid any global config issues
    const pb = new PocketBase('http://127.0.0.1:8090');

    const addLog = (msg: string) => setLog(prev => [...prev, msg]);

    const runFix = async () => {
        setStatus('Running...');
        setLog([]);
        try {
            addLog("Authenticating...");
            await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');
            addLog("Authenticated.");

            addLog("Fetching 'events' collection...");
            const collection = await pb.collections.getOne('events');

            const hasPin = collection.schema.some((f: any) => f.name === 'pin');

            if (hasPin) {
                addLog("PIN field already exists.");
                setStatus('Success (Already Existed)');
            } else {
                addLog("Adding PIN field...");
                collection.schema.push({
                    name: 'pin',
                    type: 'text',
                    required: false,
                    presentable: false,
                    unique: false,
                    options: { pattern: "" }
                });

                await pb.collections.update(collection.id, collection);
                addLog("PIN field added to schema.");
                setStatus('Success (Updated)');
            }

        } catch (e: any) {
            console.error(e);
            addLog(`Error: ${e.message}`);
            setStatus('Failed');
        }
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white font-mono">
            <h1 className="text-2xl font-bold mb-4">Schema Fixer</h1>
            <button
                onClick={runFix}
                className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded mb-4 font-bold"
            >
                Run Fix
            </button>
            <div className="mb-4">Status: <span className={status.includes('Success') ? 'text-green-400' : status === 'Failed' ? 'text-red-400' : 'text-yellow-400'}>{status}</span></div>
            <div className="bg-black p-4 rounded border border-gray-700 min-h-[200px]">
                {log.map((line, i) => <div key={i}>{line}</div>)}
            </div>
        </div>
    );
}
