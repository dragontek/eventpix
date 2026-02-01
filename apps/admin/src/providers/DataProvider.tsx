import React, { createContext, useContext, ReactNode } from 'react';
import type { DataProvider } from './types';
import { PocketBaseProvider } from './pocketbase';

// Default implementation
const defaultProvider = new PocketBaseProvider();

const DataContext = createContext<DataProvider>(defaultProvider);

export function DataProviderWrapper({ children, provider = defaultProvider }: { children: ReactNode, provider?: DataProvider }) {
    return (
        <DataContext.Provider value={provider}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);
