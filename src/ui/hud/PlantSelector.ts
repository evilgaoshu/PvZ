import Phaser from 'phaser';
import { PlantCard, PlantCardConfig } from './PlantCard';

/**
 * 植物选择栏容器组件
 */
export class PlantSelector extends Phaser.GameObjects.Container {
  private cards: Map<string, PlantCard> = new Map();
  private bg: Phaser.GameObjects.Graphics;
  private onSelect: (id: string, cost: number) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, plants: PlantCardConfig[], onSelect: (id: string, cost: number) => void) {
    super(scene, x, y);
    this.onSelect = onSelect;

    // 背景板
    this.bg = scene.add.graphics();
    this.add(this.bg);

    this.updatePlants(plants);
    scene.add.existing(this);
  }

  public updatePlants(plants: PlantCardConfig[]): void {
    // 清理旧卡片
    this.cards.forEach(card => card.destroy());
    this.cards.clear();

    const totalWidth = plants.length * 70 + 20;
    
    this.bg.clear();
    this.bg.fillStyle(0x000000, 0.4);
    this.bg.fillRoundedRect(-10, -45, totalWidth, 90, 10);
    this.bg.lineStyle(2, 0x78350f, 0.8);
    this.bg.strokeRoundedRect(-10, -45, totalWidth, 90, 10);

    plants.forEach((config, index) => {
      const card = new PlantCard(this.scene, index * 70 + 30, 0, config, this.onSelect);
      this.add(card);
      this.cards.set(config.id, card);
    });
  }

  public updateAffordability(currentSun: number): void {
    this.cards.forEach((card, id) => {
      // 这里的逻辑可以进一步优化，比如从配置中获取成本
      // 暂简化处理
    });
  }

  public getCard(id: string): PlantCard | undefined {
    return this.cards.get(id);
  }
}
