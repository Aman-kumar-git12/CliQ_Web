import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react-dom') || id.includes('react-router-dom')) {
                            return 'vendor-react';
                        }
                        if (id.includes('lucide-react') || id.includes('react-icons')) {
                            return 'vendor-icons';
                        }
                        if (id.includes('framer-motion')) {
                            return 'vendor-animation';
                        }
                        if (id.includes('emoji-picker-react')) {
                            return 'vendor-emoji';
                        }
                        if (id.includes('react-markdown')) {
                            return 'vendor-markdown';
                        }
                        return 'vendor';
                    }
                }
            }
        }
    }
})
