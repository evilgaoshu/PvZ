import { BaseScene } from './BaseScene';
import { GameEvents, GAME_CONFIG } from '@/types/index';
import { AudioManager } from '@managers/AudioManager';

/**
 * 启动场景
 * 负责资源加载和初始化
 */
export class BootScene extends BaseScene {
  private audioManager: AudioManager | null = null;

  constructor() {
    super({ key: 'BootScene' });
  }

  protected onInit(): void {
    console.log('BootScene initialized');
  }

  protected onPreload(): void {
    // 显示加载进度
    this.createLoadingScreen();

    // 初始化音频管理器并预加载音频
    this.audioManager = new AudioManager(this);

    // 设置加载错误处理
    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load: ${file.key}, using fallback`);
    });

    this.audioManager.preload();

    // 加载游戏资源
    this.loadGameAssets();

    // 监听加载进度
    this.load.on('progress', (value: number) => {
      this.updateLoadingProgress(value);
    });

    this.load.on('complete', () => {
      this.onLoadComplete();
    });
  }

  protected onCreate(): void {
    // 资源加载在preload完成，此处可做一些初始化
  }

  protected onUpdate(): void {
    // 启动场景无需每帧更新
  }

  /**
   * 创建加载界面
   */
  private createLoadingScreen(): void {
    const { width, height } = this.getGameSize();
    const centerX = width / 2;
    const centerY = height / 2;

    // 背景
    this.add.rectangle(centerX, centerY, width, height, 0x1a1a2e);

    // 标题
    const title = this.createText(centerX, centerY - 100, '植物大战僵尸', {
      fontSize: '48px',
      color: '#4ade80',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // 副标题
    const subtitle = this.createText(centerX, centerY - 40, 'Plants vs Zombies', {
      fontSize: '20px',
      color: '#94a3b8'
    });
    subtitle.setOrigin(0.5);

    // 进度条背景
    const progressBarBg = this.add.rectangle(
      centerX,
      centerY + 50,
      400,
      30,
      0x334155
    );
    progressBarBg.setOrigin(0.5);

    // 进度条
    const progressBar = this.add.rectangle(
      centerX - 195,
      centerY + 50,
      0,
      20,
      0x4ade80
    );
    progressBar.setOrigin(0, 0.5);
    this.registry.set('progressBar', progressBar);

    // 进度文字
    const progressText = this.createText(centerX, centerY + 100, '0%', {
      fontSize: '18px',
      color: '#94a3b8'
    });
    progressText.setOrigin(0.5);
    this.registry.set('progressText', progressText);

    // 加载提示
    const loadingTip = this.createText(centerX, centerY + 150, '正在加载资源...', {
      fontSize: '16px',
      color: '#64748b'
    });
    loadingTip.setOrigin(0.5);
  }

  /**
   * 更新加载进度
   */
  private updateLoadingProgress(value: number): void {
    const progressBar = this.registry.get('progressBar') as Phaser.GameObjects.Rectangle;
    const progressText = this.registry.get('progressText') as Phaser.GameObjects.Text;

    if (progressBar) {
      progressBar.width = 390 * value;
    }

    if (progressText) {
      progressText.setText(`${Math.floor(value * 100)}%`);
    }
  }

  /**
   * 加载游戏资源
   */
  private loadGameAssets(): void {
    // 由于目前没有实际资源，我们使用程序化生成的资源
    // 在实际开发中，这里会加载图片、音频等资源

    // 加载植物精灵图
    // this.load.spritesheet('sunflower', 'assets/images/plants/sunflower.png', {
    //   frameWidth: 64,
    //   frameHeight: 64
    // });

    // 加载僵尸精灵图
    // this.load.spritesheet('zombie', 'assets/images/zombies/normal.png', {
    //   frameWidth: 64,
    //   frameHeight: 100
    // });

    // 加载UI图片
    // this.load.image('button', 'assets/images/ui/button.png');

    // 加载音频
    // this.load.audio('bgm', 'assets/audio/bgm/menu.mp3');
    // this.load.audio('plant', 'assets/audio/sfx/plant.mp3');

    // 模拟加载延迟
    for (let i = 0; i < 50; i++) {
      this.load.image(`dummy_${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  }

  /**
   * 加载完成回调
   */
  private onLoadComplete(): void {
    console.log('All assets loaded');

    // 初始化音频
    this.audioManager?.init();

    // 将音频管理器注册到游戏注册表，供其他场景使用
    this.game.registry.set('audioManager', this.audioManager);

    // 延迟一点让用户看到100%
    this.time.delayedCall(500, () => {
      this.transitionToMenu();
    });
  }

  /**
   * 过渡到菜单场景
   */
  private transitionToMenu(): void {
    this.transitionOut(500, () => {
      this.scene.start('MenuScene');
    });
  }

  protected onShutdown(): void {
    // 清理资源
    this.registry.remove('progressBar');
    this.registry.remove('progressText');
    // 注意：不销毁 audioManager，因为它被注册到 game.registry 供全局使用
    // 其生命周期应由全局管理
  }
}
