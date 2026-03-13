import { GRID_CONFIG, GAME_CONFIG } from '@/types/index';
import { SpinePlugin } from '@esotericsoftware/spine-phaser';

/**
 * Phaser游戏配置类型
 */
interface PhaserGameConfig extends Phaser.Types.Core.GameConfig {
  // 扩展配置
}

/**
 * 游戏主配置
 */
export const gameConfig: PhaserGameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.DESIGN_WIDTH,
  height: GAME_CONFIG.DESIGN_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  title: GAME_CONFIG.TITLE,
  version: '1.0.0',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 400,
      height: 300,
    },
    max: {
      width: 1600,
      height: 1200,
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: GAME_CONFIG.DEBUG,
      fps: 60,
      timeScale: 1,
    },
  },
  plugins: {
    scene: [{ key: 'SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }],
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  disableContextMenu: true,
  banner: {
    hidePhaser: false,
    text: '#ffffff',
    background: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560'],
  },
};

/**
 * 场景配置
 */
export const sceneConfig = {
  // 启动场景
  boot: {
    key: 'BootScene',
    active: true,
  },

  // 菜单场景
  menu: {
    key: 'MenuScene',
    active: false,
  },

  // 游戏场景
  game: {
    key: 'GameScene',
    active: false,
  },

  // 暂停场景
  pause: {
    key: 'PauseScene',
    active: false,
  },

  // 游戏结束场景
  gameOver: {
    key: 'GameOverScene',
    active: false,
  },
};
