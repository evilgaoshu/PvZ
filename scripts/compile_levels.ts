import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ZombieSpawn {
  type: string;
  count: number;
  delay?: number;
  row?: number;
}

interface WaveData {
  timeBeforeWave?: number;
  isFlagWave?: boolean;
  zombies: ZombieSpawn[];
}

interface LevelData {
  id: string;
  name: string;
  background: string;
  sunReward: number;
  availablePlants: string[];
  waves: WaveData[];
}

/**
 * 验证关卡数据格式
 */
function validateLevelData(data: any): data is LevelData {
  if (!data.id || !data.name || !data.waves || !Array.isArray(data.waves)) {
    return false;
  }
  return true;
}

/**
 * 将YAML关卡配置编译为TypeScript可用的JSON
 */
function compileLevels() {
  const levelsDir = path.resolve(__dirname, '../data/levels');
  const outDir = path.resolve(__dirname, '../src/data/compiled');
  const outFile = path.join(outDir, 'levels.json');

  if (!fs.existsSync(levelsDir)) {
    fs.mkdirSync(levelsDir, { recursive: true });
    // 创建一个示例 YAML 文件
    const sampleLevel = `
id: "1-1"
name: "Day 1"
background: "day-grass"
sunReward: 50
availablePlants:
  - "peashooter"
  - "sunflower"
  - "wallnut"
  - "cherry_bomb"
waves:
  - timeBeforeWave: 10000
    zombies:
      - type: "normal"
        count: 1
  - timeBeforeWave: 15000
    zombies:
      - type: "normal"
        count: 2
        delay: 5000
  - timeBeforeWave: 20000
    isFlagWave: true
    zombies:
      - type: "normal"
        count: 3
        delay: 2000
      - type: "conehead"
        count: 1
        delay: 0
`;
    fs.writeFileSync(path.join(levelsDir, '1-1.yaml'), sampleLevel);
    console.log('Created sample level at data/levels/1-1.yaml');
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const files = fs.readdirSync(levelsDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
  const levelsData: Record<string, LevelData> = {};

  let hasErrors = false;

  for (const file of files) {
    try {
      const filePath = path.join(levelsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsedData = yaml.parse(fileContent);

      if (validateLevelData(parsedData)) {
        levelsData[parsedData.id] = parsedData;
        console.log(`Successfully compiled level: ${parsedData.id}`);
      } else {
        console.error(`Invalid level data format in file: ${file}`);
        hasErrors = true;
      }
    } catch (e) {
      console.error(`Error parsing YAML file ${file}:`, e);
      hasErrors = true;
    }
  }

  if (!hasErrors) {
    fs.writeFileSync(outFile, JSON.stringify(levelsData, null, 2));
    console.log(`All levels compiled successfully to ${outFile}`);
  } else {
    console.warn('Compilation finished with errors. Output file may not be complete.');
  }
}

compileLevels();
