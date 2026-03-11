import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import istanbul from 'vite-plugin-istanbul'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'tests/'],
      extension: ['.js', '.jsx'],
      requireEnv: true, // Only instrument if VITE_COVERAGE is true
    }),
  ],
  server: {
    port: 9002,
    strictPort: true
  }
})
