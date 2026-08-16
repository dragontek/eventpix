#!/usr/bin/env node
/**
 * Idempotent schema setup for the EventPix Appwrite database.
 *
 * Creates:
 *   - database `eventpix`
 *   - collections: events, photos, invitations, memberships, moderation_queue, orgs
 *   - storage buckets: photos, avatars
 *
 * Usage:
 *   APPWRITE_ENDPOINT=https://appwrite.example.com/v1 \
 *   APPWRITE_PROJECT_ID=... \
 *   APPWRITE_API_KEY=... \
 *   node scripts/setup-appwrite-schema.mjs
 */
import { AppwriteAdmin, appwriteConfig, defaultPermissions } from './lib/appwrite-admin.mjs';

const COLLECTIONS = {
    events: {
        name: 'Events',
        attributes: [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'code', type: 'string', size: 50, required: true },
            { key: 'visibility', type: 'string', size: 20, required: false, default: 'public' },
            { key: 'join_mode', type: 'string', size: 20, required: false, default: 'open' },
            { key: 'pin', type: 'string', size: 10, required: false, default: '' },
            { key: 'approval_required', type: 'boolean', required: false, default: false },
            { key: 'allow_anonymous_uploads', type: 'boolean', required: false, default: true },
            { key: 'storage_limit_mb', type: 'integer', required: false, default: 100, min: 0 },
            { key: 'storage_used_mb', type: 'integer', required: false, default: 0, min: 0 },
            { key: 'view_only', type: 'boolean', required: false, default: false },
            { key: 'owner', type: 'string', size: 64, required: false },
            { key: 'description', type: 'string', size: 16384, required: false },
            { key: 'start_date', type: 'datetime', required: false },
            { key: 'end_date', type: 'datetime', required: false },
        ],
        indexes: [
            { key: 'events_code_unique', type: 'unique', attributes: ['code'] },
            { key: 'events_owner', type: 'key', attributes: ['owner'] },
            { key: 'events_created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
        ],
    },
    photos: {
        name: 'Photos',
        attributes: [
            { key: 'file', type: 'string', size: 255, required: true },
            { key: 'caption', type: 'string', size: 16384, required: false },
            { key: 'event', type: 'string', size: 64, required: false },
            { key: 'owner', type: 'string', size: 64, required: false },
            { key: 'status', type: 'string', size: 20, required: false, default: 'pending' },
            { key: 'likes', type: 'string', size: 64, array: true, required: false },
            { key: 'session_tag', type: 'string', size: 64, required: false },
            { key: 'phash', type: 'string', size: 64, required: false },
            { key: 'owner_name', type: 'string', size: 255, required: false },
            { key: 'owner_avatar', type: 'string', size: 2048, required: false },
        ],
        indexes: [
            { key: 'photos_event', type: 'key', attributes: ['event'] },
            { key: 'photos_status', type: 'key', attributes: ['status'] },
            { key: 'photos_event_status', type: 'key', attributes: ['event', 'status'] },
            { key: 'photos_event_created', type: 'key', attributes: ['event', '$createdAt'], orders: ['ASC', 'DESC'] },
            { key: 'photos_status_created', type: 'key', attributes: ['status', '$createdAt'], orders: ['ASC', 'DESC'] },
            { key: 'photos_created_at', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
        ],
    },
    invitations: {
        name: 'Invitations',
        attributes: [
            { key: 'event', type: 'string', size: 64, required: false },
            { key: 'email', type: 'string', size: 255, required: true },
        ],
        indexes: [
            { key: 'invitations_event', type: 'key', attributes: ['event'] },
        ],
    },
    memberships: {
        name: 'Memberships',
        attributes: [
            { key: 'user', type: 'string', size: 64, required: false },
            { key: 'event', type: 'string', size: 64, required: false },
            { key: 'role', type: 'string', size: 20, required: false, default: 'guest' },
            { key: 'status', type: 'string', size: 20, required: false, default: 'active' },
        ],
        indexes: [
            { key: 'memberships_user', type: 'key', attributes: ['user'] },
            { key: 'memberships_event', type: 'key', attributes: ['event'] },
        ],
    },
    moderation_queue: {
        name: 'Moderation Queue',
        attributes: [
            { key: 'photo', type: 'string', size: 64, required: false },
            { key: 'event', type: 'string', size: 64, required: false },
            { key: 'reason', type: 'string', size: 1024, required: false },
        ],
        indexes: [
            { key: 'mq_photo', type: 'key', attributes: ['photo'] },
            { key: 'mq_event', type: 'key', attributes: ['event'] },
        ],
    },
    orgs: {
        name: 'Organizations',
        attributes: [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'owner', type: 'string', size: 64, required: false },
        ],
        indexes: [
            { key: 'orgs_owner', type: 'key', attributes: ['owner'] },
        ],
    },
};

const BUCKETS = {
    photos: { name: 'Photos', maxSize: 50 * 1024 * 1024, allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'] },
    avatars: { name: 'Avatars', maxSize: 5 * 1024 * 1024, allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'] },
};

async function main() {
    const cfg = appwriteConfig();
    const admin = new AppwriteAdmin(cfg);
    const permissions = defaultPermissions();

    console.log('EventPix Appwrite schema setup');
    console.log('===============================');
    console.log(`Endpoint: ${cfg.endpoint}`);
    console.log(`Project:  ${cfg.projectId}`);
    console.log(`Database: ${cfg.databaseId}`);
    console.log(`Buckets:  ${Object.keys(BUCKETS).join(', ')}\n`);

    // 1. Database
    console.log('1. Database');
    const db = await admin.createDatabase(cfg.databaseId);
    console.log(`   ${db.created ? '✓ created' : '✓ already exists'}`);

    // 2. Collections, attributes, indexes
    console.log('\n2. Collections');
    for (const [id, spec] of Object.entries(COLLECTIONS)) {
        console.log(`   ${spec.name} (${id})`);
        const col = await admin.createCollection(id, spec.name, permissions);
        console.log(`     ${col.created ? '✓ created' : '✓ already exists'}`);

        for (const attr of spec.attributes) {
            const result = await admin.createAttribute(id, attr);
            console.log(`     ${result.created ? '✓' : '•'} ${attr.key} (${attr.type}${attr.array ? '[]' : ''})`);
        }

        await admin.waitForAttributes(id, spec.attributes.map((a) => a.key));

        for (const index of spec.indexes) {
            const result = await admin.createIndex(id, index);
            console.log(`     ${result.created ? '✓' : '•'} index ${index.key} (${index.type})`);
        }
    }

    // 3. Buckets
    console.log('\n3. Storage buckets');
    for (const [id, spec] of Object.entries(BUCKETS)) {
        const bucket = await admin.createBucket(id, spec.name, permissions, {
            maxSize: spec.maxSize,
            allowedExtensions: spec.allowedExtensions,
        });
        console.log(`   ${bucket.created ? '✓' : '•'} ${id}`);
    }

    console.log('\n================================');
    console.log('Schema setup complete!');
    console.log('\nNext steps:');
    console.log(`  1. Create an API key with the needed scopes in the Appwrite console.`);
    console.log(`  2. Set these env vars for the apps:`);
    console.log(`     NEXT_PUBLIC_DB_PROVIDER=appwrite`);
    console.log(`     NEXT_PUBLIC_APPWRITE_ENDPOINT=${cfg.endpoint}`);
    console.log(`     NEXT_PUBLIC_APPWRITE_PROJECT_ID=${cfg.projectId}`);
    console.log(`     NEXT_PUBLIC_APPWRITE_DATABASE_ID=${cfg.databaseId}`);
    console.log(`     NEXT_PUBLIC_APPWRITE_BUCKET_ID=${cfg.bucketId}`);
}

main().catch((error) => {
    console.error(`\n❌ Schema setup failed: ${error.message}`);
    process.exit(1);
});
