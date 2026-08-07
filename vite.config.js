import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Middleware di solo sviluppo che esegue le funzioni serverless in api/*.js
// dentro il dev server di Vite, cosi' /api/ga4 risponde con JSON reale anche
// senza `vercel dev`.
function localApiPlugin(env) {
  return {
    name: 'local-api-handlers',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/ga4')) return next();

        Object.assign(process.env, env);

        const url = new URL(req.url, 'http://localhost');
        const query = Object.fromEntries(url.searchParams.entries());

        try {
          const mod = await server.ssrLoadModule('/api/ga4.js');
          await mod.default(
            { query },
            {
              setHeader: () => {},
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
