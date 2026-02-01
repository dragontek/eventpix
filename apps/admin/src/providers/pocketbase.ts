import PocketBase from 'pocketbase';
import type { DataProvider, Event, Photo, RealtimeEvent, User } from './types';

const PB_URL = 'http://127.0.0.1:8090'; // TODO: Env var

export class PocketBaseProvider implements DataProvider {
    private pb: PocketBase;

    constructor() {
        this.pb = new PocketBase(PB_URL);
        this.pb.autoCancellation(false);
    }

    // --- Auth ---
    async login(email: string, pass: string): Promise<void> {
        await this.pb.collection('users').authWithPassword(email, pass);
    }

    logout(): void {
        this.pb.authStore.clear();
    }

    onAuthChange(callback: (user: User | null) => void): () => void {
        return this.pb.authStore.onChange((token, model) => {
            callback(model as User | null);
        });
    }

    getUser(): User | null {
        return this.pb.authStore.model as User | null;
    }

    getAuthStoreIsValid(): boolean {
        return this.pb.authStore.isValid;
    }

    // --- Events ---
    async listEvents(): Promise<Event[]> {
        return await this.pb.collection('events').getFullList();
    }

    async getEvent(id: string): Promise<Event> {
        return await this.pb.collection('events').getOne(id);
    }

    async createEvent(data: Partial<Event>): Promise<Event> {
        return await this.pb.collection('events').create(data);
    }

    async deleteEvent(id: string): Promise<void> {
        await this.pb.collection('events').delete(id);
    }

    // --- Photos ---
    async listPendingPhotos(): Promise<Photo[]> {
        return await this.pb.collection('photos').getFullList({
            filter: 'status = "pending"',
            expand: 'event,owner',
            sort: '-created',
        });
    }

    async listApprovedPhotos(eventId: string): Promise<Photo[]> {
        return await this.pb.collection('photos').getFullList({
            filter: `event = "${eventId}" && status = "approved"`,
            sort: '-created',
        });
    }

    async updatePhotoStatus(id: string, status: Photo['status']): Promise<void> {
        await this.pb.collection('photos').update(id, { status });
    }

    getPhotoUrl(photo: Photo): string {
        return this.pb.files.getUrl(photo, photo.file);
    }

    // --- Realtime ---
    subscribeToPhotos(callback: (e: RealtimeEvent) => void): () => void {
        const unsubPromise = this.pb.collection('photos').subscribe('*', (e) => {
            callback({
                action: e.action as any,
                record: e.record,
            });
        });

        return () => {
            unsubPromise.then(unsub => unsub());
        };
    }
}
