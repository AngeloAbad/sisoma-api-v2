import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router'))
            return 'vendor'
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3'))
            return 'charts'
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/xlsx'))
            return 'export-libs'
          if (id.includes('node_modules/@supabase'))
            return 'supabase'
        }
      }
    }
  },
  define: { global: 'globalThis' }
})
