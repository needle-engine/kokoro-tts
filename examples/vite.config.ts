import { defineConfig } from 'vite'
export default defineConfig({

    base: "kokoro-tts",
    build: {
        emptyOutDir: true,
    },
    worker: {
        format: "es",
    }
})