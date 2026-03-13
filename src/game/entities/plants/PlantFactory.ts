import Phaser from 'phaser';
import { plantConfigs } from '@data/plants/plantConfigs';
import type { PlantConfig } from '@/types/config';
import { GRID_CONFIG } from '@/types/index';

// 导入植物类
import { Plant } from './Plant';
import { Sunflower } from './Sunflower';
import { Peashooter } from './Peashooter';
import { WallNut } from './WallNut';
import { CherryBomb } from './CherryBomb';
import { SnowPea } from './SnowPea';
import { Repeater } from './Repeater';
import { Chomper } from './Chomper';
import { LilyPad } from './LilyPad';

// 植物创建函数类型
type PlantCreator = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  config: PlantConfig
) => Plant;

/**
 * 植物工厂
 * 负责创建和管理植物实例
 */
export class PlantFactory {
  private scene: Phaser.Scene;
  private plantCreators: Map<string, PlantCreator>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // 初始化植物创建函数映射
    this.plantCreators = new Map<string, PlantCreator>([
      ['sunflower', (s, x, y, c) => new Sunflower(s, x, y, c)],
      ['peashooter', (s, x, y, c) => new Peashooter(s, x, y, c)],
      ['wallnut', (s, x, y, c) => new WallNut(s, x, y, c)],
      ['cherry_bomb', (s, x, y, c) => new CherryBomb(s, x, y, c)],
      ['snow_pea', (s, x, y, c) => new SnowPea(s, x, y, c)],
      ['repeater', (s, x, y, c) => new Repeater(s, x, y, c)],
      ['chomper', (s, x, y, c) => new Chomper(s, x, y, c)],
      ['lilypad', (s, x, y, c) => new LilyPad(s, x, y, c)],
    ]);
  }

  /**
   * 创建植物
   */
  public createPlant(
    plantType: string,
    row: number,
    col: number
  ): Plant | null {
    const config = plantConfigs[plantType];
    if (!config) {
      console.error(`Unknown plant type: ${plantType}`);
      return null;
    }

    // 计算位置
    const x =
      GRID_CONFIG.OFFSET_X +
      col * GRID_CONFIG.CELL_WIDTH +
      GRID_CONFIG.CELL_WIDTH / 2;
    const y =
      GRID_CONFIG.OFFSET_Y +
      row * GRID_CONFIG.CELL_HEIGHT +
      GRID_CONFIG.CELL_HEIGHT / 2;

    // 获取植物创建函数
    const creator = this.plantCreators.get(plantType);
    if (!creator) {
      console.error(`No creator registered for plant type: ${plantType}`);
      return null;
    }

    // 创建植物实例
    const plant = creator(this.scene, x, y, config);
    plant.setGridPosition(row, col);

    console.log(`Created plant: ${plantType} at (${row}, ${col})`);

    return plant;
  }

  /**
   * 获取植物配置
   */
  public getPlantConfig(plantType: string): PlantConfig | null {
    return plantConfigs[plantType] || null;
  }

  /**
   * 获取所有植物类型
   */
  public getAllPlantTypes(): string[] {
    return Object.keys(plantConfigs);
  }

  /**
   * 获取可用植物类型（根据关卡）
   */
  public getAvailablePlants(_levelId: string): string[] {
    // 这里可以根据关卡返回可用植物
    // 简化处理，返回所有植物
    return this.getAllPlantTypes();
  }
}
