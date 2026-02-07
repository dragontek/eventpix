import PocketBase from 'pocketbase';

// Use environment variable or default to local backend
const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://console.eventpix.io';

export const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

// Helper to get the current auth model safely
export const getUser = () => {
    return pb.authStore.model;
}

export const isAuthenticated = () => {
    return pb.authStore.isValid;
}
