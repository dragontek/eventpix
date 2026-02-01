import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'EventPix AI',
        short_name: 'EventPix',
        description: 'AI-powered event photo sharing',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/globe.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    }
}
