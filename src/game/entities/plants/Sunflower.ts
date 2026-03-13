import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents, ECONOMY_CONFIG } from '@/types/index';

/**
 * 向日葵
 * 生产阳光
 */
export class Sunflower extends Plant {
  private lastProduceTime: number = 0;
  private isProducing: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupAnimations(): void {
    // 创建动画
    if (!this.scene.anims.exists('sunflower_idle')) {
      // 使用颜色渐变模拟动画
      // 实际项目中应该有精灵图
    }

    if (!this.scene.anims.exists('sunflower_produce')) {
      // 生产动画
    }
  }

  /**
   * 更新特殊能力 - 生产阳光
   */
  protected updateSpecialAbility(time: number, _delta: number): void {
    // 检查是否可以生产阳光
    const produceInterval =
      this.config.produceInterval || ECONOMY_CONFIG.SUNFLOWER.PRODUCE_INTERVAL;

    if (time - this.lastProduceTime >= produceInterval && !this.isProducing) {
      this.produceSun(time);
    }
  }

  /**
   * 生产阳光
   */
  private produceSun(time: number): void {
    this.isProducing = true;
    this.lastProduceTime = time;

    // 播放生产动画
    this.playProduceAnimation();

    // 延迟生成阳光
    this.scene.time.delayedCall(500, () => {
      // 生成阳光
      const sunAmount =
        this.config.produceAmount || ECONOMY_CONFIG.SUNFLOWER.PRODUCE_AMOUNT;

      this.scene.game.events.emit('economy:spawn_plant_sun', {
        x: this.x,
        y: this.y - 30,
        amount: sunAmount,
      });

      // 恢复空闲
      this.scene.time.delayedCall(500, () => {
        this.isProducing = false;
        if (this.isPlantAlive()) {
          this.playIdleAnimation();
        }
      });
    });
  }

  /**
   * 播放生产动画
   */
  private playProduceAnimation(): void {
    // 上下弹跳效果
    this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 200,
      yoyo: true,
      repeat: 1,
      ease: 'Power1',
    });

    // 发光效果
    const glow = this.scene.add.ellipse(this.x, this.y, 80, 100, 0xfcd34d, 0.5);
    this.scene.tweens.add({
      targets: glow,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      onComplete: () => {
        glow.destroy();
      },
    });
  }

  /**
   * 向日葵不需要攻击
   */
  protected canAttack(): boolean {
    return false;
  }
}
