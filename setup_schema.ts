import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    // Retry auth a few times in case server is just starting
    for (let i = 0; i < 5; i++) {
        try {
            await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');
            break;
        } catch (e) {
            console.log("Waiting for server...");
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    if (!pb.authStore.isValid) {
        console.error("Failed to authenticate as admin.");
        process.exit(1);
    }

    const users = await pb.collections.getOne("users"); // System collection usually named 'users' implies _pb_users_auth_ in ID often, but let's fetch it.
    // Note: System 'users' collection might have id '_pb_users_auth_' or unpredictable. 
    // 'users' is the name. getOne("users") works by name or ID.

    console.log("Users Collection ID:", users.id);

    // Helper to create collection
    const createCollection = async (config: any) => {
        try {
            // Check exist
            try {
                await pb.collections.getOne(config.name);
                console.log(`Collection ${config.name} already exists. Skipping.`);
                return await pb.collections.getOne(config.name);
            } catch {
                console.log(`Creating ${config.name}...`);
                return await pb.collections.create(config);
            }
        } catch (e: any) {
            console.error(`Error creating ${config.name}:`, e.data || e);
            throw e;
        }
    };

    // 1. Events
    const events = await createCollection({
        name: "events",
        type: "base",
        fields: [
            { name: "name", type: "text", required: true },
            { name: "visibility", type: "select", values: ["public", "unlisted", "private"] },
            { name: "join_mode", type: "select", values: ["open", "pin", "invite_only"] },
            { name: "approval_required", type: "bool" },
            { name: "allow_anonymous_uploads", type: "bool" },
            { name: "code", type: "text", required: true },
            { name: "storage_limit_mb", type: "number" },
            { name: "storage_used_mb", type: "number" },
            { name: "view_only", type: "bool" },
        ],
    });

    // 2. Photos
    // Depends on Events and Users
    await createCollection({
        name: "photos",
        type: "base",
        fields: [
            { name: "caption", type: "text" },
            { name: "file", type: "file", mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"] },
            { name: "status", type: "select", values: ["pending", "approved", "rejected", "quarantined"] },
            { name: "event", type: "relation", collectionId: events.id, cascadeDelete: true },
            { name: "owner", type: "relation", collectionId: users.id, cascadeDelete: false },
            { name: "session_tag", type: "text" },
            { name: "phash", type: "text" },
        ],
        updateRule: "owner = @request.auth.id",
        deleteRule: "owner = @request.auth.id",
        createRule: "",
    });

    // 3. Orgs
    await createCollection({
        name: "orgs",
        type: "base",
        fields: [
            { name: "name", type: "text", required: true },
            { name: "owner", type: "relation", collectionId: users.id, cascadeDelete: false },
        ],
    });

    // 4. Memberships
    await createCollection({
        name: "memberships",
        type: "base",
        fields: [
            { name: "user", type: "relation", collectionId: users.id, cascadeDelete: true },
            { name: "event", type: "relation", collectionId: events.id, cascadeDelete: true },
            { name: "role", type: "select", values: ["host", "staff", "guest", "photographer"] },
            { name: "status", type: "text" },
        ],
    });

    // 5. Moderation Queue
    // We need photos ID first if we want to relate, but simpler to fetch it by name if needed.
    // Actually we can just wait or fetch.
    const photos = await pb.collections.getOne("photos");
    await createCollection({
        name: "moderation_queue",
        type: "base",
        fields: [
            { name: "photo", type: "relation", collectionId: photos.id, cascadeDelete: true },
            { name: "event", type: "relation", collectionId: events.id, cascadeDelete: true },
            { name: "reason", type: "text" },
        ],
    });

    console.log("Schema setup complete.");
}

main();
