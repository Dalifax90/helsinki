import { defineConfig } from "vite";

export default defineConfig({
    base: './',
    server: { host: '127.0.0.1', strictPort: true },
    preview: { port: 4173, strictPort: true },
    build: {
        assetsInlineLimit: 0,
        sourcemap: true,
    }
});
