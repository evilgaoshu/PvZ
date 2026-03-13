import Phaser from 'phaser';
import { ECONOMY_CONFIG, GameEvents } from '@/types/index';
import type { SunSource, SunCollectedEventData } from '@/types/config';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect } from '@config/AudioConfig';
import { VisualEffects } from '@utils/VisualEffects';
import { ObjectPool } from '@game/utils/ObjectPool';

type PooledSun = Phaser.GameObjects.Container & {
  sunGraphics: Phaser.GameObjects.Graphics;
  sunText: Phaser.GameObjects.Text;
  hitArea: Phaser.GameObjects.Rectangle;
  despawnTimer: Phaser.Time.TimerEvent | null;
  amount: number;
  sourceType: SunSource;
  isCollected: boolean;
};

/**
 * 经济系统
 * 管理阳光资源的生成、收集和消耗
 */
export class EconomySystem {
  private scene: Phaser.Scene;
  private audioManager: AudioManager | null = null;

  // 当前阳光数量
  private sun: number = ECONOMY_CONFIG.INITIAL_SUN;

  // 阳光上限
  private readonly maxSun: number = ECONOMY_CONFIG.MAX_SUN;

  // 自然掉落阳光的定时器
  private fallingSunTimer: Phaser.Time.TimerEvent | null = null;

  // 天空掉落阳光的配置
  private readonly fallingSunConfig = ECONOMY_CONFIG.FALLING_SUN;

  // 阳光对象池
  private sunPool!: ObjectPool<PooledSun>;
  private activeSuns: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.audioManager = this.scene.game.registry.get('audioManager') as AudioManager;
    this.init();
  }

  /**
   * 初始化
   */
  private init(): void {
    this.sunPool = this.createSunPool();

    // 发送初始阳光值
    this.emitSunChanged();

    // 启动自然掉落阳光
    this.startFallingSunSpawner();

    console.log('EconomySystem initialized with sun:', this.sun);
  }

  /**
   * 启动自然掉落阳光生成器
   */
  private startFallingSunSpawner(): void {
    const spawnNextSun = () => {
      const delay = Phaser.Math.Between(
        this.fallingSunConfig.MIN_INTERVAL,
        this.fallingSunConfig.MAX_INTERVAL
      );

      this.fallingSunTimer = this.scene.time.delayedCall(delay, () => {
        this.spawnFallingSun();
        spawnNextSun();
      });
    };

    spawnNextSun();
  }

  /**
   * 生成天空掉落的阳光
   */
  public spawnFallingSun(x?: number, y?: number): void {
    const { width } = this.scene.cameras.main;

    // 随机X位置或指定位置
    const startX = x ?? Phaser.Math.Between(100, width - 100);
    const startY = y ?? -30;
    const targetY = Phaser.Math.Between(200, 450);

    // 创建阳光
    const sun = this.createSun(startX, startY, 'falling');

    // 播放阳光掉落音效
    this.audioManager?.playSfx(SoundEffect.SUN_FALLING);

    // 掉落动画
    this.scene.tweens.add({
      targets: sun,
      y: targetY,
      duration: this.fallingSunConfig.FALL_DURATION,
      ease: 'Power1',
      onComplete: () => {
        // 落地后开始消失倒计时
        this.scene.time.delayedCall(
          this.fallingSunConfig.LIFETIME - this.fallingSunConfig.FALL_DURATION,
          () => {
            this.removeSun(sun);
          }
        );
      }
    });
  }

  /**
   * 生成植物产生的阳光
   */
  public spawnPlantSun(x: number, y: number, amount: number = 25): void {
    const sun = this.createSun(x, y, 'plant', amount);

    const targetX = x + Phaser.Math.Between(-40, 40);
    const targetY = y + Phaser.Math.Between(10, 30);

    // X轴线性平移
    this.scene.tweens.add({
      targets: sun,
      x: targetX,
      duration: 600,
      ease: 'Linear'
    });

    // Y轴先上后下（抛物线 + 弹跳）
    this.scene.tweens.add({
      targets: sun,
      y: y - 40,
      duration: 300,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: sun,
          y: targetY,
          duration: 300,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            // 一段时间后消失
            this.scene.time.delayedCall(8000, () => {
              this.removeSun(sun);
            });
          }
        });
      }
    });
  }

  private createSunPool(): ObjectPool<PooledSun> {
    return new ObjectPool<PooledSun>(
      this.scene,
      (scene) => this.createSunObject(scene),
      (sun) => this.resetSunObject(sun),
      24
    );
  }

  private createSunObject(scene: Phaser.Scene): PooledSun {
    const container = scene.add.container(-100, -100) as PooledSun;

    const sunGraphics = scene.add.graphics();
    sunGraphics.fillStyle(0xfcd34d, 1);
    sunGraphics.fillCircle(0, 0, 15);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rayX = Math.cos(angle) * 25;
      const rayY = Math.sin(angle) * 25;
      sunGraphics.fillStyle(0xfcd34d, 0.6);
      sunGraphics.fillCircle(rayX, rayY, 5);
    }
    container.add(sunGraphics);

    const text = scene.add.text(0, 35, '25', {
      fontSize: '14px',
      color: '#f59e0b',
      stroke: '#000000',
      strokeThickness: 3
    });
    text.setOrigin(0.5);
    container.add(text);

    const hitArea = scene.add.rectangle(0, 0, 60, 60, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    container.sunGraphics = sunGraphics;
    container.sunText = text;
    container.hitArea = hitArea;
    container.despawnTimer = null;
    container.amount = 25;
    container.sourceType = 'plant';
    container.isCollected = false;

    hitArea.on('pointerdown', () => {
      if (container.isCollected || !container.active) return;

      container.isCollected = true;
      hitArea.disableInteractive();

      VisualEffects.bounceScale(container, 1.3, 150);
      VisualEffects.createSplat(this.scene, container.x, container.y, 0xfef08a, 6);

      this.collectSun(container, container.amount, container.sourceType);
    });

    return container;
  }

  private resetSunObject(sun: PooledSun): void {
    this.clearSunLifecycle(sun);
    sun.setPosition(-100, -100);
    sun.setAlpha(1);
    sun.setScale(1);
    sun.setAngle(0);
    sun.sunGraphics.setRotation(0);
    sun.sunText.setText('25');
    sun.amount = 25;
    sun.sourceType = 'plant';
    sun.isCollected = false;
    sun.hitArea.setInteractive({ useHandCursor: true });
  }

  private clearSunLifecycle(sun: PooledSun): void {
    const index = this.activeSuns.indexOf(sun);
    if (index > -1) {
      this.activeSuns.splice(index, 1);
    }

    if (sun.despawnTimer) {
      sun.despawnTimer.remove();
      sun.despawnTimer = null;
    }

    this.scene.tweens.killTweensOf(sun);
    this.scene.tweens.killTweensOf(sun.sunGraphics);
  }

  private recycleSun(sun: PooledSun): void {
    this.clearSunLifecycle(sun);
    this.sunPool.recycle(sun);
  }

  /**
   * 创建阳光对象
   */
  private createSun(x: number, y: number, source: SunSource, amount: number = 25): PooledSun {
    const sun = this.sunPool.get();

    sun.setPosition(x, y);
    sun.setAlpha(1);
    sun.setScale(1);
    sun.amount = amount;
    sun.sourceType = source;
    sun.isCollected = false;
    sun.sunText.setText(amount.toString());
    sun.hitArea.setInteractive({ useHandCursor: true });

    this.scene.tweens.add({
      targets: sun,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.scene.tweens.add({
      targets: sun.sunGraphics,
      rotation: Math.PI * 2,
      duration: 10000,
      repeat: -1,
      ease: 'Linear'
    });

    this.activeSuns.push(sun);
    return sun;
  }

  /**
   * 收集阳光
   */
  private collectSun(sun: PooledSun, amount: number, source: SunSource): void {
    // 播放阳光收集音效
    this.audioManager?.playSfx(SoundEffect.SUN_COLLECT);

    this.clearSunLifecycle(sun);

    // 漂浮文字
    VisualEffects.floatText(this.scene, sun.x, sun.y, `+${amount}`, {
      color: '#fbbf24',
      fontSize: '24px'
    });

    // 收集动画 - 飞向阳光计数器
    this.scene.tweens.add({
      targets: sun,
      x: 50,
      y: 40,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 500,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.recycleSun(sun);
        this.addSun(amount, source);
      }
    });
  }

  /**
   * 移除阳光
   */
  private removeSun(sun: PooledSun): void {
    if (!sun.active) return;

    this.clearSunLifecycle(sun);

    // 淡出动画
    this.scene.tweens.add({
      targets: sun,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.recycleSun(sun);
      }
    });
  }

  /**
   * 增加阳光
   */
  public addSun(amount: number, source: SunSource = 'plant'): void {
    this.sun = Math.min(this.sun + amount, this.maxSun);
    this.emitSunChanged();

    // 发送收集事件
    const eventData: SunCollectedEventData = {
      amount,
      source
    };
    this.scene.game.events.emit(GameEvents.SUN_COLLECTED, eventData);

    console.log(`Sun added: ${amount}, total: ${this.sun}`);
  }

  /**
   * 消耗阳光
   */
  public spend(amount: number): boolean {
    if (this.sun < amount) {
      return false;
    }

    this.sun -= amount;
    this.emitSunChanged();

    console.log(`Sun spent: ${amount}, remaining: ${this.sun}`);
    return true;
  }

  /**
   * 检查是否负担得起
   */
  public canAfford(amount: number): boolean {
    return this.sun >= amount;
  }

  /**
   * 获取当前阳光
   */
  public getSun(): number {
    return this.sun;
  }

  /**
   * 发射阳光变化事件
   */
  private emitSunChanged(): void {
    this.scene.game.events.emit(GameEvents.SUN_CHANGED, this.sun);
  }

  /**
   * 更新
   */
  public update(delta: number): void {
    // 可以在这里更新需要每帧处理的经济逻辑
  }

  /**
   * 清理
   */
  public destroy(): void {
    // 清除定时器
    if (this.fallingSunTimer) {
      this.fallingSunTimer.remove();
      this.fallingSunTimer = null;
    }

    [...this.activeSuns].forEach((sun) => {
      this.recycleSun(sun as PooledSun);
    });
    this.activeSuns = [];
    this.sunPool.destroy();
  }
}
