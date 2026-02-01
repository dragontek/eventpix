import PocketBase from 'pocketbase';

// Disable auto-cancellation to prevent abort errors if script is slow
const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);

async function main() {
    try {
        console.log("Authenticating...");
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');

        console.log("Fetching collection 'events'...");
        const collection = await pb.collections.getOne('events');

        console.log("--- Collection: events ---");
        console.log("List Rule:", collection.listRule);
        console.log("View Rule:", collection.viewRule);

        console.log("--- Fields ---");
        collection.schema.forEach((f: any) => {
            console.log(`- ${f.name} (${f.type})`);
        });

        // Check specifically for pin
        const pinField = collection.schema.find((f: any) => f.name === 'pin');
        if (!pinField) {
            console.error("CRITICAL: 'pin' field is MISSING!");
        } else {
            console.log("SUCCESS: 'pin' field exists.");
        }

    } catch (e) {
        console.error("Error fetching schema:", e);
    }
}

main();
