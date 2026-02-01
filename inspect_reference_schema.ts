import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');
        const col = await pb.collections.getOne('users');
        const created = col.fields.find((f: any) => f.name === 'created');
        const updated = col.fields.find((f: any) => f.name === 'updated');

        console.log("Users Created Field:", JSON.stringify(created, null, 2));
        console.log("Users Updated Field:", JSON.stringify(updated, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
