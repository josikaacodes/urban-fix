import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/auth': 'http://127.0.0.1:8000',
      '/reports': 'http://127.0.0.1:8000',
      '/incidents': 'http://127.0.0.1:8000',
      '/workers': 'http://127.0.0.1:8000',
      '/departments': 'http://127.0.0.1:8000',
      '/analytics': 'http://127.0.0.1:8000',
      '/notifications': 'http://127.0.0.1:8000',
      '/upload': 'http://127.0.0.1:8000',
      '/uploads': 'http://127.0.0.1:8000',
    },
  },
})
