import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // Em producao o site e servido em https://<user>.github.io/<repo>/
  // BASE_PATH e definido no workflow do GitHub Pages (ver .github/workflows/deploy.yml)
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
