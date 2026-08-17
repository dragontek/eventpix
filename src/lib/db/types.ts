export type User = {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    created: string;
    updated: string;
};

export type Event = {
    id: string;
    name: string;
    code: string;
    visibility: 'public' | 'unlisted' | 'private';
    join_mode: 'open' | 'pin' | 'invite_only';
    pin?: string;
    approval_required: boolean;
    allow_anonymous_uploads: boolean;
    storage_limit_mb: number;
    storage_used_mb?: number;
    owner: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    created: string;
    updated: string;
};

export type Photo = {
    id: string;
    collectionId?: string;
    collectionName?: string;
    file: string;
    caption?: string;
    event: string;
    owner: string;
    status: 'pending' | 'approved' | 'rejected' | 'quarantined';
    likes?: string[];
    session_tag?: string;
    phash?: string;
    owner_name?: string;
    owner_avatar?: string;
    created: string;
    updated: string;
    expand?: {
        owner?: User;
        event?: Event;
    };
};

export type Invitation = {
    id: string;
    event: string;
    email: string;
    created: string;
    updated: string;
};

export type Membership = {
    id: string;
    user: string;
    event: string;
    role: 'host' | 'staff' | 'guest' | 'photographer';
    status: string;
    created: string;
};

export type RealtimeEvent<T = Record<string, any>> = {
    action: 'create' | 'update' | 'delete';
    record: T;
};

export type DashboardStats = {
    totalEvents: number;
    totalPhotos: number;
    totalUsers: number;
    pendingPhotos: number;
};

export type AuthProviderInfo = {
    name: string;
    key: string;
    authUrl: string;
};

export interface DataProvider {
    // Auth
    login(email: string, pass: string): Promise<void>;
    register(email: string, pass: string, name?: string): Promise<User>;
    logout(): void;
    getUser(): User | null;
    getCurrentUser(): Promise<User | null>;
    isAuthenticated(): boolean;
    onAuthChange(callback: (user: User | null) => void): () => void;
    listAuthMethods(): Promise<{ password: boolean; providers: AuthProviderInfo[] }>;
    authWithOAuth2(provider: string, redirectTo?: string): Promise<void>;
    createGuestUser(): Promise<User>;
    authRefresh(): Promise<void>;
    updateUser(data: { name?: string; avatarFile?: File }): Promise<User>;
    getAvatarUrl(user: User): string;

    // Events
    listEvents(): Promise<Event[]>;
    getEvent(id: string): Promise<Event>;
    createEvent(data: Partial<Event>): Promise<Event>;
    updateEvent(id: string, data: Partial<Event>): Promise<Event>;
    deleteEvent(id: string): Promise<void>;

    // Photos
    listPendingPhotos(): Promise<Photo[]>;
    listEventPhotos(eventId: string): Promise<Photo[]>;
    listApprovedPhotos(eventId: string): Promise<Photo[]>;
    createPhoto(eventId: string, file: File, data?: Partial<Photo>): Promise<Photo>;
    updatePhoto(id: string, data: Partial<Photo>): Promise<Photo>;
    updatePhotoStatus(id: string, status: Photo['status']): Promise<void>;
    deletePhoto(id: string): Promise<void>;
    getPhotoUrl(photo: Photo): string;
    getPhotoThumbUrl(photo: Photo): string;

    // Storage
    getFileUrl(collection: string, recordId: string, fileName: string): string;

    // Invitations
    listInvitations(eventId: string): Promise<Invitation[]>;
    createInvitation(eventId: string, email: string): Promise<Invitation>;
    deleteInvitation(id: string): Promise<void>;

    // Realtime
    subscribeToPhotos(callback: (e: RealtimeEvent<Photo>) => void): () => void;
    subscribe(collection: string, callback: (e: RealtimeEvent) => void): () => void;

    // Stats
    getStats(): Promise<DashboardStats>;

    // Provider info
    getProviderName(): string;
}