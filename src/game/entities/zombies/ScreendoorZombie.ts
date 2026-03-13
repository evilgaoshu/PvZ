import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';

/**
 * 铁栅门僵尸
 * 铁栅门可阻挡穿刺攻击
 */
export class ScreendoorZombie extends Zombie {
  private doorGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config);

    // 创建铁栅门视觉
    this.createDoorVisual();
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 创建铁栅门视觉
   */
  private createDoorVisual(): void {
    this.doorGraphics = this.scene.add.graphics();

    // 门框 - 灰色金属
    this.doorGraphics.lineStyle(3, 0x888888, 1);
    this.doorGraphics.strokeRect(-25, -40, 35, 80);

    // 栅格
    this.doorGraphics.lineStyle(2, 0x999999, 0.8);

    // 横条
    for (let i = 0; i < 5; i++) {
      const y = -30 + i * 15;
      this.doorGraphics.moveTo(-25, y);
      this.doorGraphics.lineTo(10, y);
    }

    // 竖条
    for (let i = 0; i < 3; i++) {
      const x = -20 + i * 15;
      this.doorGraphics.moveTo(x, -40);
      this.doorGraphics.lineTo(x, 40);
    }

    this.doorGraphics.strokePath();

    // 门把手
    this.doorGraphics.fillStyle(0x666666, 1);
    this.doorGraphics.fillCircle(-20, 0, 3);
  }

  /**
   * 更新
   */
  public update(time: number, delta: number): void {
    super.update(time, delta);

    // 更新铁栅门位置
    if (this.doorGraphics && this.active) {
      this.doorGraphics.x = this.x - 10;
      this.doorGraphics.y = this.y;
    }
  }

  /**
   * 受到伤害
   */
  public takeDamage(amount: number, damageType: string = 'normal'): void {
    // 铁栅门可以阻挡穿刺攻击（如豌豆）
    // 但爆炸攻击可以穿透
    if (damageType === 'piercing' && this.currentArmor > 0) {
      // 穿刺攻击被阻挡，只对护甲造成伤害
      super.takeDamage(amount, 'normal');
      this.showBlockedEffect();
      return;
    }

    super.takeDamage(amount, damageType);
  }

  /**
   * 显示阻挡效果
   */
  private showBlockedEffect(): void {
    // 金属撞击火花
    const spark = this.scene.add.ellipse(
      this.x - 20,
      this.y,
      20,
      20,
      0xffffaa,
      0.8
    );

    this.scene.tweens.add({
      targets: spark,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        spark.destroy();
      },
    });

    // 声音
    this.scene.game.events.emit('audio:play', 'metal_hit');
  }

  /**
   * 护甲被打破
   */
  protected onArmorBreak(): void {
    super.onArmorBreak();

    // 铁栅门破碎掉落
    if (this.doorGraphics) {
      this.scene.tweens.add({
        targets: this.doorGraphics,
        x: this.doorGraphics.x - 40,
        y: this.doorGraphics.y + 60,
        angle: -70,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          this.doorGraphics?.destroy();
          this.doorGraphics = null;
        },
      });
    }
  }

  /**
   * 销毁
   */
  destroy(fromScene?: boolean): void {
    this.doorGraphics?.destroy();
    this.doorGraphics = null;
    super.destroy(fromScene);
  }
}
