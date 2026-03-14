import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'images');

const newAssets = {
  'plants/torchwood.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Tree Stump -->
  <path d="M30 40 L35 90 L65 90 L70 40 Z" fill="#78350F" stroke="#451A03" stroke-width="3" stroke-linejoin="round" />
  <!-- Bark Lines -->
  <path d="M40 50 L42 80 M50 45 L50 85 M60 50 L58 80" stroke="#451A03" stroke-width="2" fill="none" opacity="0.6" />
  <!-- Roots -->
  <path d="M35 90 Q25 95 20 100 M65 90 Q75 95 80 100" stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round" />
  
  <!-- Fire -->
  <path d="M25 40 Q50 -10 75 40 Q65 10 50 35 Q35 10 25 40 Z" fill="#EF4444" opacity="0.9" />
  <path d="M35 40 Q50 0 65 40 Q55 20 50 35 Q45 20 35 40 Z" fill="#F97316" opacity="0.9" />
  <path d="M42 40 Q50 15 58 40 Q54 25 50 35 Q46 25 42 40 Z" fill="#FACC15" opacity="0.9" />
  
  <!-- Eyes -->
  <circle cx="42" cy="55" r="4" fill="#000" />
  <circle cx="58" cy="55" r="4" fill="#000" />
  <circle cx="43" cy="54" r="1.5" fill="#FFF" />
  <circle cx="59" cy="54" r="1.5" fill="#FFF" />
  
  <!-- Mouth -->
  <path d="M40 70 Q50 80 60 70" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round" />
</svg>`,

  'plants/spikeweed.svg': `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Base Vines/Leaves -->
  <path d="M10 85 Q30 70 50 85 Q70 70 90 85 Q70 95 50 90 Q30 95 10 85 Z" fill="#166534" stroke="#14532D" stroke-width="2" />
  <!-- Spikes -->
  <path d="M20 80 L25 40 L30 80 Z" fill="#4ADE80" stroke="#16A34A" stroke-width="1" />
  <path d="M35 85 L40 30 L45 85 Z" fill="#4ADE80" stroke="#16A34A" stroke-width="1" />
  <path d="M50 85 L55 20 L60 85 Z" fill="#4ADE80" stroke="#16A34A" stroke-width="1" />
  <path d="M65 85 L70 35 L75 85 Z" fill="#4ADE80" stroke="#16A34A" stroke-width="1" />
  <path d="M80 80 L85 45 L90 80 Z" fill="#4ADE80" stroke="#16A34A" stroke-width="1" />
  <!-- Eyes -->
  <circle cx="45" cy="70" r="3" fill="#FFF" />
  <circle cx="55" cy="70" r="3" fill="#FFF" />
  <circle cx="45" cy="70" r="1.5" fill="#000" />
  <circle cx="55" cy="70" r="1.5" fill="#000" />
</svg>`,

  'projectiles/fire_pea.svg': `
<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
  <circle cx="15" cy="15" r="10" fill="#EF4444" />
  <circle cx="10" cy="10" r="3" fill="#FACC15" opacity="0.8" />
  <!-- Flame Trail -->
  <path d="M5 15 Q0 10 5 5 Q10 10 15 5 Q10 10 5 15 Z" fill="#F97316" transform="rotate(-45 15 15)" />
</svg>`
};

async function generate() {
  for (const [relPath, content] of Object.entries(newAssets)) {
    const fullPath = path.join(PUBLIC_DIR, relPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content.trim());
    console.log('Created Advanced Asset:', relPath);
  }
}

generate().catch(console.error);
