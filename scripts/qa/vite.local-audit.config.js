import base from './vite.config.js';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
export default {
  ...base,
  cacheDir: 'node_modules/.vite-local-audit',
  resolve: { alias: { 'firebase/firestore': fileURLToPath(new URL('./firestore-local-audit.js', import.meta.url)) } },
  plugins: [...base.plugins, {
    name: 'local-audit-label',
    transformIndexHtml(html) { return html.replace('<title>', '<title>[LOCAL TEST] '); },
    configureServer(server) {
      server.middlewares.use('/__qa_result', (request, response) => {
        if (request.method !== 'POST') { response.statusCode = 405; response.end(); return; }
        let body = '';
        request.on('data', chunk => { body += chunk; });
        request.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (!['regression', 'regression-mobile'].includes(result.name)) throw Error('Unexpected report name');
            writeFileSync(fileURLToPath(new URL(`../../docs/qa/2026-11-13/${result.name}.json`, import.meta.url)), JSON.stringify(result, null, 2));
            response.end('saved');
          } catch { response.statusCode = 400; response.end('Invalid QA result'); }
        });
      });
    },
  }],
  server: { host: '127.0.0.1', port: 3113, strictPort: true, open: false },
};
