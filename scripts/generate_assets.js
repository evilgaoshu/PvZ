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
  <path d="M32 4 L38 20 L32 24 L26 20 Z" fill="#fde047" />
  <path d="M32 60 L38 44 L32 40 L26 44 Z" fill="#fde047" />
  <path d="M4 32 L20 26 L24 32 L20 38 Z" fill="#fde047" />
  <path d="M60 32 L44 26 L40 32 L44 38 Z" fill="#fde047" />
  <path d="M12 12 L24 20 L28 28 L16 24 Z" fill="#fde047" />
  <path d="M52 52 L40 44 L36 36 L48 40 Z" fill="#fde047" />
  <path d="M52 12 L40 20 L36 28 L48 24 Z" fill="#fde047" />
  <path d="M12 52 L24 44 L28 36 L16 40 Z" fill="#fde047" />
  <!-- Face -->
  <circle cx="32" cy="32" r="14" fill="#78350f" />
  <circle cx="28" cy="28" r="2" fill="#000000" />
  <circle cx="36" cy="28" r="2" fill="#000000" />
  <path d="M26 36 Q32 42 38 36" stroke="#000000" stroke-width="2" fill="none" />
</svg>`,
  'plants/peashooter.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Stem -->
  <rect x="28" y="32" width="8" height="32" fill="#15803d" />
  <!-- Leaf -->
  <path d="M32 40 C10 40 10 60 32 60" fill="#166534" />
  <!-- Head -->
  <circle cx="32" cy="24" r="16" fill="#4ade80" />
  <!-- Snout -->
  <rect x="36" y="16" width="24" height="16" rx="4" fill="#4ade80" />
  <!-- Hole -->
  <ellipse cx="60" cy="24" rx="4" ry="6" fill="#064e3b" />
  <!-- Eyes -->
  <circle cx="36" cy="18" r="3" fill="#000000" />
  <circle cx="38" cy="17" r="1" fill="#ffffff" />
</svg>`,
  'plants/wallnut.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Body -->
  <ellipse cx="32" cy="36" rx="20" ry="26" fill="#92400e" />
  <ellipse cx="30" cy="34" rx="18" ry="24" fill="#b45309" />
  <!-- Eyes -->
  <circle cx="24" cy="30" r="4" fill="#ffffff" />
  <circle cx="40" cy="30" r="4" fill="#ffffff" />
  <circle cx="24" cy="30" r="2" fill="#000000" />
  <circle cx="40" cy="30" r="2" fill="#000000" />
  <!-- Mouth -->
  <path d="M26 44 Q32 48 38 44" stroke="#451a03" stroke-width="2" fill="none" />
</svg>`,
  'plants/cherry_bomb.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Stem -->
  <path d="M32 10 Q20 20 20 32" stroke="#15803d" stroke-width="4" fill="none" />
  <path d="M32 10 Q44 20 44 32" stroke="#15803d" stroke-width="4" fill="none" />
  <!-- Leaf -->
  <path d="M32 10 Q40 0 48 10 Q40 20 32 10" fill="#166534" />
  <!-- Cherries -->
  <circle cx="20" cy="40" r="16" fill="#ef4444" />
  <circle cx="44" cy="40" r="16" fill="#ef4444" />
  <!-- Eyes -->
  <circle cx="16" cy="36" r="2" fill="#000000" />
  <circle cx="24" cy="36" r="2" fill="#000000" />
  <circle cx="40" cy="36" r="2" fill="#000000" />
  <circle cx="48" cy="36" r="2" fill="#000000" />
  <!-- Angry eyebrows -->
  <path d="M12 32 L20 34 M28 32 L20 34" stroke="#000000" stroke-width="2" fill="none" />
  <path d="M36 32 L44 34 M52 32 L44 34" stroke="#000000" stroke-width="2" fill="none" />
</svg>`,
  'zombies/normal.svg': `
<svg width="64" height="100" viewBox="0 0 64 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Legs -->
  <rect x="20" y="60" width="10" height="38" fill="#1e3a8a" />
  <rect x="34" y="60" width="10" height="38" fill="#1e3a8a" />
  <!-- Body -->
  <rect x="16" y="34" width="32" height="36" fill="#451a03" rx="4" />
  <!-- Tie -->
  <path d="M30 34 L34 34 L32 50 Z" fill="#dc2626" />
  <!-- Arms -->
  <rect x="2" y="38" width="20" height="8" fill="#451a03" rx="4" />
  <circle cx="4" cy="42" r="6" fill="#8fbc8f" />
  <!-- Head -->
  <circle cx="32" cy="22" r="18" fill="#8fbc8f" />
  <!-- Eyes -->
  <circle cx="26" cy="18" r="4" fill="#ffffff" />
  <circle cx="38" cy="18" r="4" fill="#ffffff" />
  <circle cx="26" cy="18" r="2" fill="#000000" />
  <circle cx="38" cy="18" r="2" fill="#000000" />
  <!-- Mouth -->
  <ellipse cx="32" cy="30" rx="6" ry="4" fill="#000000" />
</svg>`,
  'zombies/conehead.svg': `
<svg width="64" height="100" viewBox="0 0 64 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Legs -->
  <rect x="20" y="60" width="10" height="38" fill="#1e3a8a" />
  <rect x="34" y="60" width="10" height="38" fill="#1e3a8a" />
  <!-- Body -->
  <rect x="16" y="34" width="32" height="36" fill="#451a03" rx="4" />
  <!-- Tie -->
  <path d="M30 34 L34 34 L32 50 Z" fill="#dc2626" />
  <!-- Head -->
  <circle cx="32" cy="22" r="18" fill="#8fbc8f" />
  <!-- Eyes -->
  <circle cx="26" cy="18" r="4" fill="#ffffff" />
  <circle cx="38" cy="18" r="4" fill="#ffffff" />
  <circle cx="26" cy="18" r="2" fill="#000000" />
  <circle cx="38" cy="18" r="2" fill="#000000" />
  <!-- Mouth -->
  <ellipse cx="32" cy="30" rx="6" ry="4" fill="#000000" />
  <!-- Cone -->
  <path d="M16 12 L32 -6 L48 12 Z" fill="#ea580c" />
  <ellipse cx="32" cy="12" rx="16" ry="4" fill="#f97316" />
</svg>`,
  'projectiles/pea.svg': `
<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="10" r="8" fill="#4ade80" />
  <circle cx="7" cy="7" r="3" fill="#ffffff" opacity="0.6" />
</svg>`,
  'projectiles/snow_pea.svg': `
<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="10" r="8" fill="#60a5fa" />
  <circle cx="7" cy="7" r="3" fill="#ffffff" opacity="0.8" />
</svg>`,
  'ui/sun.svg': `
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="18" fill="#fef08a" />
  <circle cx="20" cy="20" r="14" fill="#facc15" />
  <circle cx="20" cy="20" r="10" fill="#eab308" />
</svg>`
};

async function generate() {
  for (const [relativePath, content] of Object.entries(assets)) {
    const fullPath = path.join(PUBLIC_DIR, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content.trim());
    console.log('Created:', relativePath);
  }
}

generate().catch(console.error);
