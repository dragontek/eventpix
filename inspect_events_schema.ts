import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');
        const collection = await pb.collections.getOne('events');
        console.log("Collection 'events':", JSON.stringify(collection, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
