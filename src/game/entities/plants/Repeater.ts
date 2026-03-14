import { Peashooter } from './Peashooter';
import type { PlantConfig } from '@/types/config';
import { GameEvents } from '@/types/index';

export class Repeater extends Peashooter {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }
  public fire(): void {
    super.fire();
    this.scene.time.delayedCall(200, () => {
      if (this.active) super.fire();
    });
  }
}
