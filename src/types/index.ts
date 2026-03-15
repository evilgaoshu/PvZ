/**
 * 游戏常量定义
 */

// 游戏基础配置
export const GAME_CONFIG = {
  // 设计分辨率
  DESIGN_WIDTH: 800,
  DESIGN_HEIGHT: 600,

  // 游戏标题
  TITLE: '植物大战僵尸',

  // 调试模式
  DEBUG: false,
} as const;

// 网格配置
export const GRID_CONFIG = {
  // 行数和列数
  ROWS: 5,
  COLS: 9,

  // 格子尺寸
  CELL_WIDTH: 80,
  CELL_HEIGHT: 100,

  // 网格偏移（相对于游戏场景）
  OFFSET_X: 380,
  OFFSET_Y: 80,

  // 草坪颜色
  GRASS_COLORS: [0x5c9c54, 0x6bae5e],
} as const;

// 经济系统配置
export const ECONOMY_CONFIG = {
  // 初始阳光
  INITIAL_SUN: 150,

  // 阳光上限
  MAX_SUN: 9990,

  // 自然掉落阳光配置
  FALLING_SUN: {
    AMOUNT: 25,
    MIN_INTERVAL: 5000, // 毫秒
    MAX_INTERVAL: 10000, // 毫秒
    FALL_DURATION: 8000, // 毫秒
    LIFETIME: 12000, // 毫秒后消失
  },

  // 向日葵生产
  SUNFLOWER: {
    PRODUCE_AMOUNT: 25,
    PRODUCE_INTERVAL: 24000, // 毫秒
  },
} as const;

// 波次系统配置
export const WAVE_CONFIG = {
  // 准备时间
  PREPARATION_TIME: 30000, // 毫秒

  // 波次间隔
  WAVE_INTERVAL: 25000, // 毫秒

  // 警告提前时间
  WARNING_TIME: 5000, // 毫秒

  // 旗帜波次间隔
  FLAG_WAVE_INTERVAL: 10, // 每10波一个大波
} as const;

// 游戏事件枚举
export enum GameEvents {
  // 经济事件
  SUN_COLLECTED = 'sun:collected',
  SUN_CHANGED = 'sun:changed',

  // 种植事件
  PLANT_SELECTED = 'plant:selected',
  PLANT_PLACED = 'plant:placed',
  PLANT_REMOVED = 'plant:removed',

  // 战斗事件
  ZOMBIE_SPAWNED = 'zombie:spawned',
  ZOMBIE_DIED = 'zombie:died',
  PROJECTILE_FIRED = 'projectile:fired',
  PROJECTILE_HIT = 'projectile:hit',

  // 波次事件
  WAVE_STARTED = 'wave:started',
  WAVE_COMPLETED = 'wave:completed',
  FINAL_WAVE_WARNING = 'wave:final_warning',
  ALL_WAVES_COMPLETED = 'wave:all_completed',

  // 游戏状态事件
  GAME_STARTED = 'game:started',
  GAME_PAUSED = 'game:paused',
  GAME_RESUMED = 'game:resumed',
  GAME_OVER = 'game:over',
  GAME_WON = 'game:won',

  // 输入事件
  CELL_CLICKED = 'cell:clicked',
}

// 实体状态枚举
export enum EntityState {
  IDLE = 'idle',
  ATTACK = 'attack',
  HURT = 'hurt',
  DEAD = 'dead',
  WALK = 'walk',
  EAT = 'eat',
}

// 植物类型
export enum PlantType {
  SUNFLOWER = 'sunflower',
  PEASHOOTER = 'peashooter',
  WALLNUT = 'wallnut',
  CHERRY_BOMB = 'cherry_bomb',
  SNOW_PEA = 'snow_pea',
  REPEATER = 'repeater',
  CHOMPER = 'chomper',
}

// 僵尸类型
export enum ZombieType {
  NORMAL = 'normal',
  CONEHEAD = 'conehead',
  BUCKETHEAD = 'buckethead',
  POLE_VAULTING = 'pole_vaulting',
  NEWSPAPER = 'newspaper',
  SCREENDOOR = 'screendoor',
}

// 投射物类型
export enum ProjectileType {
  PEA = 'pea',
  SNOW_PEA = 'snow_pea',
  CABBAGE = 'cabbage',
}
