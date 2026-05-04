import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  server: {
    allowedHosts: [
      'pc.leopard-gila.ts.net',
      'smansa.m-tech.fun'
    ]
    
  }
})
