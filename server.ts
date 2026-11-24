import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const FLASK_PORT = Number(process.env.FLASK_PORT || 5000);
const FRONTEND_DIST = path.resolve(__dirname, 'frontend', 'dist');
const BACKEND_DIR = path.resolve(__dirname, 'backend');

function startFlaskBackendIfAvailable() {
  const venvPython = '/tmp/cmi_venv/bin/python3';
  const pythonBin = fs.existsSync(venvPython) ? venvPython : 'python3';
  const runPy = path.join(BACKEND_DIR, 'run.py');
  if (!fs.existsSync(runPy)) return;

  const child = spawn(pythonBin, [runPy], {
    cwd: BACKEND_DIR,
    env: {
      ...process.env,
      PORT: String(FLASK_PORT),
      FLASK_ENV: process.env.FLASK_ENV || 'development',
      DEMO_MODE: process.env.DEMO_MODE || 'true',
      FRONTEND_URL: `http://localhost:${PORT}`,
    },
    stdio: 'pipe',
  });

  child.stdout?.on('data', (d) => process.stdout.write(`[flask] ${d}`));
  child.stderr?.on('data', (d) => process.stderr.write(`[flask] ${d}`));
  child.on('error', (err) => console.warn('[server] Flask spawn skipped:', err.message));
}

startFlaskBackendIfAvailable();

const app = express();

// Reverse proxy /api/* to Flask backend
app.use('/api', (req, res) => {
  const targetPath = `/api${req.url}`;
  const proxyReq = http.request(
    {
      hostname: '127.0.0.1',
      port: FLASK_PORT,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${FLASK_PORT}`,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  proxyReq.on('error', () => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Flask backend is starting or unavailable.',
      });
    }
  });

  req.pipe(proxyReq, { end: true });
});

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.status(200).send('Frontend build not found. Run: npm run build');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cross-Modal Intelligence preview server listening on http://0.0.0.0:${PORT}`);
});
