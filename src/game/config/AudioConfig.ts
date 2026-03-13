import Phaser from 'phaser';

/**
 * 音频资源枚举
 */
export enum SoundEffect {
  // 种植相关
  PLANT = 'plant',
  SHOVEL = 'shovel',

  // 攻击相关
  SHOOT = 'shoot',
  HIT = 'hit',
  SPLAT = 'splat',
  CHOMP = 'chomp',

  // 爆炸相关
  EXPLOSION = 'explosion',

  // 阳光相关
  SUN_COLLECT = 'sun_collect',
  SUN_FALLING = 'sun_falling',

  // 僵尸相关
  ZOMBIE_GROAN = 'zombie_groan',
  ZOMBIE_EATING = 'zombie_eating',
  ZOMBIE_DIE = 'zombie_die',

  // 特殊能力
  POLE_VAULT = 'pole_vault',
  NEWSPAPER_RAGE = 'newspaper_rage',
  METAL_HIT = 'metal_hit',

  // 割草机
  LAWN_MOWER = 'lawn_mower',

  // UI相关
  BUTTON_CLICK = 'button_click',
  ERROR = 'error',
  WIN = 'win',
  LOSE = 'lose',

  // 警告
  FINAL_WAVE = 'final_wave',
  HUGE_WAVE = 'huge_wave',
}

/**
 * 背景音乐枚举
 */
export enum BackgroundMusic {
  MENU = 'bgm_menu',
  GAME_DAY = 'bgm_game_day',
  GAME_NIGHT = 'bgm_game_night',
  GAME_BOSS = 'bgm_game_boss',
  VICTORY = 'bgm_victory',
  DEFEAT = 'bgm_defeat',
}

/**
 * 音频配置接口
 */
export interface AudioConfig {
  key: string;
  path: string;
  volume?: number;
  loop?: boolean;
  rate?: number;
}

/**
 * 音效配置
 * 仅包含磁盘上实际存在的资源或已重定向的资源，避免 404
 */
export const SFX_CONFIGS: AudioConfig[] = [
  // 种植相关
  { key: SoundEffect.PLANT, path: 'assets/audio/sfx/plant.wav', volume: 0.6 },
  { key: SoundEffect.SHOVEL, path: 'assets/audio/sfx/plant.wav', volume: 0.7 }, // 重用 plant.wav

  // 攻击相关
  { key: SoundEffect.HIT, path: 'assets/audio/sfx/hit.wav', volume: 0.5 },
  { key: SoundEffect.SPLAT, path: 'assets/audio/sfx/hit.wav', volume: 0.6 }, // 重用 hit.wav
  { key: SoundEffect.CHOMP, path: 'assets/audio/sfx/chomp.wav', volume: 0.7 },

  // 爆炸相关
  {
    key: SoundEffect.EXPLOSION,
    path: 'assets/audio/sfx/explosion.wav',
    volume: 0.8,
  },

  // 僵尸相关
  {
    key: SoundEffect.ZOMBIE_GROAN,
    path: 'assets/audio/sfx/zombie_groan.wav',
    volume: 0.5,
  },
  {
    key: SoundEffect.ZOMBIE_EATING,
    path: 'assets/audio/sfx/chomp.wav',
    volume: 0.7,
  }, // 重用 chomp.wav
  {
    key: SoundEffect.ZOMBIE_DIE,
    path: 'assets/audio/sfx/zombie_die.wav',
    volume: 0.6,
  },

  // 割草机
  {
    key: SoundEffect.LAWN_MOWER,
    path: 'assets/audio/sfx/lawn_mower.wav',
    volume: 0.8,
  },

  // UI相关
  { key: SoundEffect.ERROR, path: 'assets/audio/sfx/error.wav', volume: 0.5 },

  // 警告
  {
    key: SoundEffect.HUGE_WAVE,
    path: 'assets/audio/sfx/huge_wave.wav',
    volume: 0.8,
  },
  {
    key: SoundEffect.FINAL_WAVE,
    path: 'assets/audio/sfx/huge_wave.wav',
    volume: 0.8,
  }, // 重用 huge_wave.wav
];

/**
 * 背景音乐配置
 * 仅包含实际存在的资源
 */
export const BGM_CONFIGS: AudioConfig[] = [
  {
    key: BackgroundMusic.MENU,
    path: 'assets/audio/bgm/menu.mp3',
    volume: 0.5,
    loop: true,
  },
  {
    key: BackgroundMusic.GAME_DAY,
    path: 'assets/audio/bgm/game_day.mp3',
    volume: 0.4,
    loop: true,
  },
  {
    key: BackgroundMusic.GAME_NIGHT,
    path: 'assets/audio/bgm/game_night.mp3',
    volume: 0.4,
    loop: true,
  },
  {
    key: BackgroundMusic.GAME_BOSS,
    path: 'assets/audio/bgm/game_boss.mp3',
    volume: 0.5,
    loop: true,
  },
];
