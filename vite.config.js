import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk for react and react-dom
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor'
            }
            // MUI chunk
            if (id.includes('@mui/material') || id.includes('@mui/icons-material')) {
              return 'mui'
            }
            // Everything else from node_modules
            return 'vendor'
          }
        }
      }
    }
  }
})