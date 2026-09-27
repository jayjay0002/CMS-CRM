import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // FSD layers are imported via @/ (e.g. @/entities/package).
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // Forward API calls to FastAPI in dev so the browser sees a single origin.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
