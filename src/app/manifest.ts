import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'FUDEX',
        short_name: 'FUDEX',
        description: 'Food at Your Door in Minutes',
        start_url: '/',
        display: 'standalone',
        background_color: '#D63C12',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/icons/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}