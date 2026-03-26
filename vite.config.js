import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 5173,
    open: true,
    host: true, // Allows access from network (useful for testing on mobile)
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Use esbuild instead of terser (built-in, faster, no extra dependency)
    minify: 'esbuild',
    // Increase chunk size warning limit (optional)
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Better code splitting for optimal loading
        manualChunks(id) {
          // Group all node_modules into vendor chunks based on library
          if (id.includes('node_modules')) {
            // React core and routing
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            // Material-UI and emotion
            if (id.includes('@mui') || id.includes('@emotion') || id.includes('@stylis')) {
              return 'mui-vendor'
            }
            // Map libraries
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'map-vendor'
            }
            // Swiper and animations
            if (id.includes('swiper') || id.includes('framer-motion')) {
              return 'animation-vendor'
            }
            // All other node_modules
            return 'vendor'
          }
        },
        // Optimize chunk naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash].[ext]`
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash].[ext]`
          }
          return `assets/[name]-[hash].[ext]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Optimize for production
    target: 'es2020',
    // Reduce console logs in production
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@assets': '/src/assets',
      '@styles': '/src/styles',
      '@utils': '/src/utils',
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
      'swiper',
      'leaflet',
      'react-leaflet',
    ],
    // Exclude large dependencies that don't need pre-bundling
    exclude: [],
  },
  
  // Preview settings (for production testing)
  preview: {
    port: 4173,
    open: true,
  },
})