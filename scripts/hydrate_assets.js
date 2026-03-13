import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public', 'assets');
const TEMP_SFX_DIR = '/tmp/pvz_assets/repo/Assets/sounds';

const MUSIC_SOURCES = {
  'audio/bgm/menu.mp3': 'https://archive.org/download/plants-vs.-zombies-ost-flac/Laura%20Shigihara%20-%20Plants%20vs.%20Zombies%20Original%20Soundtrack/02%20-%20Crazy%20Dave%20%28Intro%20Theme%29.mp3',
  'audio/bgm/game_day.mp3': 'https://archive.org/download/plants-vs.-zombies-ost-flac/Laura%20Shigihara%20-%20Plants%20vs.%20Zombies%20Original%20Soundtrack/04%20-%20Grasswalk.mp3',
  'audio/bgm/game_night.mp3': 'https://archive.org/download/plants-vs.-zombies-ost-flac/Laura%20Shigihara%20-%20Plants%20vs.%20Zombies%20Original%20Soundtrack/06%20-%20Moongrains.mp3',
  'audio/bgm/game_boss.mp3': 'https://archive.org/download/plants-vs.-zombies-ost-flac/Laura%20Shigihara%20-%20Plants%20vs.%20Zombies%20Original%20Soundtrack/14%20-%20Brainiac%20Maniac.mp3'
};

const SFX_MAPPING = {
  'plant.wav': 'audio/sfx/plant.wav',
  'shovel.wav': 'audio/sfx/shovel.wav',
  'peashooter_shoot.wav': 'audio/sfx/shoot.wav',
  'brainz.wav': 'audio/sfx/zombie_die.wav',
  'chomp.wav': 'audio/sfx/chomp.wav',
  'cherrybomb.wav': 'audio/sfx/explosion.wav',
  'sun_pickup.wav': 'audio/sfx/sun_collect.wav',
  'groan.wav': 'audio/sfx/zombie_groan.wav',
  'lawnmower.wav': 'audio/sfx/lawn_mower.wav',
  'zombies_are_coming.wav': 'audio/sfx/huge_wave.wav',
  'splat3.wav': 'audio/sfx/hit.wav',
  'yuck.wav': 'audio/sfx/error.wav'
};

async function downloadFile(url, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode} for ${url}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function hydrate() {
  console.log('🎵 开始注入原版音乐资源 (Archive.org)...');
  for (const [relPath, url] of Object.entries(MUSIC_SOURCES)) {
    const dest = path.join(PUBLIC_DIR, relPath);
    try {
      await downloadFile(url, dest);
      console.log(`✅ 已下载音乐: ${relPath}`);
    } catch (err) {
      console.warn(`❌ 音乐下载失败 ${relPath}: ${err.message}`);
    }
  }

  console.log('🔊 开始从本地缓存注入原版音效资源...');
  if (fs.existsSync(TEMP_SFX_DIR)) {
    for (const [srcName, destRelPath] of Object.entries(SFX_MAPPING)) {
      const src = path.join(TEMP_SFX_DIR, srcName);
      const dest = path.join(PUBLIC_DIR, destRelPath);
      if (fs.existsSync(src)) {
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(src, dest);
        console.log(`✅ 已复制音效: ${destRelPath}`);
      } else {
        console.warn(`⚠️ 找不到本地音效源文件: ${srcName}`);
      }
    }
  } else {
    console.error('❌ 找不到本地 SFX 缓存目录');
  }

  console.log('🏁 资产注入完成！');
}

hydrate().catch(console.error);
