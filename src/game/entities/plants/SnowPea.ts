import { Peashooter } from './Peashooter';
import type { PlantConfig } from '@/types/config';

export class SnowPea extends Peashooter {
  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }
}
