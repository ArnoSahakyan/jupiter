import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      // use Sass's modern API (the legacy one is deprecated)
      scss: { api: 'modern-compiler' },
    },
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
})
