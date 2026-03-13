import Phaser from 'phaser';
import { VisualEffects } from '@utils/VisualEffects';

export interface ButtonConfig {
  width?: number;
  height?: number;
  text?: string;
  fontSize?: string;
  backgroundColor?: number;
  hoverColor?: number;
  pressedColor?: number;
  strokeColor?: number;
  strokeThickness?: number;
  textColor?: string;
  borderRadius?: number;
}

/**
 * 通用游戏按钮组件
 * 封装了悬停、点击音效和缩放反馈
 */
export class GameButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private config: Required<ButtonConfig>;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ButtonConfig, callback: () => void) {
    super(scene, x, y);

    this.config = {
      width: config.width || 200,
      height: config.height || 50,
      text: config.text || 'Button',
      fontSize: config.fontSize || '22px',
      backgroundColor: config.backgroundColor ?? 0x4ade80,
      hoverColor: config.hoverColor ?? 0x22c55e,
      pressedColor: config.pressedColor ?? 0x15803d,
      strokeColor: config.strokeColor ?? 0xffffff,
      strokeThickness: config.strokeThickness ?? 2,
      textColor: config.textColor || '#ffffff',
      borderRadius: config.borderRadius ?? 10
    };

    // 创建背景（带圆角和渐变模拟）
    this.bg = scene.add.graphics();
    this.drawBackground(this.config.backgroundColor);
    this.add(this.bg);

    // 创建文字
    this.label = scene.add.text(0, 0, this.config.text, {
      fontSize: this.config.fontSize,
      color: this.config.textColor,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.label.setOrigin(0.5);
    this.add(this.label);

    // 交互设置
    const hitArea = new Phaser.Geom.Rectangle(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height
    );
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.useHandCursor = true;

    // 事件监听
    this.on('pointerover', () => {
      this.drawBackground(this.config.hoverColor);
      VisualEffects.bounceScale(this, 1.05, 100);
    });

    this.on('pointerout', () => {
      this.drawBackground(this.config.backgroundColor);
      VisualEffects.bounceScale(this, 1.0, 100);
    });

    this.on('pointerdown', () => {
      this.drawBackground(this.config.pressedColor);
      VisualEffects.bounceScale(this, 0.95, 100);
    });

    this.on('pointerup', () => {
      this.drawBackground(this.config.hoverColor);
      VisualEffects.bounceScale(this, 1.05, 100);
      callback();
    });

    scene.add.existing(this);
  }

  private drawBackground(color: number): void {
    this.bg.clear();
    
    // 绘制阴影层
    this.bg.fillStyle(0x000000, 0.3);
    this.bg.fillRoundedRect(
      -this.config.width / 2 + 2,
      -this.config.height / 2 + 4,
      this.config.width,
      this.config.height,
      this.config.borderRadius
    );

    // 绘制主体
    this.bg.lineStyle(this.config.strokeThickness, this.config.strokeColor, 1);
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height,
      this.config.borderRadius
    );
    this.bg.strokeRoundedRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height,
      this.config.borderRadius
    );

    // 绘制顶部高光，增加质感
    this.bg.fillStyle(0xffffff, 0.2);
    this.bg.fillRoundedRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height / 2,
      { tl: this.config.borderRadius, tr: this.config.borderRadius, bl: 0, br: 0 }
    );
  }

  public setText(text: string): void {
    this.label.setText(text);
  }
}
