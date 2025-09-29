import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaConfigDev } from './config.pwa.mjs';


export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    plugins: [
        VitePWA(pwaConfigDev)
    ],
    server: {
        port: 5678
    }
});
