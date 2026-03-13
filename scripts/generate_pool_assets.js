import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'images');

const assets = {
  'plants/lilypad.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Leaf -->
  <ellipse cx="32" cy="35" rx="28" ry="20" fill="#16a34a" stroke="#14532d" stroke-width="2" />
  <!-- Cutout -->
  <path d="M32 35 L60 25 A 28 20 0 0 0 45 18 Z" fill="#0369a1" opacity="0.3" />
  <!-- Veins -->
  <path d="M32 35 L32 15 M32 35 L10 25 M32 35 L54 25" stroke="#14532d" stroke-width="1" opacity="0.5" />
</svg>`,
  'backgrounds/pool.svg': `
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grass-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="#4ade80" />
      <rect x="0" y="0" width="50" height="50" fill="#22c55e" opacity="0.2" />
      <rect x="50" y="50" width="50" height="50" fill="#22c55e" opacity="0.2" />
    </pattern>
    <pattern id="water-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="#0ea5e9" />
      <path d="M0 50 Q 25 40 50 50 T 100 50" stroke="#bae6fd" fill="none" opacity="0.4" />
      <path d="M0 80 Q 25 70 50 80 T 100 80" stroke="#bae6fd" fill="none" opacity="0.2" />
    </pattern>
  </defs>
  <!-- Grass Rows 0, 1 -->
  <rect x="0" y="0" width="800" height="200" fill="url(#grass-pattern)" />
  <!-- Water Rows 2, 3 -->
  <rect x="0" y="200" width="800" height="200" fill="url(#water-pattern)" />
  <!-- Grass Rows 4, 5 -->
  <rect x="0" y="400" width="800" height="200" fill="url(#grass-pattern)" />
  
  <!-- Grid Lines Overlay -->
  <rect x="0" y="0" width="800" height="600" fill="none" stroke="#000" stroke-width="1" opacity="0.1" />
</svg>`
};

async function generate() {
  for (const [relPath, content] of Object.entries(assets)) {
    const fullPath = path.join(IMAGES_DIR, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim());
    console.log('Created:', relPath);
  }
}

generate().catch(console.error);
