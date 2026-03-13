/**
 * 游戏配置类型定义
 */

// 基础配置接口
export interface BaseConfig {
  id: string;
  name: string;
  description?: string;
}

// 动画配置
export interface AnimationConfig {
  key: string;
  frames: {
    start: number;
    end: number;
    prefix?: string;
    suffix?: string;
  };
  frameRate: number;
  repeat: number;
  yoyo?: boolean;
}

// 植物配置
export interface PlantConfig extends BaseConfig {
  // 基础属性
  cost: number;
  health: number;
  cooldown: number; // 秒

  // 攻击属性（可选）
  attackDamage?: number;
  attackInterval?: number; // 秒
  attackRange?: number; // 格子数
  projectileType?: string;

  // 生产属性（可选）
  produceAmount?: number;
  produceInterval?: number; // 秒

  // 防御属性（可选）
  armor?: number;
  blockCount?: number;

  // 特殊效果
  specialEffects?: string[];

  // 放置规则
  placement?: ('grass' | 'water' | 'lilypad')[];

  // 资源路径
  spriteSheet: string;
  animations: AnimationConfig[];
}

// 僵尸配置
export interface ZombieConfig extends BaseConfig {
  // 基础属性
  health: number;
  speed: number; // 像素/秒
  damage: number;
  attackInterval: number;

  // 护甲
  armor?: number;
  armorType?: 'cone' | 'bucket' | 'screenDoor';

  // 特殊能力
  abilities?: string[];

  // 掉落
  loot?: {
    type: string;
    chance: number;
    amount: number;
  }[];

  // 资源路径
  spriteSheet: string;
  animations: AnimationConfig[];
}

// 关卡波次配置
export interface WaveConfig {
  waveNumber: number;
  isFlagWave: boolean;
  zombies: {
    type: string;
    count: number;
    row?: number; // 指定行，undefined则随机
    delay?: number; // 僵尸间延迟（毫秒）
  }[];
  timeBeforeWave: number; // 波次前等待时间（毫秒）
}

// 关卡配置
export interface LevelConfig {
  id: string;
  name: string;
  world: number;
  level: number;
  description?: string;

  // 可用植物
  availablePlants: string[];

  // 僵尸类型
  zombieTypes: string[];

  // 波次配置
  waves: WaveConfig[];

  // 初始资源
  initialSun: number;

  // 背景
  background: string;

  // 特殊规则
  rules?: {
    conveyorBelt?: boolean;
    fixedCards?: boolean;
    noSunProduction?: boolean;
  };
}

// 游戏状态
export interface GameState {
  // 资源
  sun: number;
  score: number;

  // 当前关卡
  currentLevel: string | null;

  // 游戏进度
  currentWave: number;
  totalWaves: number;

  // 状态标记
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;

  // 选中的植物
  selectedPlant: string | null;
}

// 网格位置
export interface GridPosition {
  row: number;
  col: number;
}

// 屏幕位置
export interface ScreenPosition {
  x: number;
  y: number;
}

// 网格单元格
export interface GridCell {
  row: number;
  col: number;
  x: number;
  y: number;
  plant: string | null;
  platform?: string | null; // 平台植物，如睡莲
  isWalkable: boolean;
  terrainType: 'grass' | 'water';
}

// 伤害类型
export type DamageType = 'normal' | 'explosion' | 'ice' | 'fire';

// 阳光来源
export type SunSource = 'falling' | 'plant' | 'zombie' | 'cheat';

// 游戏事件数据
export interface SunCollectedEventData {
  amount: number;
  source: SunSource;
  position?: ScreenPosition;
}

export interface PlantPlacedEventData {
  plantType: string;
  row: number;
  col: number;
  cost: number;
}

export interface ZombieSpawnedEventData {
  zombieType: string;
  row: number;
  position: ScreenPosition;
}
