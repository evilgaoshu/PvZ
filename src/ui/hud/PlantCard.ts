import Phaser from 'phaser';

export interface PlantCardConfig {
  id: string;
  name: string;
  cost: number;
  color: number;
  icon?: string;
}

/**
 * 植物选择卡片组件
 */
export class PlantCard extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private costText: Phaser.GameObjects.Text;
  private config: PlantCardConfig;
  private isAvailable: boolean = true;
  private cooldownOverlay: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: PlantCardConfig,
    onClick: (id: string, cost: number) => void
  ) {
    super(scene, x, y);
    this.config = config;

    // 背景
    this.bg = scene.add.graphics();
    this.drawBackground(0x1e293b);
    this.add(this.bg);

    // 植物图标区域
    const iconBg = scene.add.rectangle(0, -10, 46, 46, config.color);
    iconBg.setStrokeStyle(2, 0xffffff, 0.5);
    this.add(iconBg);

    const nameInitial = scene.add.text(
      0,
      -10,
      config.id.charAt(0).toUpperCase(),
      {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    );
    nameInitial.setOrigin(0.5);
    this.add(nameInitial);

    // 阳光成本
    const sunIcon = scene.add.circle(-15, 25, 8, 0xfcd34d);
    this.add(sunIcon);

    this.costText = scene.add.text(5, 25, config.cost.toString(), {
      fontSize: '14px',
      color: '#fcd34d',
      fontStyle: 'bold',
    });
    this.costText.setOrigin(0, 0.5);
    this.add(this.costText);

    // 冷却遮罩
    this.cooldownOverlay = scene.add.graphics();
    this.add(this.cooldownOverlay);

    // 交互
    const hitArea = new Phaser.Geom.Rectangle(-30, -40, 60, 80);
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    if (this.input) this.input.cursor = 'pointer';

    this.on('pointerover', () => {
      if (this.isAvailable) {
        this.drawBackground(0x334155);
        this.setScale(1.05);
      }
    });

    this.on('pointerout', () => {
      this.drawBackground(0x1e293b);
      this.setScale(1.0);
    });

    this.on('pointerdown', () => {
      if (this.isAvailable) {
        this.setScale(0.95);
        onClick(this.config.id, this.config.cost);
      }
    });

    this.on('pointerup', () => {
      this.setScale(1.05);
    });

    scene.add.existing(this);
  }

  private drawBackground(color: number): void {
    this.bg.clear();
    this.bg.fillStyle(color, 0.9);
    this.bg.fillRoundedRect(-30, -40, 60, 80, 5);
    this.bg.lineStyle(2, 0x475569, 1);
    this.bg.strokeRoundedRect(-30, -40, 60, 80, 5);
  }

  public setAffordable(canAfford: boolean): void {
    if (canAfford) {
      this.setAlpha(1);
      this.costText.setColor('#fcd34d');
    } else {
      this.setAlpha(0.6);
      this.costText.setColor('#ef4444');
    }
  }

  public setCooldown(progress: number): void {
    this.cooldownOverlay.clear();
    if (progress > 0 && progress < 1) {
      this.cooldownOverlay.fillStyle(0x000000, 0.5);
      // 绘制扇形冷却效果
      this.cooldownOverlay.beginPath();
      this.cooldownOverlay.moveTo(0, -10);
      this.cooldownOverlay.arc(
        0,
        -10,
        30,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * (1 - progress),
        false
      );
      this.cooldownOverlay.lineTo(0, -10);
      this.cooldownOverlay.closePath();
      this.cooldownOverlay.fillPath();
      this.isAvailable = false;
    } else {
      this.isAvailable = true;
    }
  }
}
