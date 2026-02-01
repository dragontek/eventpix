import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        // Auth as admin first to create a test user or just assume a user exists?
        // Let's use admin to inspect.
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');

        // Create a dummy user
        const email = `test_host_${Math.random()}@example.com`;
        const user = await pb.collection('users').create({
            email,
            password: 'password123',
            passwordConfirm: 'password123',
            name: 'Test Host'
        });

        // Auth as that user
        await pb.collection('users').authWithPassword(email, 'password123');

        console.log("Authenticated as:", pb.authStore.model?.id);

        // Test 1: No Filter
        try {
            console.log("Test 1: No Filter");
            const r1 = await pb.collection('events').getList(1, 1);
            console.log("Success No Filter:", r1.items.length);
            if (r1.items.length > 0) console.log("Sample Item:", JSON.stringify(r1.items[0], null, 2));
        } catch (e: any) { console.error("Fail No Filter:", e.status); }

        // Test 2: Filter by owner simple
        try {
            console.log("Test 2: Filter owner='id'");
            const r2 = await pb.collection('events').getList(1, 1, { filter: `owner = "${pb.authStore.model?.id}"` });
            console.log("Success Owner:", r2.items.length);
        } catch (e: any) { console.error("Fail Owner:", e.status, e.message); }

        // Test 3: Filter by owner.id
        try {
            console.log("Test 3: Filter owner.id='id'");
            const r3 = await pb.collection('events').getList(1, 1, { filter: `owner.id = "${pb.authStore.model?.id}"` });
            console.log("Success Owner.id:", r3.items.length);
        } catch (e: any) { console.error("Fail Owner.id:", e.status, e.message); }

        // Test 4: Filter owner + Sort
        try {
            console.log("Test 4: Filter owner + Sort");
            const r4 = await pb.collection('events').getList(1, 1, {
                filter: `owner = "${pb.authStore.model?.id}"`,
                sort: '-created'
            });
            console.log("Success Sort:", r4.items.length);
        } catch (e: any) { console.error("Fail Sort:", e.status, e.message); }

    } catch (e) {
        console.error(e);
    }
}

main();
