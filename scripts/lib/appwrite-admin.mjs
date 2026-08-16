/**
 * Minimal Appwrite admin client built on the REST API.
 *
 * The `appwrite` web SDK (v18+) only exposes client-side services, so
 * server-side operations (databases, collections, attributes, indexes,
 * buckets, users, sites) are performed with plain HTTP calls using an
 * API key.
 */

export function appwriteConfig() {
    const endpoint = (process.env.APPWRITE_ENDPOINT || 'http://localhost/v1').replace(/\/+$/, '');
    const projectId = process.env.APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;
    const databaseId = process.env.APPWRITE_DATABASE_ID || 'eventpix';
    const bucketId = process.env.APPWRITE_BUCKET_ID || 'photos';

    if (!projectId || !apiKey) {
        throw new Error(
            'APPWRITE_PROJECT_ID and APPWRITE_API_KEY must be set. ' +
            'See docs/DATABASE.md for instructions.'
        );
    }

    return { endpoint, projectId, apiKey, databaseId, bucketId };
}

/**
 * Permission strings applied to every client-created document/file:
 * anyone can read, any signed-in user can write.
 */
export function defaultPermissions() {
    return ['read("any")', 'write("users")'];
}

export class AppwriteAdmin {
    constructor(config = {}) {
        const cfg = config.endpoint ? config : appwriteConfig();
        this.endpoint = cfg.endpoint;
        this.projectId = cfg.projectId;
        this.apiKey = cfg.apiKey;
        this.databaseId = cfg.databaseId;
        this.bucketId = cfg.bucketId;
    }

    async request(method, path, { body, formData, headers = {} } = {}) {
        const url = `${this.endpoint}${path}`;
        const reqHeaders = {
            'X-Appwrite-Project': this.projectId,
            'X-Appwrite-Key': this.apiKey,
            'X-Appwrite-Response-Format': '1.9.0',
            ...headers,
        };

        const options = { method, headers: reqHeaders };
        if (formData !== undefined) {
            options.body = formData;
        } else if (body !== undefined) {
            reqHeaders['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const text = await response.text();
        let data = null;
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }
        }

        return { status: response.status, data };
    }

    /** Returns true when the request succeeded or the resource already exists. */
    isOkOrExists(status) {
        return status >= 200 && status < 300 || status === 409;
    }

    async createDatabase(databaseId) {
        const { status, data } = await this.request('POST', '/databases', {
            body: { databaseId, name: databaseId, enabled: true },
        });
        if (status === 409) {
            return { created: false };
        }
        if (status >= 300) {
            throw new Error(`Failed to create database: ${JSON.stringify(data)}`);
        }
        return { created: true };
    }

    async createCollection(collectionId, name, permissions) {
        const { status, data } = await this.request(
            'POST',
            `/databases/${this.databaseId}/collections`,
            {
                body: {
                    collectionId,
                    name,
                    permissions,
                    documentSecurity: true,
                    enabled: true,
                },
            }
        );
        if (status === 409) {
            return { created: false };
        }
        if (status >= 300) {
            throw new Error(`Failed to create collection ${collectionId}: ${JSON.stringify(data)}`);
        }
        return { created: true };
    }

    async getCollection(collectionId) {
        const { status, data } = await this.request(
            'GET',
            `/databases/${this.databaseId}/collections/${collectionId}`
        );
        if (status === 404) {
            return null;
        }
        if (status >= 300) {
            throw new Error(`Failed to fetch collection ${collectionId}: ${JSON.stringify(data)}`);
        }
        return data;
    }

    async createAttribute(collectionId, attr) {
        const typePath = { string: 'string', integer: 'integer', boolean: 'boolean', datetime: 'datetime', enum: 'enum' }[attr.type];
        if (!typePath) {
            throw new Error(`Unsupported attribute type: ${attr.type}`);
        }
        const path = `/databases/${this.databaseId}/collections/${collectionId}/attributes/${typePath}`;
        const body = {
            key: attr.key,
            required: !!attr.required,
            array: !!attr.array,
        };
        if (attr.size !== undefined) body.size = attr.size;
        if (attr.default !== undefined) body.default = attr.default;
        if (attr.min !== undefined) body.min = attr.min;
        if (attr.max !== undefined) body.max = attr.max;
        if (attr.elements) body.elements = attr.elements;

        const { status, data } = await this.request('POST', path, { body });
        if (status === 409) {
            return { created: false };
        }
        if (status >= 300) {
            throw new Error(
                `Failed to create attribute ${collectionId}.${attr.key}: ${JSON.stringify(data)}`
            );
        }
        return { created: true };
    }

    async waitForAttributes(collectionId, keys, timeoutMs = 60000) {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            const collection = await this.getCollection(collectionId);
            const existing = new Set((collection?.attributes || []).map((a) => a.key));
            if (keys.every((key) => existing.has(key))) {
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 750));
        }
        throw new Error(`Timed out waiting for attributes in ${collectionId}`);
    }

    async createIndex(collectionId, index) {
        const body = {
            key: index.key,
            type: index.type,
            attributes: index.attributes,
            orders: index.orders || index.attributes.map(() => 'ASC'),
        };
        const { status, data } = await this.request(
            'POST',
            `/databases/${this.databaseId}/collections/${collectionId}/indexes`,
            { body }
        );
        if (status === 409) {
            return { created: false };
        }
        if (status >= 300) {
            throw new Error(
                `Failed to create index ${collectionId}.${index.key}: ${JSON.stringify(data)}`
            );
        }
        return { created: true };
    }

    async createBucket(bucketId, name, permissions, { maxSize = 50 * 1024 * 1024, allowedExtensions = [] } = {}) {
        const { status, data } = await this.request('POST', '/storage/buckets', {
            body: {
                bucketId,
                name,
                permissions,
                fileSecurity: true,
                enabled: true,
                maximumFileSize: maxSize,
                allowedExtensions,
                compression: 'none',
                encryption: true,
            },
        });
        if (status === 409) {
            return { created: false };
        }
        if (status >= 300) {
            throw new Error(`Failed to create bucket ${bucketId}: ${JSON.stringify(data)}`);
        }
        return { created: true };
    }

    async getBucket(bucketId) {
        const { status, data } = await this.request('GET', `/storage/buckets/${bucketId}`);
        if (status === 404) {
            return null;
        }
        if (status >= 300) {
            throw new Error(`Failed to fetch bucket ${bucketId}: ${JSON.stringify(data)}`);
        }
        return data;
    }

    async createUser(userId, email, password, name) {
        const body = {};
        if (userId) body.userId = userId;
        if (email) body.email = email;
        if (password) body.password = password;
        if (name) body.name = name;
        const { status, data } = await this.request('POST', '/users', { body });
        if (status === 409) {
            return { created: false };
        }
        if (status >= 300) {
            throw new Error(`Failed to create user ${userId}: ${JSON.stringify(data)}`);
        }
        return { created: true };
    }

    async getUser(userId) {
        const { status, data } = await this.request('GET', `/users/${userId}`);
        if (status === 404) {
            return null;
        }
        if (status >= 300) {
            throw new Error(`Failed to fetch user ${userId}: ${JSON.stringify(data)}`);
        }
        return data;
    }

    async createDocument(collectionId, documentId, data, permissions) {
        const body = { data: { ...data }, permissions };
        if (documentId) body.documentId = documentId;
        const { status, data: res } = await this.request(
            'POST',
            `/databases/${this.databaseId}/collections/${collectionId}/documents`,
            { body }
        );
        if (status === 409) {
            return { created: false };
        }
        if (status >= 300) {
            throw new Error(`Failed to create document in ${collectionId}: ${JSON.stringify(res)}`);
        }
        return { created: true, document: res };
    }

    async getDocument(collectionId, documentId) {
        const { status, data } = await this.request(
            'GET',
            `/databases/${this.databaseId}/collections/${collectionId}/documents/${documentId}`
        );
        if (status === 404) {
            return null;
        }
        if (status >= 300) {
            throw new Error(`Failed to fetch document ${collectionId}/${documentId}: ${JSON.stringify(data)}`);
        }
        return data;
    }

    /**
     * Upload a file. `fileData` can be a Buffer or ArrayBuffer; `fileName`
     * and `mimeType` are required when a Buffer is supplied.
     */
    async uploadFile(bucketId, fileId, fileData, fileName, mimeType, permissions) {
        const formData = new FormData();
        const blob = fileData instanceof Blob
            ? fileData
            : new Blob([fileData], { type: mimeType || 'application/octet-stream' });
        formData.append('fileId', fileId);
        formData.append('file', blob, fileName || 'upload.bin');
        for (const permission of permissions || []) {
            formData.append('permissions[]', permission);
        }

        const { status, data } = await this.request('POST', `/storage/buckets/${bucketId}/files`, {
            formData,
        });
        if (status >= 300) {
            throw new Error(`Failed to upload file ${fileId}: ${JSON.stringify(data)}`);
        }
        return data;
    }

    async deleteFile(bucketId, fileId) {
        await this.request('DELETE', `/storage/buckets/${bucketId}/files/${fileId}`);
    }
}
