import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'images');

const assets = {
  // --- PLANTS ---
  'plants/sunflower.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="46" y="60" width="8" height="35" fill="#15803D" />
  <g transform="translate(50,50)">
    ${Array.from({ length: 12 }).map((_, i) => `
      <ellipse cx="0" cy="-25" rx="10" ry="20" fill="#FACC15" stroke="#CA8A04" stroke-width="2" transform="rotate(${i * 30})" />
    `).join('')}
    <circle cx="0" cy="0" r="20" fill="#78350F" stroke="#451A03" stroke-width="2" />
    <circle cx="-7" cy="-5" r="2" fill="#FFF" />
    <circle cx="7" cy="-5" r="2" fill="#FFF" />
    <path d="M-8 8 Q0 15 8 8" stroke="#FFF" stroke-width="2" fill="none" />
  </g>
</svg>`,

  'plants/peashooter.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="46" y="50" width="8" height="45" fill="#15803D" />
  <circle cx="40" cy="40" r="25" fill="#4ADE80" stroke="#166534" stroke-width="3" />
  <rect x="60" cy="30" width="30" height="20" rx="5" fill="#4ADE80" stroke="#166534" stroke-width="3" />
  <circle cx="90" cy="40" r="8" fill="#064E3B" />
  <circle cx="35" cy="35" r="4" fill="#000" />
  <path d="M25 35 Q10 25 5 45 Q15 50 25 35" fill="#166534" />
</svg>`,

  'plants/wallnut.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="50" rx="35" ry="45" fill="#92400E" stroke="#451A03" stroke-width="4" />
  <circle cx="35" cy="35" r="6" fill="#FFF" />
  <circle cx="65" cy="35" r="6" fill="#FFF" />
  <circle cx="35" cy="35" r="2" fill="#000" />
  <circle cx="65" cy="35" r="2" fill="#000" />
  <path d="M40 70 Q50 75 60 70" stroke="#451A03" stroke-width="3" fill="none" />
</svg>`,

  'plants/cherry_bomb.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 20 L30 50 M50 20 L70 50" stroke="#15803D" stroke-width="6" />
  <circle cx="30" cy="65" r="25" fill="#EF4444" stroke="#991B1B" stroke-width="3" />
  <circle cx="70" cy="65" r="25" fill="#EF4444" stroke="#991B1B" stroke-width="3" />
</svg>`,

  'ui/sun.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="30" fill="#FACC15" stroke="#EAB308" stroke-width="4" />
  <g transform="translate(50,50)">
    ${Array.from({ length: 8 }).map((_, i) => `
      <circle cx="0" cy="-40" r="8" fill="#FACC15" transform="rotate(${i * 45})" />
    `).join('')}
  </g>
</svg>`,

  'ui/lawn_mower.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="40" width="80" height="40" rx="10" fill="#EF4444" stroke="#991B1B" stroke-width="4" />
  <circle cx="25" cy="80" r="10" fill="#1F2937" />
  <circle cx="75" cy="80" r="10" fill="#1F2937" />
  <path d="M20 40 L20 20 L80 20 L80 40" fill="none" stroke="#94A3B8" stroke-width="6" />
</svg>`,

  'backgrounds/day-grass.svg': `
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#4ADE80" />
  <defs>
    <pattern id="grid" width="160" height="200" patternUnits="userSpaceOnUse">
      <rect width="80" height="100" fill="#22C55E" />
      <rect x="80" y="100" width="80" height="100" fill="#22C55E" />
    </pattern>
  </defs>
  <rect width="800" height="600" fill="url(#grid)" opacity="0.5" />
  <line x1="120" y1="0" x2="120" y2="600" stroke="#1E293B" stroke-width="2" stroke-dasharray="10 10" />
</svg>`
};

async function generate() {
  for (const [relPath, content] of Object.entries(assets)) {
    const fullPath = path.join(PUBLIC_DIR, relPath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content.trim());
    console.log('Robust Update:', relPath);
  }
}

generate().catch(console.error);
