import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaConfigProd } from './config.pwa.mjs';

pwaConfigProd
const phasermsg = () => {
    return {
        name: 'phasermsg',
        buildStart() {
            process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {
            const line = "---------------------------------------------------------";
            const msg = `Finalizando detalles`;
            process.stdout.write(`${line}\n${msg}\n${line}\n`);
            
            process.stdout.write(`✨ Exportacion completa ✨\n`);
        }
    }
}   

export default defineConfig({
    base: './',
    logLevel: 'warn',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                passes: 2
            },
            mangle: true,
            format: {
                comments: false
            }
        }
    },
    plugins: [
        VitePWA(pwaConfigProd),
        phasermsg()
    ],
    server: {
        port: 8080
    }
});
