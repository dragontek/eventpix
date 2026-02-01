import PocketBase from 'pocketbase';
import fs from 'fs';

const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);

async function main() {
    try {
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');
        const collection = await pb.collections.getOne('events');

        const result = {
            fields: collection.schema.map((f: any) => f.name),
            hasPin: collection.schema.some((f: any) => f.name === 'pin')
        };

        fs.writeFileSync('schema_result.json', JSON.stringify(result, null, 2));
    } catch (e) {
        fs.writeFileSync('schema_result.json', JSON.stringify({ error: e.toString() }, null, 2));
    }
}

main();
