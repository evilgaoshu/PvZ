import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';

/**
 * 普通僵尸
 * 最常见的僵尸
 */
export class NormalZombie extends Zombie {
  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config);

    // 设置颜色 - 普通僵尸是绿色皮肤
    this.setTint(0x8fbc8f);
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  protected checkSpecialAbility(): void {
    // 普通僵尸没有特殊能力
  }
}
