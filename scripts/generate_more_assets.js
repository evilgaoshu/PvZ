import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'images');

const assets = {
  'plants/snow_pea.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="28" y="32" width="8" height="32" fill="#15803d" />
  <path d="M32 40 C10 40 10 60 32 60" fill="#166534" />
  <circle cx="32" cy="24" r="16" fill="#60a5fa" />
  <rect x="36" y="16" width="24" height="16" rx="4" fill="#60a5fa" />
  <ellipse cx="60" cy="24" rx="4" ry="6" fill="#1e3a8a" />
  <circle cx="36" cy="18" r="3" fill="#000000" />
  <!-- Snow crystals -->
  <path d="M32 8 L32 12 M20 20 L24 24" stroke="#ffffff" stroke-width="2" />
</svg>`,
  'plants/repeater.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="28" y="32" width="8" height="32" fill="#15803d" />
  <path d="M32 40 C10 40 10 60 32 60" fill="#166534" />
  <circle cx="32" cy="24" r="16" fill="#22c55e" />
  <rect x="36" y="16" width="24" height="16" rx="4" fill="#22c55e" />
  <ellipse cx="60" cy="24" rx="4" ry="6" fill="#064e3b" />
  <!-- Angry eyes -->
  <path d="M30 16 L38 20" stroke="#000000" stroke-width="2" />
  <circle cx="36" cy="20" r="3" fill="#000000" />
  <circle cx="38" cy="19" r="1" fill="#ffffff" />
  <!-- Extra leaves -->
  <path d="M24 24 L16 16 L20 28 Z" fill="#166534" />
</svg>`,
  'plants/chomper.svg': `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 32 Q16 64 32 64" stroke="#15803d" stroke-width="6" fill="none" />
  <path d="M32 40 C10 40 10 60 32 60" fill="#166534" />
  <!-- Head -->
  <circle cx="32" cy="24" r="20" fill="#7e22ce" />
  <!-- Mouth / Teeth -->
  <path d="M12 24 L52 24 Q32 44 12 24" fill="#000000" />
  <path d="M16 24 L20 16 L24 24 Z M28 24 L32 16 L36 24 Z M40 24 L44 16 L48 24 Z" fill="#ffffff" />
  <path d="M20 24 L24 32 L28 24 Z M32 24 L36 32 L40 24 Z" fill="#ffffff" />
  <!-- Lips -->
  <path d="M12 24 Q32 20 52 24" stroke="#a855f7" stroke-width="4" fill="none" />
</svg>`,
  'zombies/buckethead.svg': `
<svg width="64" height="100" viewBox="0 0 64 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="60" width="10" height="38" fill="#1e3a8a" />
  <rect x="34" y="60" width="10" height="38" fill="#1e3a8a" />
  <rect x="16" y="34" width="32" height="36" fill="#451a03" rx="4" />
  <path d="M30 34 L34 34 L32 50 Z" fill="#dc2626" />
  <circle cx="32" cy="22" r="18" fill="#8fbc8f" />
  <circle cx="26" cy="18" r="4" fill="#ffffff" />
  <circle cx="38" cy="18" r="4" fill="#ffffff" />
  <circle cx="26" cy="18" r="2" fill="#000000" />
  <circle cx="38" cy="18" r="2" fill="#000000" />
  <ellipse cx="32" cy="30" rx="6" ry="4" fill="#000000" />
  <!-- Bucket -->
  <path d="M14 4 L50 4 L46 20 L18 20 Z" fill="#94a3b8" />
  <ellipse cx="32" cy="4" rx="18" ry="4" fill="#cbd5e1" />
  <!-- Blood stain on bucket -->
  <path d="M30 20 L32 10 L34 20 Z" fill="#ef4444" opacity="0.6" />
</svg>`,
  'zombies/pole_vaulting.svg': `
<svg width="64" height="100" viewBox="0 0 64 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="60" width="10" height="38" fill="#b91c1c" />
  <rect x="34" y="60" width="10" height="38" fill="#b91c1c" />
  <rect x="16" y="34" width="32" height="36" fill="#facc15" rx="4" />
  <circle cx="32" cy="22" r="18" fill="#8fbc8f" />
  <circle cx="26" cy="18" r="4" fill="#ffffff" />
  <circle cx="38" cy="18" r="4" fill="#ffffff" />
  <circle cx="26" cy="18" r="2" fill="#000000" />
  <circle cx="38" cy="18" r="2" fill="#000000" />
  <ellipse cx="32" cy="30" rx="6" ry="4" fill="#000000" />
  <!-- Pole -->
  <rect x="4" y="10" width="8" height="90" fill="#a3e635" rx="4" />
</svg>`,
  'zombies/newspaper.svg': `
<svg width="64" height="100" viewBox="0 0 64 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="60" width="10" height="38" fill="#475569" />
  <rect x="34" y="60" width="10" height="38" fill="#475569" />
  <rect x="16" y="34" width="32" height="36" fill="#f8fafc" rx="4" />
  <!-- Suspenders -->
  <rect x="18" y="34" width="4" height="36" fill="#000000" />
  <rect x="42" y="34" width="4" height="36" fill="#000000" />
  <circle cx="32" cy="22" r="18" fill="#8fbc8f" />
  <circle cx="26" cy="18" r="4" fill="#ffffff" />
  <circle cx="38" cy="18" r="4" fill="#ffffff" />
  <circle cx="26" cy="18" r="2" fill="#ef4444" />
  <circle cx="38" cy="18" r="2" fill="#ef4444" />
  <ellipse cx="32" cy="30" rx="6" ry="4" fill="#000000" />
  <!-- Newspaper -->
  <rect x="10" y="30" width="30" height="40" fill="#e2e8f0" transform="rotate(-15 25 50)" />
  <line x1="15" y1="35" x2="35" y2="35" stroke="#94a3b8" stroke-width="2" transform="rotate(-15 25 50)" />
  <line x1="15" y1="45" x2="35" y2="45" stroke="#94a3b8" stroke-width="2" transform="rotate(-15 25 50)" />
  <line x1="15" y1="55" x2="35" y2="55" stroke="#94a3b8" stroke-width="2" transform="rotate(-15 25 50)" />
</svg>`,
  'zombies/screendoor.svg': `
<svg width="64" height="100" viewBox="0 0 64 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="60" width="10" height="38" fill="#1e3a8a" />
  <rect x="34" y="60" width="10" height="38" fill="#1e3a8a" />
  <rect x="16" y="34" width="32" height="36" fill="#451a03" rx="4" />
  <path d="M30 34 L34 34 L32 50 Z" fill="#dc2626" />
  <circle cx="32" cy="22" r="18" fill="#8fbc8f" />
  <circle cx="26" cy="18" r="4" fill="#ffffff" />
  <circle cx="38" cy="18" r="4" fill="#ffffff" />
  <circle cx="26" cy="18" r="2" fill="#000000" />
  <circle cx="38" cy="18" r="2" fill="#000000" />
  <ellipse cx="32" cy="30" rx="6" ry="4" fill="#000000" />
  <!-- Screen Door -->
  <rect x="30" y="10" width="30" height="80" fill="none" stroke="#475569" stroke-width="4" />
  <!-- Mesh -->
  <path d="M34 14 L56 14 M34 18 L56 18 M34 22 L56 22 M34 26 L56 26 M34 30 L56 30 M34 34 L56 34 M34 38 L56 38 M34 42 L56 42 M34 46 L56 46 M34 50 L56 50 M34 54 L56 54 M34 58 L56 58 M34 62 L56 62 M34 66 L56 66 M34 70 L56 70 M34 74 L56 74 M34 78 L56 78 M34 82 L56 82 M34 86 L56 86" stroke="#94a3b8" stroke-width="1" />
  <path d="M36 12 L36 88 M40 12 L40 88 M44 12 L44 88 M48 12 L48 88 M52 12 L52 88" stroke="#94a3b8" stroke-width="1" />
</svg>`,
  'backgrounds/day-grass.svg': `
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grass-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="#4ade80" />
      <path d="M10 90 Q15 70 20 90" stroke="#166534" stroke-width="2" fill="none" opacity="0.4" />
      <path d="M50 40 Q55 20 60 40" stroke="#166534" stroke-width="2" fill="none" opacity="0.4" />
      <path d="M80 80 Q85 60 90 80" stroke="#166534" stroke-width="2" fill="none" opacity="0.4" />
      <rect x="0" y="0" width="50" height="50" fill="#22c55e" opacity="0.2" />
      <rect x="50" y="50" width="50" height="50" fill="#22c55e" opacity="0.2" />
    </pattern>
  </defs>
  <rect width="800" height="600" fill="url(#grass-pattern)" />
  <!-- House safe zone (left) -->
  <rect x="0" y="0" width="120" height="600" fill="#0f172a" opacity="0.1" />
  <path d="M120 0 L120 600" stroke="#1e293b" stroke-width="4" stroke-dasharray="10 10" />
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
