import { BaseScene } from './BaseScene';
import { BackgroundMusic } from '@config/AudioConfig';
import { AudioManager } from '@managers/AudioManager';
import { GameButton } from '@ui/components/GameButton';

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
      strokeThickness: 8,
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
      ease: 'Sine.easeInOut',
    });

    // 英文副标题
    const subtitle = this.createText(centerX, 220, 'Plants vs Zombies', {
      fontSize: '24px',
      color: '#94a3b8',
    });
    subtitle.setOrigin(0.5);
  }

  /**
   * 创建菜单按钮
   */
  private createMenuButtons(): void {
    const { width, height } = this.getGameSize();
    const centerX = width / 2;
    const startY = 320;

    this.menuContainer = this.add.container(0, 0);

    const buttonConfigs = [
      {
        text: '🎮 冒险模式',
        callback: () => this.startAdventureMode(),
        color: 0x4ade80,
      },
      {
        text: '🛠️ 关卡编辑器',
        callback: () => this.scene.start('EditorScene'),
        color: 0x8b5cf6,
      },
      {
        text: '🎯 小游戏',
        callback: () => this.showMiniGames(),
        color: 0x3b82f6,
      },
      { text: '⚙️ 设置', callback: () => this.showSettings(), color: 0xf59e0b },
      { text: '🚪 退出', callback: () => this.exitGame(), color: 0xef4444 },
    ];

    buttonConfigs.forEach((cfg, index) => {
      const btn = new GameButton(
        this,
        centerX,
        startY + index * 70,
        {
          width: 260,
          height: 54,
          text: cfg.text,
          backgroundColor: cfg.color,
          hoverColor: Phaser.Display.Color.IntegerToColor(cfg.color).lighten(10)
            .color,
          borderRadius: 12,
        },
        cfg.callback
      );

      this.menuContainer?.add(btn);

      // 入场动画
      btn.setAlpha(0);
      btn.y += 30;
      this.tweens.add({
        targets: btn,
        alpha: 1,
        y: btn.y - 30,
        duration: 500,
        delay: 200 + index * 100,
        ease: 'Back.easeOut',
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
      color: '#64748b',
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
    this.audioManager?.playSfx('button_click');

    const { width, height } = this.getGameSize();
    const overlay = this.add.container(0, 0);
    overlay.setDepth(100);

    // 遮罩
    const bg = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.8
    );
    bg.setInteractive();
    overlay.add(bg);

    const panel = this.add.container(width / 2, height / 2);
    overlay.add(panel);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x422006, 1);
    panelBg.fillRoundedRect(-200, -150, 400, 300, 15);
    panelBg.lineStyle(4, 0x78350f, 1);
    panelBg.strokeRoundedRect(-200, -150, 400, 300, 15);
    panel.add(panelBg);

    panel.add(
      this.add
        .text(0, -120, '选择关卡', { fontSize: '28px', color: '#fcd34d' })
        .setOrigin(0.5)
    );

    const levels = [
      { id: '1-1', name: '1-1 基础教学' },
      { id: '1-4', name: '1-4 泳池挑战' },
      { id: '1-5', name: '1-5 摩天大楼' },
    ];

    levels.forEach((lvl, i) => {
      const btn = new GameButton(
        this,
        0,
        -50 + i * 60,
        {
          text: lvl.name,
          width: 300,
          height: 45,
          backgroundColor: 0x15803d,
        },
        () => {
          this.switchScene('GameScene', { levelId: lvl.id });
        }
      );
      panel.add(btn);
    });

    const closeBtn = new GameButton(
      this,
      0,
      110,
      {
        text: '关闭',
        width: 100,
        backgroundColor: 0xef4444,
      },
      () => overlay.destroy()
    );
    panel.add(closeBtn);
  }

  /**
   * 显示设置
   */
  private showSettings(): void {
    this.audioManager?.playSfx('button_click');

    const { width, height } = this.getGameSize();
    const overlay = this.add.container(0, 0);
    overlay.setDepth(100);

    const bg = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.8
    );
    bg.setInteractive();
    overlay.add(bg);

    const panel = this.add.container(width / 2, height / 2);
    overlay.add(panel);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1e293b, 1);
    panelBg.fillRoundedRect(-150, -100, 300, 200, 15);
    panelBg.lineStyle(4, 0x334155, 1);
    panelBg.strokeRoundedRect(-150, -100, 300, 200, 15);
    panel.add(panelBg);

    panel.add(
      this.add
        .text(0, -70, '游戏设置', { fontSize: '24px', color: '#fff' })
        .setOrigin(0.5)
    );

    const isMuted = this.audioManager?.getIsMuted() || false;
    const muteBtn = new GameButton(
      this,
      0,
      0,
      {
        text: isMuted ? '🔇 开启声音' : '🔊 关闭声音',
        width: 200,
        backgroundColor: isMuted ? 0xef4444 : 0x15803d,
      },
      () => {
        this.audioManager?.setMuted(!isMuted);
        overlay.destroy();
        this.showSettings(); // 刷新显示
      }
    );
    panel.add(muteBtn);

    const closeBtn = new GameButton(
      this,
      0,
      60,
      {
        text: '确定',
        width: 100,
        backgroundColor: 0x64748b,
      },
      () => overlay.destroy()
    );
    panel.add(closeBtn);
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
