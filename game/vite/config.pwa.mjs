export const pwaConfig = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    name: 'Ultra laboratios',
    short_name: 'UltraLaboratorios',
    description: 'Farmacias del ahorro 2025',
    theme_color: '#ffffff',
    background_color: '#000000',
    display: 'fullscreen',
    orientation: 'potrait',
    icons: [
      {
        src: 'icons/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'icons/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
}

export const pwaConfigProd = {
  ...pwaConfig,
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf,json}'],
    runtimeCaching: [
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30
          }
        }
      }
    ]
  }
}

export const pwaConfigDev = {
  ...pwaConfig,
  devOptions: {
    enabled: true,
    type: 'module'
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html}']
  },
  manifest: {
    ...pwaConfig.manifest,
    name: 'Ultralaboratorios | Farmacias del ahorro 2025',
    short_name: 'Ultralaboratorios'
  }
}
