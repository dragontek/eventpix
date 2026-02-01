import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        console.log("Authenticating as admin...");
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');

        console.log("Fetching 'events' collection...");
        const collection = await pb.collections.getOne('events');

        // Check if pin field exists
        const hasPin = collection.schema.some((field: any) => field.name === 'pin');

        if (hasPin) {
            console.log("PIN field already exists.");
        } else {
            console.log("Adding PIN field...");
            collection.schema.push({
                name: 'pin',
                type: 'text',
                required: false,
                presentable: false,
                unique: false,
                options: {
                    min: null,
                    max: null,
                    pattern: ""
                }
            });

            await pb.collections.update(collection.id, collection);
            console.log("Schema updated successfully: 'pin' field added.");
        }

    } catch (e) {
        console.error("Error updating schema:", e);
    }
}

main();
