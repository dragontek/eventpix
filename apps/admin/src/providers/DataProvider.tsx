import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Event, Photo, Invitation } from '@eventpix/db';
import { 
    getUser, isAuthenticated, onAuthChange, login, logout,
    listEvents, getEvent, createEvent, updateEvent, deleteEvent,
    listPendingPhotos, listEventPhotos, listApprovedPhotos,
    deletePhoto, updatePhotoStatus, getPhotoUrl, subscribeToPhotos,
    listInvitations, createInvitation, deleteInvitation, getStats,
    listAuthMethods, authWithOAuth2
} from '../lib/db';

interface DataContextType {
    user: any;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    listEvents: () => Promise<Event[]>;
    getEvent: (id: string) => Promise<Event>;
    createEvent: (data: Partial<Event>) => Promise<Event>;
    updateEvent: (id: string, data: Partial<Event>) => Promise<Event>;
    deleteEvent: (id: string) => Promise<void>;
    listPendingPhotos: () => Promise<Photo[]>;
    listEventPhotos: (eventId: string) => Promise<Photo[]>;
    listApprovedPhotos: (eventId: string) => Promise<Photo[]>;
    deletePhoto: (id: string) => Promise<void>;
    updatePhotoStatus: (id: string, status: string) => Promise<void>;
    getPhotoUrl: (photo: Photo) => string;
    subscribeToPhotos: (callback: (data: any) => void) => () => void;
    getAuthStoreIsValid: () => boolean;
    getUser: () => any;
    onAuthChange: (callback: (model: any) => void) => () => void;
    listAuthMethods: () => Promise<any>;
    authWithOAuth2: (provider: string) => Promise<void>;
    listInvitations: (eventId: string) => Promise<Invitation[]>;
    createInvitation: (eventId: string, email: string) => Promise<Invitation>;
    deleteInvitation: (id: string) => Promise<void>;
    getStats: () => Promise<any>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(getUser());

    useEffect(() => {
        return onAuthChange((user) => {
            setUser(user);
        });
    }, []);

    const value: DataContextType = {
        user,
        login: async (email, password) => {
            await login(email, password);
        },
        logout: () => {
            logout();
        },
        listEvents: async () => {
            const records = await listEvents();
            return records as unknown as Event[];
        },
        getEvent: async (id) => {
            const record = await getEvent(id);
            return record as unknown as Event;
        },
        createEvent: async (data) => {
            const record = await createEvent(data);
            return record as unknown as Event;
        },
        updateEvent: async (id, data) => {
            const record = await updateEvent(id, data);
            return record as unknown as Event;
        },
        deleteEvent: async (id) => {
            await deleteEvent(id);
        },
        listEventPhotos: async (eventId) => {
            const records = await listEventPhotos(eventId);
            return records as unknown as Photo[];
        },
        listApprovedPhotos: async (eventId) => {
            const records = await listApprovedPhotos(eventId);
            return records as unknown as Photo[];
        },
        listPendingPhotos: async () => {
            const records = await listPendingPhotos();
            return records as unknown as Photo[];
        },
        deletePhoto: async (id) => {
            await deletePhoto(id);
        },
        updatePhotoStatus: async (id, status) => {
            await updatePhotoStatus(id, status as any);
        },
        getPhotoUrl: (photo: any) => getPhotoUrl(photo),
        subscribeToPhotos: (callback) => {
            return subscribeToPhotos(callback);
        },
        getAuthStoreIsValid: () => isAuthenticated(),
        getUser: () => getUser(),
        onAuthChange: (callback: (model: any) => void) => {
            return onAuthChange(callback);
        },
        listAuthMethods: async () => {
            return await listAuthMethods();
        },
        authWithOAuth2: async (provider: string) => {
            await authWithOAuth2(provider);
        },
        listInvitations: async (eventId) => {
            const records = await listInvitations(eventId);
            return records as unknown as Invitation[];
        },
        createInvitation: async (eventId, email) => {
            const record = await createInvitation(eventId, email);
            return record as unknown as Invitation;
        },
        deleteInvitation: async (id) => {
            await deleteInvitation(id);
        },
        getStats: async () => {
            return await getStats();
        }
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function DataProviderWrapper({ children }: { children: React.ReactNode }) {
    return <DataProvider>{children}</DataProvider>;
}