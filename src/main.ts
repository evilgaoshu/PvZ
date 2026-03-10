import Phaser from 'phaser';
import { gameConfig, sceneConfig } from './game/config/GameConfig';
import { BootScene } from './game/scenes/BootScene';
import { MenuScene } from './game/scenes/MenuScene';
import { GameScene } from './game/scenes/GameScene';
import { PauseScene } from './game/scenes/PauseScene';
import { GameOverScene } from './game/scenes/GameOverScene';

/**
 * 游戏主类
 */
class Game {
  private game: Phaser.Game;

  constructor() {
    // 配置游戏
    const config: Phaser.Types.Core.GameConfig = {
      ...gameConfig,
      scene: [
        BootScene,
        MenuScene,
        GameScene,
        PauseScene,
        GameOverScene
      ]
    };

    // 创建Phaser游戏实例
    this.game = new Phaser.Game(config);

    console.log('Game initialized');
  }

  /**
   * 获取Phaser游戏实例
   */
  public getPhaserGame(): Phaser.Game {
    return this.game;
  }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
  // 移除加载提示
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }

  // 创建游戏实例
  const game = new Game();

  // 仅在开发模式下暴露到全局以便调试
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env;
  if (env && env.DEV) {
    (window as any).__debugGame = game;
  }
});

export default Game;
