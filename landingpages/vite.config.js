import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
      'pc.leopard-gila.ts.net',
      'smansa.m-tech.fun',
      'dashboard.smansa.m-tech.fun',
      'api.smansa.m-tech.fun',
      'api.smansa-m-tech.fun',
      '.m-tech.fun'
    ]
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {}
  }
})
