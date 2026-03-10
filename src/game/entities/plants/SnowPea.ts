import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';

/**
 * 寒冰射手
 * 发射冰冻豌豆，减缓僵尸速度
 */
export class SnowPea extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 发射投射物
   */
  protected fireProjectile(): void {
    super.fireProjectile();

    // 寒冰射手发射的豌豆带减速效果
    // 效果在投射物命中时处理
  }

  /**
   * 设置颜色区分
   */
  protected init(): void {
    super.init();
    // 淡蓝色调
    this.setTint(0xaaddff);
  }
}
