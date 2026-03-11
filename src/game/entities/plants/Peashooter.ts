import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { VisualEffects } from '@utils/VisualEffects';

/**
 * 豌豆射手
 * 发射豌豆攻击僵尸
 */
export class Peashooter extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 发射投射物时的特效
   */
  protected fireProjectile(): void {
    super.fireProjectile();

    // 嘴巴张开回弹效果
    VisualEffects.bounceScale(this, 1.15, 200);
  }
}
