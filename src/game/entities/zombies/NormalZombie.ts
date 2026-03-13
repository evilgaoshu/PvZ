import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';

/**
 * 普通僵尸
 * 最常见的僵尸
 */
export class NormalZombie extends Zombie {
  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config);
    // 移除强烈的 tint，保留原始贴图颜色
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  protected checkSpecialAbility(): void {
    // 普通僵尸没有特殊能力
  }
}
