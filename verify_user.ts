import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');
        const user = await pb.collection('users').getFirstListItem('email="host@eventpix.io"');
        console.log("Verified User:", user.email, user.id);
    } catch (e) {
        console.error("User verification failed:", e);
        process.exit(1);
    }
}

main();
