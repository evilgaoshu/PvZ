import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'images', 'effects');

const crackSvg = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 10 L25 30 L15 50 M40 10 L30 35 L50 55 M20 20 L45 25" stroke="#451a03" stroke-width="2" fill="none" opacity="0.6" />
</svg>
`;

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(path.join(PUBLIC_DIR, 'cracks.svg'), crackSvg.trim());
console.log('Created: effects/cracks.svg');
