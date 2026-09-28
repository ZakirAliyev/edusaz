import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // The admin panel is lazy-loaded; pre-bundle its deps up front so Vite doesn't re-optimize
  // mid-session (which loads a second copy of React and breaks hooks in dev).
  optimizeDeps: {
    include: ['lucide-react', 'sonner', 'radix-ui', 'class-variance-authority', 'clsx', 'tailwind-merge'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
})
