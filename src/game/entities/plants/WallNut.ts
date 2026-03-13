import Phaser from 'phaser';
import { Plant, DamageState } from './Plant';
import type { PlantConfig } from '@/types/config';

/**
 * 坚果墙
 * 实现分级裂纹效果
 */
export class WallNut extends Plant {
  private crackOverlay: Phaser.GameObjects.Image | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected init(): void {
    super.init();
    
    // 创建一个隐藏的裂纹图层，叠加在坚果上
    this.crackOverlay = this.scene.add.image(this.x, this.y, 'effects/cracks');
    this.crackOverlay.setAlpha(0);
    this.crackOverlay.setDepth(this.depth + 0.1);
  }

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.crackOverlay && this.active) {
      this.crackOverlay.setPosition(this.x, this.y);
    }
  }

  protected onDamageStateChange(state: DamageState): void {
    // 覆盖父类的染色，改用真实的裂纹贴图
    if (!this.crackOverlay) return;

    switch (state) {
      case DamageState.HEALTHY:
        this.crackOverlay.setAlpha(0);
        break;
      case DamageState.HURT:
        this.crackOverlay.setAlpha(0.5);
        this.crackOverlay.setScale(0.8);
        break;
      case DamageState.CRITICAL:
        this.crackOverlay.setAlpha(1);
        this.crackOverlay.setScale(1);
        // 抖动效果
        this.scene.tweens.add({
          targets: [this, this.crackOverlay],
          x: '+=2',
          duration: 50,
          yoyo: true,
          repeat: -1
        });
        break;
    }
  }

  public die(): void {
    if (this.crackOverlay) this.crackOverlay.destroy();
    super.die();
  }

  destroy(fromScene?: boolean): void {
    if (this.crackOverlay) this.crackOverlay.destroy();
    super.destroy(fromScene);
  }
}
