import {
    Client,
    Databases,
    Account,
    Storage,
    ID,
    Query,
    type Models,
    type Client as AppwriteClient,
} from 'appwrite';

import type {
    DataProvider,
    User,
    Event,
    Photo,
    Invitation,
    RealtimeEvent,
    DashboardStats,
    AuthProviderInfo,
} from '../types';

export interface AppwriteConfig {
    endpoint: string;
    projectId: string;
    databaseId: string;
    bucketId: string;
    avatarsBucketId: string;
    usersCollectionId: string;
    eventsCollectionId: string;
    photosCollectionId: string;
    invitationsCollectionId: string;
    membershipsCollectionId?: string;
}

const DEFAULT_CONFIG: AppwriteConfig = {
    endpoint: typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://dragontek.io/v1') : 'https://dragontek.io/v1',
    projectId: typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID || '6a81ca9700213356c019') : '6a81ca9700213356c019',
    databaseId: typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID || 'eventpix') : 'eventpix',
    bucketId: typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || process.env.APPWRITE_BUCKET_ID || 'photos') : 'photos',
    avatarsBucketId: typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID || process.env.APPWRITE_AVATARS_BUCKET_ID || 'avatars') : 'avatars',
    usersCollectionId: typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || process.env.APPWRITE_USERS_COLLECTION_ID || 'users') : 'users',
    eventsCollectionId: typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID || process.env.APPWRITE_EVENTS_COLLECTION_ID || 'events') : 'events',
    photosCollectionId: typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_APPWRITE_PHOTOS_COLLECTION_ID || process.env.APPWRITE_PHOTOS_COLLECTION_ID || 'photos') : 'photos',
    invitationsCollectionId: typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_APPWRITE_INVITATIONS_COLLECTION_ID || process.env.APPWRITE_INVITATIONS_COLLECTION_ID || 'invitations') : 'invitations',
};

/**
 * Everyone can read; any signed-in user can write. Matches the schema applied
 * by scripts/setup-appwrite-schema.mjs.
 */
const DOCUMENT_PERMISSIONS = ['read("any")', 'write("users")'];

export class AppwriteProvider implements DataProvider {
    private client: AppwriteClient;
    private databases: Databases;
    private account: Account;
    private storage: Storage;
    private config: AppwriteConfig;
    private authCallback: ((user: User | null) => void) | null = null;
    private cachedUser: User | null = null;

    constructor(config: Partial<AppwriteConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };

        this.client = new Client()
            .setEndpoint(this.config.endpoint)
            .setProject(this.config.projectId);

        this.databases = new Databases(this.client);
        this.account = new Account(this.client);
        this.storage = new Storage(this.client);

        this.initAuthListener();
    }

    private initAuthListener() {
        if (typeof window === 'undefined') return;
        this.client.subscribe('account', (response) => {
            if (response.events.some(e => e.includes('account.sessions') || e.includes('account.create') || e.includes('account.delete'))) {
                this.loadUser().then(user => {
                    if (this.authCallback) {
                        this.authCallback(user);
                    }
                });
            }
        });
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const user = await this.account.get();
            this.cachedUser = this.mapUser(user as Models.User<Record<string, any>>);
        } catch {
            this.cachedUser = null;
        }
        return this.cachedUser;
    }

    private async loadUser(): Promise<User | null> {
        return this.getCurrentUser();
    }

    private mapUser(appwriteUser: Models.User<Record<string, any>>): User {
        return {
            id: appwriteUser.$id,
            email: appwriteUser.email,
            name: appwriteUser.name,
            avatar: appwriteUser.prefs?.avatar || undefined,
            created: appwriteUser.$createdAt,
            updated: appwriteUser.$updatedAt,
        };
    }

    private mapEvent(doc: Models.Document): Event {
        const data = doc as unknown as Record<string, any>;
        return {
            id: doc.$id,
            name: data.name || '',
            code: data.code || '',
            visibility: data.visibility || 'public',
            join_mode: data.join_mode || 'open',
            pin: data.pin,
            approval_required: data.approval_required ?? false,
            allow_anonymous_uploads: data.allow_anonymous_uploads ?? true,
            storage_limit_mb: data.storage_limit_mb || 100,
            storage_used_mb: data.storage_used_mb,
            owner: data.owner || '',
            description: data.description,
            start_date: data.start_date,
            end_date: data.end_date,
            created: doc.$createdAt,
            updated: doc.$updatedAt,
        };
    }

    private mapPhoto(doc: Models.Document): Photo {
        const data = doc as unknown as Record<string, any>;
        return {
            id: doc.$id,
            collectionId: doc.$collectionId,
            collectionName: doc.$collectionId,
            file: data.file || '',
            caption: data.caption,
            event: data.event || '',
            owner: data.owner || '',
            status: data.status || 'pending',
            likes: data.likes || [],
            session_tag: data.session_tag,
            phash: data.phash,
            owner_name: data.owner_name,
            owner_avatar: data.owner_avatar,
            created: doc.$createdAt,
            updated: doc.$updatedAt,
            expand: data.expand,
        };
    }

    private mapInvitation(doc: Models.Document): Invitation {
        const data = doc as unknown as Record<string, any>;
        return {
            id: doc.$id,
            event: data.event || '',
            email: data.email || '',
            created: doc.$createdAt,
            updated: doc.$updatedAt,
        };
    }

    getProviderName(): string {
        return 'appwrite';
    }

    async login(email: string, pass: string): Promise<void> {
        await this.account.createEmailPasswordSession(email, pass);
        const user = await this.loadUser();
        if (this.authCallback) {
            this.authCallback(user);
        }
    }

    async register(email: string, pass: string, name?: string): Promise<User> {
        const created = await this.account.create('unique()', email, pass, name || '');
        await this.account.createEmailPasswordSession(email, pass);

        const user: User = {
            id: created.$id,
            email: created.email,
            name: created.name || undefined,
            created: created.$createdAt,
            updated: created.$createdAt,
        };
        this.cachedUser = user;
        if (this.authCallback) {
            this.authCallback(user);
        }
        return user;
    }

    logout(): void {
        this.account.deleteSession('current').catch(() => {});
        this.cachedUser = null;
        if (this.authCallback) {
            this.authCallback(null);
        }
    }

    getUser(): User | null {
        return this.cachedUser;
    }

    isAuthenticated(): boolean {
        if (this.cachedUser !== null) return true;
        if (this.client.headers['X-Appwrite-Session']) return true;
        if (typeof window === 'undefined') return false;
        try {
            const fallback = JSON.parse(window.localStorage.getItem('cookieFallback') ?? '{}');
            return Object.keys(fallback).some(k => k.startsWith('a_session_'));
        } catch {
            return false;
        }
    }

    onAuthChange(callback: (user: User | null) => void): () => void {
        this.authCallback = callback;
        callback(this.cachedUser);

        this.loadUser().then(user => {
            if (this.authCallback === callback) {
                callback(user);
            }
        });

        return () => {
            if (this.authCallback === callback) {
                this.authCallback = null;
            }
        };
    }

    async listAuthMethods(): Promise<{ password: boolean; providers: AuthProviderInfo[] }> {
        return {
            password: true,
            providers: [
                { name: 'google', key: 'google', authUrl: '' },
                { name: 'apple', key: 'apple', authUrl: '' },
            ],
        };
    }

    async authWithOAuth2(provider: string, redirectTo?: string): Promise<void> {
        const origin = typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost:3000';
        const callbackUrl = `${origin}/auth/callback${redirectTo ? `?from=${encodeURIComponent(redirectTo)}` : ''}`;
        await this.account.createOAuth2Session(
            provider as any,
            callbackUrl,
            `${callbackUrl}${redirectTo ? '&' : '?'}error=true`
        );
    }

    async createGuestUser(): Promise<User> {
        const randomId = Math.random().toString(36).substring(2, 15);
        const email = `guest_${randomId}@eventpix.local`;
        const password = `pass_${randomId}`;

        const userId = await this.account.create('unique()', email, password, 'Guest');
        await this.account.createEmailPasswordSession(email, password);

        const user: User = {
            id: userId.$id,
            email: userId.email,
            name: userId.name || 'Guest',
            created: userId.$createdAt,
            updated: userId.$createdAt,
        };
        this.cachedUser = user;
        if (this.authCallback) {
            this.authCallback(user);
        }
        return user;
    }

    async authRefresh(): Promise<void> {
        await this.account.updateSession('current');
        await this.loadUser();
    }

    async updateUser(data: { name?: string; avatarFile?: File }): Promise<User> {
        if (data.name) {
            await this.account.updateName(data.name);
        }
        if (data.avatarFile) {
            const file = await this.storage.createFile(
                this.config.avatarsBucketId,
                ID.unique(),
                data.avatarFile,
                DOCUMENT_PERMISSIONS
            );
            await this.account.updatePrefs({ avatar: file.$id });
        }
        const user = await this.loadUser();
        if (this.authCallback) {
            this.authCallback(user);
        }
        if (!user) {
            throw new Error('Failed to refresh user after update');
        }
        return user;
    }

    getAvatarUrl(user: User): string {
        if (!user) return '';
        if (user.avatar) {
            return this.storage.getFilePreview(this.config.avatarsBucketId, user.avatar);
        }
        const name = encodeURIComponent(user.name || 'Guest');
        return `${this.config.endpoint}/avatars/initials?name=${name}&width=96&height=96&project=${this.config.projectId}`;
    }

    async listEvents(): Promise<Event[]> {
        const response = await this.databases.listDocuments(
            this.config.databaseId,
            this.config.eventsCollectionId,
            [Query.orderDesc('$createdAt')]
        );
        return response.documents.map(doc => this.mapEvent(doc));
    }

    async getEvent(id: string): Promise<Event> {
        const doc = await this.databases.getDocument(
            this.config.databaseId,
            this.config.eventsCollectionId,
            id
        );
        return this.mapEvent(doc);
    }

    async createEvent(data: Partial<Event>): Promise<Event> {
        const eventData = {
            name: data.name,
            code: data.code,
            visibility: data.visibility || 'public',
            join_mode: data.join_mode || 'open',
            pin: data.pin,
            approval_required: data.approval_required ?? false,
            allow_anonymous_uploads: data.allow_anonymous_uploads ?? true,
            storage_limit_mb: data.storage_limit_mb || 100,
            owner: data.owner,
            description: data.description,
            start_date: data.start_date,
            end_date: data.end_date,
        };

        const doc = await this.databases.createDocument(
            this.config.databaseId,
            this.config.eventsCollectionId,
            ID.unique(),
            eventData,
            DOCUMENT_PERMISSIONS
        );
        return this.mapEvent(doc);
    }

    async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
        const updateData: Record<string, any> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.code !== undefined) updateData.code = data.code;
        if (data.visibility !== undefined) updateData.visibility = data.visibility;
        if (data.join_mode !== undefined) updateData.join_mode = data.join_mode;
        if (data.pin !== undefined) updateData.pin = data.pin;
        if (data.approval_required !== undefined) updateData.approval_required = data.approval_required;
        if (data.allow_anonymous_uploads !== undefined) updateData.allow_anonymous_uploads = data.allow_anonymous_uploads;
        if (data.storage_limit_mb !== undefined) updateData.storage_limit_mb = data.storage_limit_mb;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.start_date !== undefined) updateData.start_date = data.start_date;
        if (data.end_date !== undefined) updateData.end_date = data.end_date;

        const doc = await this.databases.updateDocument(
            this.config.databaseId,
            this.config.eventsCollectionId,
            id,
            updateData
        );
        return this.mapEvent(doc);
    }

    async deleteEvent(id: string): Promise<void> {
        await this.databases.deleteDocument(
            this.config.databaseId,
            this.config.eventsCollectionId,
            id
        );
    }

    async listPendingPhotos(): Promise<Photo[]> {
        const response = await this.databases.listDocuments(
            this.config.databaseId,
            this.config.photosCollectionId,
            [
                Query.equal('status', ['pending']),
                Query.orderDesc('$createdAt'),
            ]
        );
        return response.documents.map(doc => this.mapPhoto(doc));
    }

    async listEventPhotos(eventId: string): Promise<Photo[]> {
        const response = await this.databases.listDocuments(
            this.config.databaseId,
            this.config.photosCollectionId,
            [
                Query.equal('event', [eventId]),
                Query.orderDesc('$createdAt'),
            ]
        );
        return response.documents.map(doc => this.mapPhoto(doc));
    }

    async listApprovedPhotos(eventId: string): Promise<Photo[]> {
        const response = await this.databases.listDocuments(
            this.config.databaseId,
            this.config.photosCollectionId,
            [
                Query.equal('event', [eventId]),
                Query.equal('status', ['approved']),
                Query.orderDesc('$createdAt'),
            ]
        );
        return response.documents.map(doc => this.mapPhoto(doc));
    }

    async createPhoto(eventId: string, file: File, data?: Partial<Photo>): Promise<Photo> {
        const fileId = ID.unique();

        const fileResponse = await this.storage.createFile(
            this.config.bucketId,
            fileId,
            file,
            DOCUMENT_PERMISSIONS
        );

        const photoData = {
            file: fileResponse.$id,
            event: eventId,
            owner: data?.owner || this.cachedUser?.id || '',
            owner_name: data?.owner_name || this.cachedUser?.name || '',
            owner_avatar: data?.owner_avatar || (this.cachedUser ? this.getAvatarUrl(this.cachedUser) : ''),
            status: data?.status || 'pending',
            caption: data?.caption,
            likes: data?.likes || [],
            session_tag: data?.session_tag,
        };

        const doc = await this.databases.createDocument(
            this.config.databaseId,
            this.config.photosCollectionId,
            ID.unique(),
            photoData,
            DOCUMENT_PERMISSIONS
        );

        return this.mapPhoto(doc);
    }

    async updatePhotoStatus(id: string, status: Photo['status']): Promise<void> {
        await this.databases.updateDocument(
            this.config.databaseId,
            this.config.photosCollectionId,
            id,
            { status }
        );
    }

    async updatePhoto(id: string, data: Partial<Photo>): Promise<Photo> {
        const updateData: Record<string, any> = {};

        if (data.caption !== undefined) updateData.caption = data.caption;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.likes !== undefined) updateData.likes = data.likes;

        const doc = await this.databases.updateDocument(
            this.config.databaseId,
            this.config.photosCollectionId,
            id,
            updateData
        );
        return this.mapPhoto(doc);
    }

    async deletePhoto(id: string): Promise<void> {
        const doc = await this.databases.getDocument(
            this.config.databaseId,
            this.config.photosCollectionId,
            id
        );
        const data = doc as unknown as Record<string, any>;

        if (data.file) {
            try {
                await this.storage.deleteFile(this.config.bucketId, data.file);
            } catch (e) {
                console.warn('Failed to delete file from storage:', e);
            }
        }

        await this.databases.deleteDocument(
            this.config.databaseId,
            this.config.photosCollectionId,
            id
        );
    }

    getPhotoUrl(photo: Photo): string {
        return this.getFileUrl(this.config.photosCollectionId, photo.id, photo.file);
    }

    getPhotoThumbUrl(photo: Photo): string {
        return this.storage.getFilePreview(this.config.bucketId, photo.file, 600, undefined, undefined, 80);
    }

    getFileUrl(_collection: string, _recordId: string, fileName: string): string {
        if (!fileName) return '';
        return this.storage.getFilePreview(this.config.bucketId, fileName);
    }

    async listInvitations(eventId: string): Promise<Invitation[]> {
        const response = await this.databases.listDocuments(
            this.config.databaseId,
            this.config.invitationsCollectionId,
            [
                Query.equal('event', [eventId]),
                Query.orderDesc('$createdAt'),
            ]
        );
        return response.documents.map(doc => this.mapInvitation(doc));
    }

    async createInvitation(eventId: string, email: string): Promise<Invitation> {
        const doc = await this.databases.createDocument(
            this.config.databaseId,
            this.config.invitationsCollectionId,
            ID.unique(),
            { event: eventId, email },
            DOCUMENT_PERMISSIONS
        );
        return this.mapInvitation(doc);
    }

    async deleteInvitation(id: string): Promise<void> {
        await this.databases.deleteDocument(
            this.config.databaseId,
            this.config.invitationsCollectionId,
            id
        );
    }

    subscribeToPhotos(callback: (e: RealtimeEvent) => void): () => void {
        return this.subscribe(this.config.photosCollectionId, (e) => {
            callback({ ...e, record: this.mapPhoto(e.record as Models.Document) });
        });
    }

    subscribe(collection: string, callback: (e: RealtimeEvent) => void): () => void {
        const channel = `databases.${this.config.databaseId}.collections.${collection}.documents`;

        const unsubscribe = this.client.subscribe(channel, (response) => {
            const payload = response.payload as Models.Document;
            const eventType = response.events[0] || '';

            let action: 'create' | 'update' | 'delete' = 'update';
            if (eventType.includes('.create')) {
                action = 'create';
            } else if (eventType.includes('.delete')) {
                action = 'delete';
            } else if (eventType.includes('.update')) {
                action = 'update';
            }

            callback({
                action,
                record: payload,
            });
        });

        return () => {
            unsubscribe();
        };
    }

    async getStats(): Promise<DashboardStats> {
        const [events, photos, pending] = await Promise.all([
            this.databases.listDocuments(this.config.databaseId, this.config.eventsCollectionId, [Query.limit(1)]),
            this.databases.listDocuments(this.config.databaseId, this.config.photosCollectionId, [Query.limit(5000)]),
            this.databases.listDocuments(this.config.databaseId, this.config.photosCollectionId, [Query.equal('status', ['pending']), Query.limit(1)]),
        ]);

        const owners = new Set<string>();
        for (const doc of photos.documents) {
            const owner = (doc as unknown as Record<string, any>).owner;
            if (owner) owners.add(owner);
        }

        return {
            totalEvents: events.total,
            totalPhotos: photos.total,
            totalUsers: owners.size,
            pendingPhotos: pending.total,
        };
    }
}
