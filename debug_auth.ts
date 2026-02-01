import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');

        console.log("--- Collection: users ---");
        const collection = await pb.collections.getOne('users');
        console.log("Auth Options:", collection.options); // Check if email/pass is allowed

        console.log("--- Users ---");
        const users = await pb.collection('users').getFullList();
        users.forEach(u => {
            console.log(`- ${u.email} (verified: ${u.verified})`);
        });

        // Try direct auth simulation
        console.log("--- Auth Check ---");
        try {
            await pb.collection('users').authWithPassword('host@eventpix.io', 'password123');
            console.log("SUCCESS: 'host@eventpix.io' can log in via script.");
        } catch (e: any) {
            console.log("FAILURE: Script login failed:", e.response?.message || e.message);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
