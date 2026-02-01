export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface Event {
    id: string;
    name: string;
    code: string;
    visibility: 'public' | 'unlisted' | 'private';
    join_mode: 'open' | 'pin' | 'invite_only';
    approval_required: boolean;
    allow_anonymous_uploads: boolean;
    storage_limit_mb: number;
    created: string;
}

export interface Photo {
    id: string;
    file: string;
    status: 'pending' | 'approved' | 'rejected' | 'quarantined';
    caption?: string;
    created: string;
    event: string; // Event ID or Expanded Event
    owner: string; // User ID or Expanded User
    expand?: {
        event?: Event;
        owner?: User;
    };
}

export interface RealtimeEvent {
    action: 'create' | 'update' | 'delete';
    record: any;
}

export interface DataProvider {
    // Auth
    login(email: string, pass: string): Promise<void>;
    logout(): void;
    onAuthChange(callback: (user: User | null) => void): () => void;
    getUser(): User | null;
    getAuthStoreIsValid(): boolean;

    // Events
    listEvents(): Promise<Event[]>;
    getEvent(id: string): Promise<Event>;
    createEvent(data: Partial<Event>): Promise<Event>;
    deleteEvent(id: string): Promise<void>;

    // Photos
    listPendingPhotos(): Promise<Photo[]>;
    listApprovedPhotos(eventId: string): Promise<Photo[]>;
    updatePhotoStatus(id: string, status: Photo['status']): Promise<void>;
    getPhotoUrl(photo: Photo): string;

    // Realtime
    subscribeToPhotos(callback: (e: RealtimeEvent) => void): () => void;
}
