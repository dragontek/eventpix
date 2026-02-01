import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');

        const collection = await pb.collections.getOne('events');

        // Check if owner already exists
        if (collection.fields.find((f: any) => f.name === 'owner')) {
            console.log("Owner field already exists.");
            return;
        }

        // Add owner field (Relation to users)
        collection.fields.push({
            name: 'owner',
            type: 'relation',
            required: false,
            presentable: false,
            system: false,
            collectionId: 'pbc_3142612865', // Need to find users collection ID dynamically or assume?
            // Actually, let's find it.
            cascadeDelete: false,
            maxSelect: 1,
            minSelect: 0,
            displayFields: []
        });

        // We need the users collection ID.
        // Let's get it first to be safe.
        const usersCollection = await pb.collections.getOne('users');
        const ownerField = collection.fields.find((f: any) => f.name === 'owner');
        if (ownerField) {
            ownerField.collectionId = usersCollection.id;
        }

        await pb.collections.update(collection.id, collection);
        console.log("Successfully added 'owner' field to 'events' collection.");

    } catch (e) {
        console.error("Failed to update schema:", e);
    }
}

main();
