import { BaseScene } from './BaseScene';
import { BackgroundMusic } from '@config/AudioConfig';
import { AudioManager } from '@managers/AudioManager';

/**
 * 主菜单场景
 */
export class MenuScene extends BaseScene {
  private menuContainer: Phaser.GameObjects.Container | null = null;
  private audioManager: AudioManager | null = null;

  constructor() {
    super({ key: 'MenuScene' });
  }

  protected onInit(): void {
    console.log('MenuScene initialized');
    // 从注册表获取音频管理器
    this.audioManager = this.game.registry.get('audioManager') as AudioManager;
  }

  protected onPreload(): void {
    // 菜单场景资源已在BootScene加载
  }

  protected onCreate(): void {
    this.createBackground();
    this.createTitle();
    this.createMenuButtons();
    this.createVersion();

    // 播放菜单背景音乐
    this.audioManager?.playBgm(BackgroundMusic.MENU);

    // 淡入效果
    this.transitionIn(500);
  }

  protected onUpdate(): void {
    // 菜单动画可以在这里更新
  }

  /**
   * 创建背景
   */
  private createBackground(): void {
    const { width, height } = this.getGameSize();

    // 深色背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // 装饰性网格线
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x334155, 0.3);

    // 垂直线
    for (let x = 0; x <= width; x += 50) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, height);
    }

    // 水平线
    for (let y = 0; y <= height; y += 50) {
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
    }

    graphics.strokePath();
  }

  /**
   * 创建标题
   */
  private createTitle(): void {
    const { width, height } = this.getGameSize();
    const centerX = width / 2;

    // 主标题
    const title = this.createText(centerX, 150, '植物大战僵尸', {
      fontSize: '56px',
      color: '#4ade80',
      strokeThickness: 8
    });
    title.setOrigin(0.5);

    // 添加动画
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 英文副标题
    const subtitle = this.createText(centerX, 220, 'Plants vs Zombies', {
      fontSize: '24px',
      color: '#94a3b8'
    });
    subtitle.setOrigin(0.5);
  }

  /**
   * 创建菜单按钮
   */
  private createMenuButtons(): void {
    const { width, height } = this.getGameSize();
    const centerX = width / 2;
    const startY = 300;

    this.menuContainer = this.add.container(0, 0);

    // 冒险模式按钮
    const adventureBtn = this.createButton(
      centerX,
      startY,
      240,
      50,
      '🎮 冒险模式',
      () => this.startAdventureMode()
    );
    this.menuContainer.add(adventureBtn);

    // 小游戏按钮
    const miniGamesBtn = this.createButton(
      centerX,
      startY + 70,
      240,
      50,
      '🎯 小游戏',
      () => this.showMiniGames()
    );
    this.menuContainer.add(miniGamesBtn);

    // 设置按钮
    const settingsBtn = this.createButton(
      centerX,
      startY + 140,
      240,
      50,
      '⚙️ 设置',
      () => this.showSettings()
    );
    this.menuContainer.add(settingsBtn);

    // 退出按钮
    const exitBtn = this.createButton(
      centerX,
      startY + 210,
      240,
      50,
      '🚪 退出',
      () => this.exitGame()
    );
    this.menuContainer.add(exitBtn);

    // 按钮入场动画
    this.menuContainer.each((child: Phaser.GameObjects.GameObject) => {
      const container = child as Phaser.GameObjects.Container;
      container.setAlpha(0);
      container.y += 20;

      this.tweens.add({
        targets: container,
        alpha: 1,
        y: container.y - 20,
        duration: 400,
        delay: 100 + this.menuContainer!.list.indexOf(child) * 100,
        ease: 'Power2'
      });
    });
  }

  /**
   * 创建版本信息
   */
  private createVersion(): void {
    const { width, height } = this.getGameSize();

    const version = this.createText(width - 20, height - 20, 'v1.0.0', {
      fontSize: '14px',
      color: '#64748b'
    });
    version.setOrigin(1, 1);
  }

  /**
   * 开始冒险模式
   */
  private startAdventureMode(): void {
    // 播放按钮音效
    this.audioManager?.playSfx('button_click');
    console.log('Starting adventure mode');
    this.switchScene('GameScene', { levelId: '1-1' });
  }

  /**
   * 显示小游戏
   */
  private showMiniGames(): void {
    // 播放按钮音效
    this.audioManager?.playSfx('button_click');
    console.log('Showing mini games');
    // TODO: 实现小游戏菜单
  }

  /**
   * 显示设置
   */
  private showSettings(): void {
    // 播放按钮音效
    this.audioManager?.playSfx('button_click');
    console.log('Showing settings');
    // TODO: 实现设置菜单
  }

  /**
   * 退出游戏
   */
  private exitGame(): void {
    // 播放按钮音效
    this.audioManager?.playSfx('button_click');
    if (confirm('确定要退出游戏吗？')) {
      window.close();
      // 如果无法关闭窗口，显示提示
      alert('您可以手动关闭浏览器标签页');
    }
  }
}
