import type { DataProvider } from './types';
import { AppwriteProvider, type AppwriteConfig } from './providers/appwrite';

export * from './types';
export { AppwriteProvider, type AppwriteConfig } from './providers/appwrite';

export interface DbConfig {
    provider: 'appwrite';
    appwrite?: Partial<AppwriteConfig>;
}

function getConfig(): DbConfig {
    return {
        provider: 'appwrite',
    };
}

let providerInstance: DataProvider | undefined;

export function getDbProvider(config?: DbConfig): DataProvider {
    if (providerInstance) {
        return providerInstance;
    }

    const cfg = config || getConfig();
    providerInstance = new AppwriteProvider(cfg.appwrite);

    return providerInstance;
}

export function createDbProvider(config: DbConfig): DataProvider {
    return new AppwriteProvider(config.appwrite);
}

export const db = getDbProvider();
