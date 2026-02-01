
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        const methods = await pb.collection('users').listAuthMethods();
        console.log("Auth Methods:", JSON.stringify(methods, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

main();
