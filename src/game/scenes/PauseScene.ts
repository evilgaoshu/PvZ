import { BaseScene } from './BaseScene';
import { AudioManager } from '@managers/AudioManager';

/**
 * 暂停场景
 * 游戏暂停菜单
 */
export class PauseScene extends BaseScene {
  private audioManager: AudioManager | null = null;

  constructor() {
    super({ key: 'PauseScene' });
  }

  protected onInit(): void {
    console.log('PauseScene initialized');
    // 获取音频管理器
    this.audioManager = this.game.registry.get('audioManager') as AudioManager;
  }

  protected onPreload(): void {
    // 无需预加载
  }

  protected onCreate(): void {
    this.createOverlay();
    this.createMenu();

    // 淡入
    this.transitionIn(200);
  }

  protected onUpdate(): void {
    // 无需更新
  }

  /**
   * 创建半透明遮罩
   */
  private createOverlay(): void {
    const { width, height } = this.getGameSize();

    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.7
    );
    overlay.setInteractive();
  }

  /**
   * 创建暂停菜单
   */
  private createMenu(): void {
    const { width, height } = this.getGameSize();
    const centerX = width / 2;
    const centerY = height / 2;

    // 菜单容器
    const menuContainer = this.add.container(centerX, centerY);

    // 背景面板
    const panel = this.add.rectangle(0, 0, 300, 250, 0x1e293b, 0.95);
    panel.setStrokeStyle(3, 0x4ade80);
    menuContainer.add(panel);

    // 标题
    const title = this.createText(0, -80, '游戏暂停', {
      fontSize: '32px',
      color: '#4ade80'
    });
    title.setOrigin(0.5);
    menuContainer.add(title);

    // 继续按钮
    const resumeBtn = this.createButton(
      0,
      -20,
      200,
      45,
      '▶️ 继续游戏',
      () => this.resumeGame()
    );
    menuContainer.add(resumeBtn);

    // 重新开始按钮
    const restartBtn = this.createButton(
      0,
      40,
      200,
      45,
      '🔄 重新开始',
      () => this.restartGame()
    );
    menuContainer.add(restartBtn);

    // 返回菜单按钮
    const menuBtn = this.createButton(
      0,
      100,
      200,
      45,
      '🏠 返回主菜单',
      () => this.returnToMenu()
    );
    menuContainer.add(menuBtn);

    // 入场动画
    menuContainer.setScale(0.8);
    menuContainer.setAlpha(0);

    this.tweens.add({
      targets: menuContainer,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  /**
   * 继续游戏
   */
  private resumeGame(): void {
    // 播放按钮音效
    this.audioManager?.playSfx('button_click');
    this.transitionOut(200, () => {
      const gameScene = this.scene.get('GameScene') as any;
      if (gameScene?.resumeGame) {
        gameScene.resumeGame();
      }
      this.scene.stop();
      this.scene.resume('GameScene');
    });
  }

  /**
   * 重新开始
   */
  private restartGame(): void {
    // 播放按钮音效
    this.audioManager?.playSfx('button_click');
    this.transitionOut(200, () => {
      this.scene.stop();
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    });
  }

  /**
   * 返回主菜单
   */
  private returnToMenu(): void {
    // 播放按钮音效
    this.audioManager?.playSfx('button_click');
    this.transitionOut(200, () => {
      this.scene.stop();
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });
  }

  protected onShutdown(): void {
    // 清理
  }
}
