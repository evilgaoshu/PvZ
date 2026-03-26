import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';

/**
 * 普通僵尸
 * 最常见的僵尸
 */
export class NormalZombie extends Zombie {
  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config);
  }
}
