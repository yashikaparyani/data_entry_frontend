import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: mode === 'production' 
          ? 'https://data-entry-backend-pkeo.onrender.com'
          : 'http://localhost:5000',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  define: {
    __API_URL__: JSON.stringify(
      mode === 'production' 
        ? 'https://data-entry-backend-pkeo.onrender.com'
        : 'http://localhost:5000'
    )
  }
}))
