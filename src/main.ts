import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { MenuScene } from './game/scenes/MenuScene';
import { GameScene } from './game/scenes/GameScene';
import { PauseScene } from './game/scenes/PauseScene';
import { GameOverScene } from './game/scenes/GameOverScene';
import { EditorScene } from './game/scenes/EditorScene';
import { GAME_CONFIG } from './types/index';
import { Logger } from '@game/utils/Logger';

/**
 * 游戏主类
 */
export class Game extends Phaser.Game {
  constructor() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_CONFIG.DESIGN_WIDTH,
      height: GAME_CONFIG.DESIGN_HEIGHT,
      parent: 'game-container',
      backgroundColor: '#000000',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: GAME_CONFIG.DEBUG,
        },
      },
      scene: [
        BootScene,
        MenuScene,
        GameScene,
        PauseScene,
        GameOverScene,
        EditorScene,
      ],
    };

    super(config);
    Logger.log('Game initialized');
  }
}

// 当页面加载完成后启动游戏
window.addEventListener('load', () => {
  // 创建游戏实例
  const game = new Game();

  // 仅在开发模式下暴露到全局以便调试
  const env = import.meta.env;
  if (env && env.DEV) {
    (window as any).__debugGame = game;
  }
});

export default Game;
