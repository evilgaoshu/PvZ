import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'images');

const newAssets = {
  'plants/potato_mine.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Dirt mound -->
  <ellipse cx="50" cy="80" rx="35" ry="15" fill="#451A03" />
  <ellipse cx="50" cy="75" rx="25" ry="10" fill="#78350F" />
  <!-- Potato Body -->
  <ellipse cx="50" cy="60" rx="22" ry="20" fill="#D97706" stroke="#92400E" stroke-width="2" />
  <circle cx="45" cy="55" r="2" fill="#78350F" opacity="0.5" />
  <circle cx="58" cy="65" r="2.5" fill="#78350F" opacity="0.5" />
  <circle cx="38" cy="62" r="1.5" fill="#78350F" opacity="0.5" />
  <!-- Eyes -->
  <circle cx="42" cy="58" r="4" fill="#FFF" />
  <circle cx="58" cy="58" r="4" fill="#FFF" />
  <circle cx="42" cy="58" r="2" fill="#000" />
  <circle cx="58" cy="58" r="2" fill="#000" />
  <!-- Antenna / Light -->
  <path d="M50 40 L50 20" stroke="#78716C" stroke-width="3" />
  <circle cx="50" cy="15" r="5" fill="#EF4444" />
</svg>`,

  'plants/jalapeno.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Jalapeno Body -->
  <path d="M40 90 Q60 90 70 60 Q80 30 50 20 Q30 30 35 60 Q40 85 40 90 Z" fill="#EF4444" stroke="#991B1B" stroke-width="3" />
  <!-- Stem -->
  <path d="M50 20 Q50 10 40 5" stroke="#15803D" stroke-width="5" fill="none" stroke-linecap="round" />
  <!-- Angry Eyes -->
  <path d="M40 40 L48 45 M60 40 L52 45" stroke="#000" stroke-width="3" stroke-linecap="round" />
  <circle cx="45" cy="48" r="2" fill="#000" />
  <circle cx="55" cy="48" r="2" fill="#000" />
  <!-- Mouth -->
  <path d="M45 60 Q50 65 55 60" stroke="#000" stroke-width="2" fill="none" />
</svg>`,

  'plants/squash.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Squash Body -->
  <path d="M30 85 Q50 95 70 85 Q85 60 75 35 Q65 15 50 15 Q35 15 25 35 Q15 60 30 85 Z" fill="#16A34A" stroke="#14532D" stroke-width="3" />
  <path d="M50 15 L50 88 M35 25 Q30 50 40 85 M65 25 Q70 50 60 85" stroke="#15803D" stroke-width="2" fill="none" opacity="0.6" />
  <!-- Stem -->
  <path d="M50 15 Q55 5 45 5" stroke="#14532D" stroke-width="6" fill="none" stroke-linecap="round" />
  <!-- Angry Face -->
  <path d="M35 50 L45 55 M65 50 L55 55" stroke="#000" stroke-width="3" stroke-linecap="round" />
  <circle cx="42" cy="58" r="3" fill="#000" />
  <circle cx="58" cy="58" r="3" fill="#000" />
  <path d="M40 75 Q50 80 60 75" stroke="#000" stroke-width="3" fill="none" />
</svg>`
};

async function generate() {
  for (const [relPath, content] of Object.entries(newAssets)) {
    const fullPath = path.join(PUBLIC_DIR, relPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content.trim());
    console.log('Created New Asset:', relPath);
  }
}

generate().catch(console.error);
