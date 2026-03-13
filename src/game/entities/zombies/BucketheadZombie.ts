import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';

/**
 * 铁桶僵尸
 * 头戴铁桶，非常坚固
 */
export class BucketheadZombie extends Zombie {
  private bucketGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config);

    // 添加铁桶视觉
    this.createBucketVisual();
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 创建铁桶视觉
   */
  private createBucketVisual(): void {
    this.bucketGraphics = this.scene.add.graphics();

    // 铁桶主体 - 金属灰色
    this.bucketGraphics.fillStyle(0x888899, 1);
    this.bucketGraphics.fillRoundedRect(-12, -35, 24, 30, 3);

    // 铁桶边缘
    this.bucketGraphics.fillStyle(0x666677, 1);
    this.bucketGraphics.fillRect(-14, -35, 28, 4);

    // 反光
    this.bucketGraphics.fillStyle(0xaaaaaa, 1);
    this.bucketGraphics.fillRect(-8, -30, 4, 20);

    // 凹痕细节
    this.bucketGraphics.fillStyle(0x666677, 1);
    this.bucketGraphics.fillCircle(5, -20, 2);
    this.bucketGraphics.fillCircle(-3, -15, 1.5);
  }

  /**
   * 更新
   */
  public update(time: number, delta: number): void {
    super.update(time, delta);

    // 更新铁桶位置跟随僵尸
    if (this.bucketGraphics && this.active) {
      this.bucketGraphics.x = this.x;
      this.bucketGraphics.y = this.y;
    }
  }

  /**
   * 护甲被打破
   */
  protected onArmorBreak(): void {
    super.onArmorBreak();

    // 铁桶掉落并弹开
    if (this.bucketGraphics) {
      this.scene.tweens.add({
        targets: this.bucketGraphics,
        x: this.bucketGraphics.x + 30,
        y: this.bucketGraphics.y + 50,
        angle: 45,
        alpha: 0,
        duration: 500,
        ease: 'Bounce.easeOut',
        onComplete: () => {
          this.bucketGraphics?.destroy();
          this.bucketGraphics = null;
        },
      });
    }
  }

  /**
   * 销毁
   */
  destroy(fromScene?: boolean): void {
    this.bucketGraphics?.destroy();
    this.bucketGraphics = null;
    super.destroy(fromScene);
  }
}
