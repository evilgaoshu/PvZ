import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { EntityState } from '@/types/index';

/**
 * 坚果墙
 * 高生命值的防御型植物
 */
export class WallNut extends Plant {
  private damageState: 'healthy' | 'hurt' | 'critical' = 'healthy';

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 坚果墙不攻击
   */
  protected canAttack(): boolean {
    return false;
  }

  /**
   * 受到伤害 - 根据血量改变外观
   */
  public takeDamage(amount: number): void {
    super.takeDamage(amount);

    // 更新外观状态
    const healthPercent = this.getHealth() / this.getMaxHealth();

    if (healthPercent <= 0.33 && this.damageState !== 'critical') {
      this.damageState = 'critical';
      this.playCriticalAnimation();
    } else if (healthPercent <= 0.66 && this.damageState === 'healthy') {
      this.damageState = 'hurt';
      this.playHurtAnimation();
    }
  }

  /**
   * 播放受伤外观动画
   */
  protected playHurtAnimation(): void {
    // 变褐色
    this.setTint(0xccaa88);
  }

  /**
   * 播放严重受损动画
   */
  private playCriticalAnimation(): void {
    // 更深色 + 轻微晃动
    this.setTint(0xaa7755);

    // 持续轻微晃动
    this.scene.tweens.add({
      targets: this,
      angle: { from: -2, to: 2 },
      duration: 200,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * 更新特殊能力
   */
  protected updateSpecialAbility(_time: number, _delta: number): void {
    // 坚果墙没有特殊能力，只是挡住僵尸
  }
}
