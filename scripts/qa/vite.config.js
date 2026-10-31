import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Isolated QA only: no production Firebase config or network writes.
export default defineConfig({
  optimizeDeps: { entries: ['scripts/qa/index.html'] },
  plugins: [react(), {
    name: 'isolated-firestore',
    enforce: 'pre',
    load(id) {
      if (id.replaceAll('\\', '/').endsWith('/src/lib/firebase.js')) return 'export const db = {};';
    },
  }],
  resolve: { alias: { 'firebase/firestore': fileURLToPath(new URL('./firestore-mock.js', import.meta.url)) } },
  server: { host: '127.0.0.1', port: 3107, strictPort: true, open: false },
});
