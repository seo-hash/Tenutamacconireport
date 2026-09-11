import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Middleware di solo sviluppo che esegue le funzioni serverless in api/*.js
// dentro il dev server di Vite, cosi' /api/* risponde con JSON reale anche
// senza `vercel dev`. Inoltra header/cookie reali cosi' che login/session
// basati su cookie funzionino anche in `npm run dev`.
const API_ROUTES = ['/api/ga4', '/api/login', '/api/session', '/api/logout'];

function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.method !== 'POST' && req.method !== 'PUT') {
      resolve(undefined);
      return;
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(undefined);
      }
    });
  });
}

function localApiPlugin(env) {
  return {
    name: 'local-api-handlers',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const route = API_ROUTES.find((r) => req.url?.startsWith(r));
        if (!route) return next();

        Object.assign(process.env, env);

        const url = new URL(req.url, 'http://localhost');
        const query = Object.fromEntries(url.searchParams.entries());
        const body = await readJsonBody(req);

        try {
          const mod = await server.ssrLoadModule(`${route}.js`);
          await mod.default(
            { query, headers: req.headers, method: req.method, body },
            {
              setHeader: (name, value) => res.setHeader(name, value),
              status(code) {
                res.statusCode = code;
                return this;
              },
              json(body) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(body));
              },
            }
          );
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Errore middleware locale: ${err.message}` }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), localApiPlugin(env)],
  };
})
