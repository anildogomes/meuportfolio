// Build de producao para o GitHub Pages.
// Define BASE_PATH=/meuportfolio/ (site de projeto) e chama o vite build.
// Funciona igual no Windows (cmd) e no Linux (GitHub Actions).
import { spawnSync } from 'node:child_process';

const basePath = process.env.BASE_PATH || '/meuportfolio/';

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vite', 'build'],
  {
    stdio: 'inherit',
    env: { ...process.env, BASE_PATH: basePath },
    shell: process.platform === 'win32',
  }
);

process.exit(result.status ?? 1);
