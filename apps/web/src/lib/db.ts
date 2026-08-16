import {
    db as _db,
    getDbProvider,
    createDbProvider,
    type DataProvider,
    type DbConfig,
    type User,
    type Event,
    type Photo,
    type Invitation,
    type RealtimeEvent,
    type DashboardStats,
} from '@eventpix/db';

export const db = _db;

export type { DataProvider, DbConfig };
export type { User, Event, Photo, Invitation, RealtimeEvent, DashboardStats };

export const getUser = () => db.getUser();
export const isAuthenticated = () => db.isAuthenticated();
export const onAuthChange = (callback: (user: User | null) => void) => db.onAuthChange(callback);
export const login = (email: string, pass: string) => db.login(email, pass);
export const register = (email: string, pass: string, name?: string) => db.register(email, pass, name);
export const logout = () => db.logout();

export const listEvents = () => db.listEvents();
export const getEvent = (id: string) => db.getEvent(id);
export const createEvent = (data: any) => db.createEvent(data);
export const updateEvent = (id: string, data: any) => db.updateEvent(id, data);
export const deleteEvent = (id: string) => db.deleteEvent(id);

export const listPendingPhotos = () => db.listPendingPhotos();
export const listEventPhotos = (eventId: string) => db.listEventPhotos(eventId);
export const listApprovedPhotos = (eventId: string) => db.listApprovedPhotos(eventId);
export const createPhoto = (eventId: string, file: File, data?: any) => db.createPhoto(eventId, file, data);
export const updatePhoto = (id: string, data: any) => db.updatePhoto?.(id, data);
export const updatePhotoStatus = (id: string, status: any) => db.updatePhotoStatus(id, status);
export const deletePhoto = (id: string) => db.deletePhoto(id);
export const getPhotoUrl = (photo: any) => db.getPhotoUrl(photo);
export const getPhotoThumbUrl = (photo: any) => db.getPhotoThumbUrl(photo);

export const subscribeToPhotos = (callback: (e: RealtimeEvent) => void) => db.subscribeToPhotos(callback);
export const subscribe = (collection: string, callback: (e: RealtimeEvent) => void) => db.subscribe(collection, callback);

export const listInvitations = (eventId: string) => db.listInvitations(eventId);
export const createInvitation = (eventId: string, email: string) => db.createInvitation(eventId, email);
export const deleteInvitation = (id: string) => db.deleteInvitation(id);

export const getStats = () => db.getStats();
export const getProviderName = () => db.getProviderName();

export const listAuthMethods = () => db.listAuthMethods();
export const authWithOAuth2 = (provider: string) => db.authWithOAuth2(provider);
export const createGuestUser = () => db.createGuestUser();
export const authRefresh = () => db.authRefresh();
export const updateUser = (data: { name?: string; avatarFile?: File }) => db.updateUser(data);
export const getAvatarUrl = (user: User) => db.getAvatarUrl(user);

export const getFileUrl = (collection: string, recordId: string, fileName: string) => db.getFileUrl(collection, recordId, fileName);

export function initDb(config?: DbConfig) {
    return getDbProvider(config);
}