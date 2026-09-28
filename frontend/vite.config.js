import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    watch: {
      ignored: ['**/dist/**', '**/*.mp4', '**/*.webm']
    },
    proxy: {
      // Proxy original medical chatbot app directly under http://localhost:5173/chatbot
      '/chatbot': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      },
      // Proxy jQuery AJAX chat submission from original medical app to backend
      '/get': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      // Proxy JSON chat API to backend
      '/api/chat': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      // Proxy general backend API to Flask
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      // Proxy chatbot static assets (style.css, etc.)
      '/static': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  }
})
