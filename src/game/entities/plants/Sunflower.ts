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
    // 动画现在由 plantConfigs.ts 定义并由 BootScene 加载
    // 这里可以留空或实现特殊的缩放动画
    this.playIdleAnimation();
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
   * 播放生产阳光动画
   */
  private playProduceAnimation(): void {
    // 简单的缩放发光感，不添加额外遮挡物
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  /**
   * 向日葵不需要攻击
   */
  protected canAttack(): boolean {
    return false;
  }
}
