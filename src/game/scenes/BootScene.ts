import { BaseScene } from './BaseScene';
import { GameEvents, GAME_CONFIG } from '@/types/index';
import { AudioManager } from '@managers/AudioManager';

/**
 * 启动场景
 * 负责资源加载和初始化
 */
export class BootScene extends BaseScene {
  private audioManager: AudioManager | null = null;
  private bootCompleted: boolean = false;

  constructor() {
    super({ key: 'BootScene' });
  }

  protected onInit(): void {
    console.log('BootScene initialized');
  }

  protected onPreload(): void {
    this.createLoadingScreen();

    this.audioManager = new AudioManager(this);

    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load: ${file.key}, using fallback`);
    });

    this.audioManager.preload();
    this.loadGameAssets();

    this.load.on('progress', (value: number) => {
      this.updateLoadingProgress(value);
    });

    // 当所有资源加载完成时触发
    this.load.on('complete', () => {
      this.finishBoot();
    });
  }

  private createLoadingScreen(): void {
    const { width, height } = this.getGameSize();
    const centerX = width / 2;
    const centerY = height / 2;
    this.add.rectangle(centerX, centerY, width, height, 0x1a1a2e);
    this.createText(centerX, centerY - 100, '植物大战僵尸', {
      fontSize: '48px',
      color: '#4ade80',
    }).setOrigin(0.5);
    const progressBarBg = this.add.rectangle(
      centerX,
      centerY + 50,
      400,
      30,
      0x334155
    );
    const progressBar = this.add
      .rectangle(centerX - 195, centerY + 50, 0, 20, 0x4ade80)
      .setOrigin(0, 0.5);
    this.registry.set('progressBar', progressBar);
    const progressText = this.createText(centerX, centerY + 100, '0%', {
      fontSize: '18px',
      color: '#94a3b8',
    }).setOrigin(0.5);
    this.registry.set('progressText', progressText);
  }

  private updateLoadingProgress(value: number): void {
    const progressBar = this.registry.get('progressBar');
    const progressText = this.registry.get('progressText');
    if (progressBar) progressBar.width = 390 * value;
    if (progressText) progressText.setText(`${Math.floor(value * 100)}%`);
  }

  private loadGameAssets(): void {
    const plantSize = { width: 100, height: 100 };
    const zombieSize = { width: 100, height: 150 };

    // 植物
    this.load.svg('plants/sunflower', 'assets/images/plants/sunflower.svg', plantSize);
    this.load.svg('plants/peashooter', 'assets/images/plants/peashooter.svg', plantSize);
    this.load.svg('plants/wallnut', 'assets/images/plants/wallnut.svg', plantSize);
    this.load.svg('plants/cherry_bomb', 'assets/images/plants/cherry_bomb.svg', plantSize);
    this.load.svg('plants/snow_pea', 'assets/images/plants/snow_pea.svg', plantSize);
    this.load.svg('plants/repeater', 'assets/images/plants/repeater.svg', plantSize);
    this.load.svg('plants/chomper', 'assets/images/plants/chomper.svg', plantSize);
    this.load.svg('plants/lilypad', 'assets/images/plants/lilypad.svg', plantSize);

    // 僵尸
    this.load.svg('zombies/normal', 'assets/images/zombies/normal.svg', zombieSize);
    this.load.svg('zombies/conehead', 'assets/images/zombies/conehead.svg', zombieSize);
    this.load.svg('zombies/buckethead', 'assets/images/zombies/buckethead.svg', zombieSize);
    this.load.svg('zombies/pole_vaulting', 'assets/images/zombies/pole_vaulting.svg', zombieSize);
    this.load.svg('zombies/newspaper', 'assets/images/zombies/newspaper.svg', zombieSize);
    this.load.svg('zombies/screendoor', 'assets/images/zombies/screendoor.svg', zombieSize);
    this.load.svg('zombies/head', 'assets/images/zombies/head.svg', { width: 60, height: 60 });

    // 投射物
    this.load.svg('pea', 'assets/images/projectiles/pea.svg', { width: 20, height: 20 });
    this.load.svg('snow_pea', 'assets/images/projectiles/snow_pea.svg', { width: 20, height: 20 });

    // 其他
    this.load.svg('day-grass', 'assets/images/backgrounds/day-grass.svg', { width: 800, height: 600 });
    this.load.svg('pool', 'assets/images/backgrounds/pool.svg', { width: 800, height: 600 });
    this.load.svg('ui/sun', 'assets/images/ui/sun.svg', { width: 100, height: 100 });
    this.load.svg('ui/lawn_mower', 'assets/images/ui/lawn_mower.svg', { width: 100, height: 80 });
  }

  private finishBoot(): void {
    if (this.bootCompleted) return;
    this.bootCompleted = true;

    this.updateLoadingProgress(1);
    this.onLoadComplete();
  }

  private onLoadComplete(): void {
    this.audioManager?.init();
    this.game.registry.set('audioManager', this.audioManager);
    this.transitionToMenu();
  }

  private transitionToMenu(): void {
    this.scene.start('MenuScene');
  }

  protected onCreate(): void {
    // 因为改为真正的异步加载，所以 onCreate 里不需要主动调用 finishBoot
    // 如果没有资源加载，Phaser 会直接触发 complete
  }

  protected onUpdate(): void {}

  protected onShutdown(): void {
    this.registry.remove('progressBar');
    this.registry.remove('progressText');
  }
}
