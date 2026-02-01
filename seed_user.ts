import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        // Authenticate as superuser to create a regular user
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');

        const email = 'host@eventpix.io';
        const password = 'password123';

        try {
            // Check if exists
            const existing = await pb.collection('users').getFirstListItem(`email="${email}"`);
            console.log(`User ${email} already exists (ID: ${existing.id})`);

            // Update password just in case
            await pb.collection('users').update(existing.id, {
                password: password,
                passwordConfirm: password,
            });
            console.log("Updated password.");

        } catch (e) {
            // Create
            console.log(`Creating user ${email}...`);
            const user = await pb.collection('users').create({
                email: email,
                password: password,
                passwordConfirm: password,
                name: "Demo Host",
            });
            console.log(`Created user (ID: ${user.id})`);
        }

    } catch (e: any) {
        console.error("Error:", e.originalError || e);
        process.exit(1);
    }
}

main();
