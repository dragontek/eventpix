import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');
        const collection = await pb.collections.getOne('events');

        // Explicitly allow logged in users to list events (we rely on filter to narrow it down)
        // OR allow public for guests too?
        // Let's allow ANYONE for now to debug, then narrow it.
        // Actually, guests need to list events by Code too.
        // So default should be Public ("")?
        // Wait, if "" was working for guests, why does it fail for hosts with filter?

        // Let's try explicitly setting it to a rule that returns true for debugging.
        // Or explicitly: "owner = @request.auth.id || code != ''" (naive)

        // Let's set it to "@request.auth.id != ''" temporarily to see if it unblocks hosts.
        // But this effectively blocks anonymous guests...
        // Let's set it to valid SQL-like rule: "id != ''" (Always true)

        collection.listRule = "id != ''"; // Effectively Public
        collection.viewRule = "id != ''";

        await pb.collections.update(collection.id, collection);
        console.log("Updated 'events' listRule to 'id != \"\"' (Public)");
    } catch (e) {
        console.error(e);
    }
}

main();
