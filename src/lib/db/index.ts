import type { DataProvider, User, Event, Photo, RealtimeEvent, Invitation } from './types';
import { AppwriteProvider, type AppwriteConfig } from './providers/appwrite';

export * from './types';
export { AppwriteProvider, type AppwriteConfig } from './providers/appwrite';

export interface DbConfig {
    provider: 'appwrite';
    appwrite?: Partial<AppwriteConfig>;
}

function getConfig(): DbConfig {
    return {
        provider: 'appwrite',
    };
}

let providerInstance: DataProvider | undefined;

export function getDbProvider(config?: DbConfig): DataProvider {
    if (providerInstance) {
        return providerInstance;
    }

    const cfg = config || getConfig();
    providerInstance = new AppwriteProvider(cfg.appwrite);

    return providerInstance;
}

export function createDbProvider(config: DbConfig): DataProvider {
    return new AppwriteProvider(config.appwrite);
}

export const db = getDbProvider();

// Convenient bound helper functions for web & UI components
export const getUser = () => db.getUser();
export const isAuthenticated = () => db.isAuthenticated();
export const getCurrentUser = () => db.getCurrentUser();
export const login = (email: string, pass: string) => db.login(email, pass);
export const register = (email: string, pass: string, name?: string) => db.register(email, pass, name);
export const logout = () => db.logout();
export const authRefresh = () => db.authRefresh();
export const listEvents = () => db.listEvents();
export const getEvent = (id: string) => db.getEvent(id);
export const createEvent = (data: Partial<Event>) => db.createEvent(data);
export const updateEvent = (id: string, data: Partial<Event>) => db.updateEvent(id, data);
export const deleteEvent = (id: string) => db.deleteEvent(id);
export const listEventPhotos = (eventId: string) => db.listEventPhotos(eventId);
export const listApprovedPhotos = (eventId: string) => db.listApprovedPhotos(eventId);
export const createPhoto = (eventId: string, file: File, data?: Partial<Photo>) => db.createPhoto(eventId, file, data);
export const updatePhoto = (id: string, data: Partial<Photo>) => db.updatePhoto(id, data);
export const deletePhoto = (id: string) => db.deletePhoto(id);
export const updatePhotoStatus = (id: string, status: Photo['status']) => db.updatePhotoStatus(id, status);
export const listPendingPhotos = () => db.listPendingPhotos();
export const subscribeToPhotos = (callback: (e: RealtimeEvent) => void) => db.subscribeToPhotos(callback);
export const listInvitations = (eventId: string) => db.listInvitations(eventId);
export const createInvitation = (eventId: string, email: string) => db.createInvitation(eventId, email);
export const deleteInvitation = (id: string) => db.deleteInvitation(id);
export const onAuthChange = (callback: (user: User | null) => void) => db.onAuthChange(callback);
export const listAuthMethods = () => db.listAuthMethods();
export const authWithOAuth2 = (provider: string, redirectTo?: string) => db.authWithOAuth2(provider, redirectTo);
export const createGuestUser = () => db.createGuestUser();
export const getAvatarUrl = (user: User) => db.getAvatarUrl(user);
export const getPhotoUrl = (photo: Photo) => db.getPhotoUrl(photo);
export const getPhotoThumbUrl = (photo: Photo) => db.getPhotoThumbUrl(photo);
export const updateUser = (data: { name?: string; avatarFile?: File }) => db.updateUser(data);
export const getStats = () => db.getStats();
