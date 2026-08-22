import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Optional: proxy API calls through Vite dev server to avoid CORS in dev
      // '/auth': 'http://localhost:3001',
      // '/habits': 'http://localhost:3001',
    }
  }
})
