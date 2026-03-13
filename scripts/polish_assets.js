import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'images');

const assets = {
  'plants/sunflower.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Stem -->
  <rect x="28" y="32" width="8" height="32" fill="#15803d" />
  <!-- Petals -->
  <circle cx="32" cy="32" r="24" fill="#fde047" stroke="#ca8a04" stroke-width="2" />
  <circle cx="32" cy="32" r="18" fill="#facc15" />
  <!-- Face -->
  <circle cx="32" cy="32" r="12" fill="#78350f" />
  <circle cx="28" cy="28" r="2" fill="#fff" />
  <circle cx="36" cy="28" r="2" fill="#fff" />
  <path d="M26 36 Q32 42 38 36" stroke="#fff" stroke-width="2" fill="none" />
</svg>`,
  'plants/peashooter.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="28" y="32" width="8" height="32" fill="#15803d" />
  <path d="M32 24 C45 24 55 10 55 24 C55 38 45 40 32 40 C19 40 10 38 10 24 C10 10 19 24 32 24" fill="#4ade80" stroke="#166534" stroke-width="2" />
  <circle cx="25" cy="24" r="3" fill="#000" />
  <circle cx="50" cy="24" r="6" fill="#064e3b" />
</svg>`,
  'plants/wallnut.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="36" rx="22" ry="28" fill="#92400e" stroke="#451a03" stroke-width="2" />
  <ellipse cx="30" cy="34" rx="18" ry="24" fill="#b45309" />
  <circle cx="24" cy="25" r="4" fill="#fff" />
  <circle cx="40" cy="25" r="4" fill="#fff" />
  <circle cx="24" cy="25" r="2" fill="#000" />
  <circle cx="40" cy="25" r="2" fill="#000" />
</svg>`,
  'plants/cherry_bomb.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="40" r="18" fill="#ef4444" stroke="#991b1b" stroke-width="2" />
  <circle cx="44" cy="40" r="18" fill="#ef4444" stroke="#991b1b" stroke-width="2" />
  <path d="M32 10 Q20 20 20 32" stroke="#15803d" stroke-width="4" fill="none" />
  <path d="M32 10 Q44 20 44 32" stroke="#15803d" stroke-width="4" fill="none" />
  <circle cx="15" cy="35" r="2" fill="#000" />
  <circle cx="25" cy="35" r="2" fill="#000" />
</svg>`,
  'ui/sun.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sun-grad">
      <stop offset="0%" stop-color="#fff7ed" />
      <stop offset="100%" stop-color="#fbbf24" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="20" fill="url(#sun-grad)" stroke="#d97706" stroke-width="2" />
  <g opacity="0.8">
    <rect x="30" y="4" width="4" height="12" rx="2" fill="#fbbf24" />
    <rect x="30" y="48" width="4" height="12" rx="2" fill="#fbbf24" />
    <rect x="4" y="30" width="12" height="4" rx="2" fill="#fbbf24" />
    <rect x="48" y="30" width="12" height="4" rx="2" fill="#fbbf24" />
  </g>
</svg>`
};

async function generate() {
  for (const [relPath, content] of Object.entries(assets)) {
    const fullPath = path.join(PUBLIC_DIR, relPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content.trim());
    console.log('Polished:', relPath);
  }
}

generate().catch(console.error);
