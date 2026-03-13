import Phaser from 'phaser';
import { GameButton } from '@ui/components/GameButton';
import { PlantCard, PlantCardConfig } from './PlantCard';

/**
 * 选种面板组件
 */
export class SeedPicker extends Phaser.GameObjects.Container {
  private selectedPlants: PlantCardConfig[] = [];
  private maxSlots: number = 6;
  private onConfirm: (plants: PlantCardConfig[]) => void;

  private pickerBg: Phaser.GameObjects.Graphics;
  private selectionCards: Map<string, PlantCard> = new Map();
  private slotCards: (PlantCard | null)[] = [];

  constructor(
    scene: Phaser.Scene,
    allAvailablePlants: PlantCardConfig[],
    onConfirm: (plants: PlantCardConfig[]) => void
  ) {
    super(scene, 400, 300);
    this.onConfirm = onConfirm;

    // 遮罩层
    const overlay = scene.add.rectangle(0, 0, 800, 600, 0x000000, 0.7);
    overlay.setInteractive();
    this.add(overlay);

    // 面板背景
    this.pickerBg = scene.add.graphics();
    this.pickerBg.fillStyle(0x422006, 1);
    this.pickerBg.fillRoundedRect(-300, -220, 600, 440, 15);
    this.pickerBg.lineStyle(4, 0x78350f, 1);
    this.pickerBg.strokeRoundedRect(-300, -220, 600, 440, 15);
    this.add(this.pickerBg);

    const title = scene.add
      .text(0, -190, '选择你的植物', {
        fontSize: '28px',
        color: '#fcd34d',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add(title);

    // 1. 待选区域 (Grid)
    allAvailablePlants.forEach((plant, index) => {
      const col = index % 7;
      const row = Math.floor(index / 7);
      const card = new PlantCard(
        scene,
        -240 + col * 80,
        -80 + row * 100,
        plant,
        () => this.toggleSelection(plant)
      );
      this.add(card);
      this.selectionCards.set(plant.id, card);
    });

    // 2. 已选槽位区域
    const slotLabel = scene.add.text(0, 120, '已选择的植物槽位', {
      fontSize: '18px',
      color: '#94a3b8',
    });
    slotLabel.setOrigin(0.5);
    this.add(slotLabel);
    for (let i = 0; i < this.maxSlots; i++) {
      const slotBg = scene.add.rectangle(
        -200 + i * 80,
        170,
        60,
        80,
        0x000000,
        0.3
      );
      slotBg.setStrokeStyle(2, 0x78350f);
      this.add(slotBg);
      this.slotCards.push(null);
    }

    // 3. 确认按钮
    const confirmBtn = new GameButton(
      scene,
      0,
      260,
      {
        text: '开始战斗！',
        width: 180,
        backgroundColor: 0x15803d,
      },
      () => this.handleConfirm()
    );
    this.add(confirmBtn);

    scene.add.existing(this);

    // 入场动画
    this.setScale(0.8);
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  private toggleSelection(plant: PlantCardConfig): void {
    const index = this.selectedPlants.findIndex((p) => p.id === plant.id);

    if (index > -1) {
      // 取消选择
      this.selectedPlants.splice(index, 1);
      this.updateUI();
    } else {
      // 增加选择
      if (this.selectedPlants.length < this.maxSlots) {
        this.selectedPlants.push(plant);
        this.updateUI();
      } else {
        this.scene.cameras.main.shake(100, 0.005);
      }
    }
  }

  private updateUI(): void {
    // 更新所有卡片的高亮状态
    this.selectionCards.forEach((card, id) => {
      const isSelected = this.selectedPlants.some((p) => p.id === id);
      card.setAlpha(isSelected ? 0.5 : 1);
    });

    // 这里可以进一步优化已选槽位的显示
  }

  private handleConfirm(): void {
    if (this.selectedPlants.length === 0) {
      alert('请至少选择一个植物！');
      return;
    }

    this.scene.tweens.add({
      targets: this,
      scale: 0.8,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.onConfirm(this.selectedPlants);
        this.destroy();
      },
    });
  }
}
