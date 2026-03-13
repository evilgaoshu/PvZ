import Phaser from 'phaser';
import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';

/**
 * 睡莲
 * 提供水上平台
 */
export class LilyPad extends Plant {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupAnimations(): void {
    // 简单的呼吸效果
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 0.95,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
