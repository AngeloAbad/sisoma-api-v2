import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 400000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react','react-dom','react-router-dom'],
          charts:   ['recharts'],
          supabase: ['@supabase/supabase-js'],
          export:   ['jspdf','jspdf-autotable','xlsx'],
        }
      }
    }
  },
  define: { global: 'globalThis' }
})
