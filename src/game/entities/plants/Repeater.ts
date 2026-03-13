import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents } from '@/types/index';

/**
 * 双发射手
 * 每次发射两颗豌豆
 */
export class Repeater extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 发射投射物 - 发射两颗
   */
  protected fireProjectile(): void {
    // 第一颗
    super.fireProjectile();

    // 第二颗（延迟100ms）
    this.scene.time.delayedCall(100, () => {
      if (!this.isPlantAlive()) return;

      this.scene.game.events.emit(GameEvents.PROJECTILE_FIRED, {
        x: this.x + 20,
        y: this.y - 10,
        type: this.config.projectileType,
        damage: this.config.attackDamage || 20,
        speed: 300,
        row: this.row,
        source: this,
      });
    });

    // 两次发射动画
    this.scene.tweens.add({
      targets: this,
      scaleY: 1.1,
      duration: 100,
      repeat: 1,
      yoyo: true,
    });
  }
}
