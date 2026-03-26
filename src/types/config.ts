/**
 * 游戏配置类型定义
 */

// 基础配置接口
export interface BaseConfig {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
}

// 动画配置
export interface AnimationConfig {
  readonly key: string;
  readonly frames: {
    readonly start: number;
    readonly end: number;
    readonly prefix?: string;
    readonly suffix?: string;
  };
  readonly frameRate: number;
  readonly repeat: number;
  readonly yoyo?: boolean;
}

// 植物配置
export interface PlantConfig extends BaseConfig {
  // 基础属性
  readonly cost: number;
  readonly health: number;
  readonly cooldown: number; // 秒

  // 攻击属性（可选）
  readonly attackDamage?: number;
  readonly attackInterval?: number; // 秒
  readonly attackRange?: number; // 格子数
  readonly projectileType?: string;

  // 生产属性（可选）
  readonly produceAmount?: number;
  readonly produceInterval?: number; // 秒

  // 防御属性（可选）
  readonly armor?: number;
  readonly blockCount?: number;

  // 特殊效果
  readonly specialEffects?: string[];

  // 放置规则
  readonly placement?: ('grass' | 'water' | 'lilypad')[];

  // 资源路径
  readonly spriteSheet: string;
  readonly spineKey?: string;
  readonly animations: readonly AnimationConfig[];
}

// 僵尸配置
export interface ZombieConfig extends BaseConfig {
  // 基础属性
  readonly health: number;
  readonly speed: number; // 像素/秒
  readonly damage: number;
  readonly attackInterval: number;

  // 护甲
  readonly armor?: number;
  readonly armorType?: 'cone' | 'bucket' | 'screenDoor';

  // 特殊能力
  readonly abilities?: readonly string[];

  // 掉落
  readonly loot?: readonly {
    readonly type: string;
    readonly chance: number;
    readonly amount: number;
  }[];

  // 资源路径
  readonly spriteSheet: string;
  readonly animations: readonly AnimationConfig[];
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
