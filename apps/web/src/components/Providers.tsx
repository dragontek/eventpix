'use client';

import { SnackbarProvider } from 'notistack';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        defineCustomElements(window);
    }, []);

    return (
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            {children}
        </SnackbarProvider>
    );
}
