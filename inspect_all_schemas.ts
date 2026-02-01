import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');
        const collections = await pb.collections.getFullList();

        for (const col of collections) {
            const hasCreated = col.fields.some((f: any) => f.name === 'created');
            const hasUpdated = col.fields.some((f: any) => f.name === 'updated');
            console.log(`Collection: ${col.name} (${col.type})`);
            console.log(`  - Has Created: ${hasCreated}`);
            console.log(`  - Has Updated: ${hasUpdated}`);
        }
    } catch (e) {
        console.error(e);
    }
}

main();
