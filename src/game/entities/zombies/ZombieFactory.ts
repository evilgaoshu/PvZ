import Phaser from 'phaser';
import { zombieConfigs } from '@data/plants/plantConfigs';
import type { ZombieConfig } from '@/types/config';
import { GRID_CONFIG } from '@/types/index';

// 导入僵尸类
import { Zombie } from './Zombie';
import { NormalZombie } from './NormalZombie';
import { ConeheadZombie } from './ConeheadZombie';
import { BucketheadZombie } from './BucketheadZombie';
import { PoleVaultingZombie } from './PoleVaultingZombie';
import { NewspaperZombie } from './NewspaperZombie';
import { ScreendoorZombie } from './ScreendoorZombie';

// 僵尸创建函数类型
type ZombieCreator = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  config: ZombieConfig
) => Zombie;

/**
 * 僵尸工厂
 * 负责创建和管理僵尸实例
 */
export class ZombieFactory {
  private scene: Phaser.Scene;
  private zombieCreators: Map<string, ZombieCreator>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // 初始化僵尸创建函数映射
    this.zombieCreators = new Map<string, ZombieCreator>([
      ['normal', (s, x, y, c) => new NormalZombie(s, x, y, c)],
      ['conehead', (s, x, y, c) => new ConeheadZombie(s, x, y, c)],
      ['buckethead', (s, x, y, c) => new BucketheadZombie(s, x, y, c)],
      ['pole_vaulting', (s, x, y, c) => new PoleVaultingZombie(s, x, y, c)],
      ['newspaper', (s, x, y, c) => new NewspaperZombie(s, x, y, c)],
      ['screendoor', (s, x, y, c) => new ScreendoorZombie(s, x, y, c)],
    ]);
  }

  /**
   * 创建僵尸
   */
  public createZombie(zombieType: string, row: number): Zombie | null {
    const config = zombieConfigs[zombieType];
    if (!config) {
      console.error(`Unknown zombie type: ${zombieType}`);
      return null;
    }

    // 计算位置
    const x = 850; // 屏幕右侧外
    const y =
      GRID_CONFIG.OFFSET_Y +
      row * GRID_CONFIG.CELL_HEIGHT +
      GRID_CONFIG.CELL_HEIGHT / 2;

    // 获取僵尸创建函数
    const creator = this.zombieCreators.get(zombieType);
    if (!creator) {
      console.error(`No creator registered for zombie type: ${zombieType}`);
      return null;
    }

    // 创建僵尸实例
    const zombie = creator(this.scene, x, y, config);
    zombie.setRow(row);

    console.log(`Created zombie: ${zombieType} at row ${row}`);

    return zombie;
  }

  /**
   * 获取僵尸配置
   */
  public getZombieConfig(zombieType: string): ZombieConfig | null {
    return zombieConfigs[zombieType] || null;
  }

  /**
   * 获取所有僵尸类型
   */
  public getAllZombieTypes(): string[] {
    return Object.keys(zombieConfigs);
  }
}
