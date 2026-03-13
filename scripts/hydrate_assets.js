import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public', 'assets');

// 引用来源：Gzh0821/pvzge_web 或 lonelystar 的资源镜像
// 注意：以下 URL 仅供技术验证使用
const ASSET_SOURCES = {
  'audio/bgm/game_day.mp3': 'https://raw.githubusercontent.com/Gzh0821/pvzge_web/master/assets/audio/music/main_music.mp3',
  'audio/sfx/plant.mp3': 'https://raw.githubusercontent.com/Gzh0821/pvzge_web/master/assets/audio/sfx/plant.mp3',
  'audio/sfx/shoot.mp3': 'https://raw.githubusercontent.com/Gzh0821/pvzge_web/master/assets/audio/sfx/shoot.mp3',
  'audio/sfx/splat.mp3': 'https://raw.githubusercontent.com/Gzh0821/pvzge_web/master/assets/audio/sfx/splat.mp3',
  'audio/sfx/zombie_die.mp3': 'https://raw.githubusercontent.com/Gzh0821/pvzge_web/master/assets/audio/sfx/zombie_die.mp3'
};

async function downloadFile(url, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function hydrate() {
  console.log('🚀 开始注入开源社区音频资源...');
  for (const [relPath, url] of Object.entries(ASSET_SOURCES)) {
    const dest = path.join(PUBLIC_DIR, relPath);
    try {
      await downloadFile(url, dest);
      console.log(`✅ 已下载: ${relPath}`);
    } catch (err) {
      console.warn(`❌ 下载失败 ${relPath}: ${err.message}`);
    }
  }
  console.log('🏁 资产注入完成！');
}

hydrate().catch(console.error);
