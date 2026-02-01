import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('admin@eventpix.io', 'eventpix123');

        const targets = ['events', 'photos', 'orgs', 'memberships', 'moderation_queue'];

        for (const name of targets) {
            try {
                const col = await pb.collections.getOne(name);
                let changed = false;

                if (!col.fields.find((f: any) => f.name === 'created')) {
                    console.log(`Adding 'created' to ${name}...`);
                    col.fields.push({
                        name: "created",
                        type: "autodate",
                        onCreate: true,
                        onUpdate: false,
                        system: false,
                        hidden: false,
                        presentable: false
                    });
                    changed = true;
                }

                if (!col.fields.find((f: any) => f.name === 'updated')) {
                    console.log(`Adding 'updated' to ${name}...`);
                    col.fields.push({
                        name: "updated",
                        type: "autodate",
                        onCreate: true,
                        onUpdate: true,
                        system: false,
                        hidden: false,
                        presentable: false
                    });
                    changed = true;
                }

                if (changed) {
                    await pb.collections.update(col.id, col);
                    console.log(`Updated ${name} successfully.`);
                } else {
                    console.log(`${name} already has timestamps.`);
                }

            } catch (err: any) {
                console.error(`Failed to update ${name}:`, err.message);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

main();
