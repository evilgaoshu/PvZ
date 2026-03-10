import Phaser from 'phaser';
import { ECONOMY_CONFIG, GameEvents } from '@/types/index';
import type { SunSource, SunCollectedEventData } from '@/types/config';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect } from '@config/AudioConfig';

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

  // 收集的阳光对象池（未实现，预留）
  // private sunPool: Phaser.GameObjects.Container[] = [];
  private activeSuns: Phaser.GameObjects.Container[] = [];

  // 事件监听引用
  private sunCollectedCallback: ((data: SunCollectedEventData) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.audioManager = this.scene.game.registry.get('audioManager') as AudioManager;
    this.init();
  }

  /**
   * 初始化
   */
  private init(): void {
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

    // 植物产生的阳光稍微向上漂浮后停留
    this.scene.tweens.add({
      targets: sun,
      y: y - 30,
      duration: 500,
      ease: 'Power1',
      onComplete: () => {
        // 一段时间后消失
        this.scene.time.delayedCall(5000, () => {
          this.removeSun(sun);
        });
      }
    });
  }

  /**
   * 创建阳光对象
   */
  private createSun(x: number, y: number, source: SunSource, amount: number = 25): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // 阳光图形
    const sunGraphics = this.scene.add.graphics();
    sunGraphics.fillStyle(0xfcd34d, 1);

    // 绘制阳光形状（圆形带光芒）
    sunGraphics.fillCircle(0, 0, 15);

    // 光芒
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rayX = Math.cos(angle) * 25;
      const rayY = Math.sin(angle) * 25;
      sunGraphics.fillStyle(0xfcd34d, 0.6);
      sunGraphics.fillCircle(rayX, rayY, 5);
    }

    container.add(sunGraphics);

    // 数值文字
    const text = this.scene.add.text(0, 35, amount.toString(), {
      fontSize: '14px',
      color: '#f59e0b',
      stroke: '#000000',
      strokeThickness: 3
    });
    text.setOrigin(0.5);
    container.add(text);

    // 缩放动画
    this.scene.tweens.add({
      targets: container,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 旋转动画
    this.scene.tweens.add({
      targets: sunGraphics,
      rotation: Math.PI * 2,
      duration: 10000,
      repeat: -1,
      ease: 'Linear'
    });

    // 交互
    const hitArea = this.scene.add.rectangle(0, 0, 60, 60, 0xffffff, 0);
    container.add(hitArea);

    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      this.collectSun(container, amount, source);
    });

    // 存储到活动列表
    this.activeSuns.push(container);

    return container;
  }

  /**
   * 收集阳光
   */
  private collectSun(sun: Phaser.GameObjects.Container, amount: number, source: SunSource): void {
    // 播放阳光收集音效
    this.audioManager?.playSfx(SoundEffect.SUN_COLLECT);

    // 收集动画 - 飞向阳光计数器
    this.scene.tweens.add({
      targets: sun,
      x: 50,
      y: 40,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.removeSun(sun);
        this.addSun(amount, source);
      }
    });
  }

  /**
   * 移除阳光
   */
  private removeSun(sun: Phaser.GameObjects.Container): void {
    const index = this.activeSuns.indexOf(sun);
    if (index > -1) {
      this.activeSuns.splice(index, 1);
    }

    // 淡出动画
    this.scene.tweens.add({
      targets: sun,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        sun.destroy();
      }
    });
  }

  /**
   * 增加阳光
   */
  public addSun(amount: number, source: SunSource = 'cheat'): void {
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

    // 停止所有阳光的动画
    this.activeSuns.forEach(sun => {
      this.scene.tweens.killTweensOf(sun);
      sun.destroy();
    });
    this.activeSuns = [];
  }
}
