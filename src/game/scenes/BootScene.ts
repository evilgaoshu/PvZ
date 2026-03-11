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
  }

  private createProceduralAssets(): void {
    this.createPlantTexture('plants/sunflower', 0xfcd34d);
    this.createPlantTexture('plants/peashooter', 0x4ade80);
    this.createPlantTexture('plants/wallnut', 0x92400e);
    this.createPlantTexture('plants/cherry_bomb', 0xef4444);
    this.createPlantTexture('plants/snow_pea', 0x60a5fa);
    this.createPlantTexture('plants/repeater', 0x166534);
    this.createPlantTexture('plants/chomper', 0x7e22ce);

    this.createZombieTexture('zombies/normal', 0x8fbc8f);
    this.createZombieTexture('zombies/conehead', 0x8fbc8f, 0xf97316);
    this.createZombieTexture('zombies/buckethead', 0x8fbc8f, 0x94a3b8);
    this.createZombieTexture('zombies/pole_vaulting', 0x8fbc8f);
    this.createZombieTexture('zombies/newspaper', 0x8fbc8f);
    this.createZombieTexture('zombies/screendoor', 0x8fbc8f);

    this.createProjectileTexture('pea', 0x4ade80);
    this.createProjectileTexture('snow_pea', 0x60a5fa);
    this.createBackgroundTexture('day-grass', 0x4ade80);
  }

  private createPlantTexture(key: string, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    const center = 32;

    // 基础根茎
    graphics.fillStyle(0x15803d, 1);
    graphics.fillRect(center - 5, center + 10, 10, 20);

    if (key.includes('sunflower')) {
      graphics.fillStyle(0xfde047, 1);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        graphics.fillCircle(
          center + Math.cos(angle) * 15,
          center - 5 + Math.sin(angle) * 15,
          10
        );
      }
      graphics.fillStyle(0x78350f, 1);
      graphics.fillCircle(center, center - 5, 12);
    } else if (
      key.includes('peashooter') ||
      key.includes('repeater') ||
      key.includes('snow_pea')
    ) {
      graphics.fillStyle(color, 1);
      graphics.fillCircle(center, center - 5, 18);
      graphics.fillRect(center, center - 10, 25, 10); // 简化喷管
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(center + 5, center - 10, 3);
    } else if (key.includes('wallnut')) {
      graphics.fillStyle(0x92400e, 1);
      graphics.fillEllipse(center, center, 25, 32);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(center - 8, center - 5, 6);
      graphics.fillCircle(center + 8, center - 5, 6);
    } else {
      graphics.fillStyle(color, 1);
      graphics.fillCircle(center, center, 25);
    }

    graphics.generateTexture(key, 64, 64);
    graphics.destroy();
  }

  private createZombieTexture(
    key: string,
    color: number,
    armorColor?: number
  ): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    const centerX = 32;

    graphics.fillStyle(0x1e3a8a, 1);
    graphics.fillRect(centerX - 15, 60, 30, 30);
    graphics.fillStyle(0x451a03, 1);
    graphics.fillRect(centerX - 18, 30, 36, 35);
    graphics.fillStyle(color, 1);
    graphics.fillCircle(centerX, 20, 18);

    if (armorColor) {
      graphics.fillStyle(armorColor, 1);
      graphics.fillRect(centerX - 15, 0, 30, 15);
    }

    graphics.generateTexture(key, 64, 100);
    graphics.destroy();
  }

  private createProjectileTexture(key: string, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(color, 1);
    graphics.fillCircle(10, 10, 8);
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(7, 7, 3);
    graphics.generateTexture(key, 20, 20);
    graphics.destroy();
  }

  private createBackgroundTexture(key: string, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 800, 600);
    graphics.fillStyle(0x166534, 0.3);
    for (let i = 0; i < 100; i++) {
      graphics.fillRect(Math.random() * 800, Math.random() * 600, 20, 5);
    }
    graphics.generateTexture(key, 800, 600);
    graphics.destroy();
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
    // 模拟一些小资源确保加载队列不为空
    for (let i = 0; i < 10; i++) {
      this.load.image(
        `load_tick_${i}`,
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      );
    }
  }

  private finishBoot(): void {
    if (this.bootCompleted) return;
    this.bootCompleted = true;

    this.updateLoadingProgress(1);

    try {
      this.createProceduralAssets();
    } catch (error) {
      console.error('Error creating procedural assets:', error);
    }

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
    this.finishBoot();
  }
  protected onUpdate(): void {}
  protected onShutdown(): void {
    this.registry.remove('progressBar');
    this.registry.remove('progressText');
  }
}
