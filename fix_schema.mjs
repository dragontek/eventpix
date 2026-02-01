import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        console.log("Authenticating...");
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');

        console.log("Authenticated. Fetching schema...");
        const collection = await pb.collections.getOne('events');

        const hasPin = collection.schema.some(f => f.name === 'pin');

        if (hasPin) {
            console.log("PIN field exists.");
        } else {
            console.log("Adding PIN field...");
            collection.schema.push({
                name: 'pin',
                type: 'text',
                required: false,
                presentable: false,
                unique: false,
                options: { pattern: "" }
            });
            await pb.collections.update(collection.id, collection);
            console.log("Added PIN field.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
