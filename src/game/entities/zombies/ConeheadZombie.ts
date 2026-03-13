import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';

/**
 * 路障僵尸
 * 头戴路障，生命值更高
 */
export class ConeheadZombie extends Zombie {
  private coneGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config);

    // 添加路障视觉
    this.createConeVisual();
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 创建路障视觉
   */
  private createConeVisual(): void {
    this.coneGraphics = this.scene.add.graphics();

    // 绘制橙色路障
    this.coneGraphics.fillStyle(0xff6600, 1);

    // 路锥形状
    const conePath = new Phaser.Curves.Path(0, 0);
    conePath.moveTo(-10, 0);
    conePath.lineTo(10, 0);
    conePath.lineTo(5, -25);
    conePath.lineTo(-5, -25);

    this.coneGraphics.fillPath();

    // 白色条纹
    this.coneGraphics.fillStyle(0xffffff, 1);
    this.coneGraphics.fillRect(-6, -10, 12, 3);
    this.coneGraphics.fillRect(-4, -18, 8, 3);
  }

  /**
   * 更新路障位置
   */
  public update(time: number, delta: number): void {
    super.update(time, delta);

    // 更新路障位置跟随僵尸
    if (this.coneGraphics && this.active) {
      this.coneGraphics.x = this.x;
      this.coneGraphics.y = this.y - 30;
    }
  }

  /**
   * 护甲被打破
   */
  protected onArmorBreak(): void {
    super.onArmorBreak();

    // 移除路障视觉
    if (this.coneGraphics) {
      this.scene.tweens.add({
        targets: this.coneGraphics,
        y: this.coneGraphics.y + 20,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.coneGraphics?.destroy();
          this.coneGraphics = null;
        },
      });
    }
  }

  /**
   * 销毁
   */
  destroy(fromScene?: boolean): void {
    this.coneGraphics?.destroy();
    this.coneGraphics = null;
    super.destroy(fromScene);
  }
}
