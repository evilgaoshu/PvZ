import Phaser from 'phaser';

/**
 * 阳光数值显示组件
 */
export class SunDisplay extends Phaser.GameObjects.Container {
  private sunText: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // 背景
    this.bg = scene.add.graphics();
    this.drawBackground();
    this.add(this.bg);

    // 阳光图标 (简单的程序化图形)
    const sunIcon = scene.add.circle(-35, 0, 15, 0xfcd34d);
    sunIcon.setStrokeStyle(2, 0xd97706);
    this.add(sunIcon);

    // 添加光芒动画
    scene.tweens.add({
      targets: sunIcon,
      scale: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 数值文字
    this.sunText = scene.add.text(10, 0, '50', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.sunText.setOrigin(0.5);
    this.add(this.sunText);

    scene.add.existing(this);
  }

  private drawBackground(): void {
    this.bg.clear();
    // 玻璃拟态效果
    this.bg.fillStyle(0x000000, 0.4);
    this.bg.fillRoundedRect(-60, -20, 120, 40, 20);
    this.bg.lineStyle(2, 0xf59e0b, 0.8);
    this.bg.strokeRoundedRect(-60, -20, 120, 40, 20);
  }

  public updateSun(amount: number): void {
    // 数字跳动效果
    const currentVal = parseInt(this.sunText.text);
    if (currentVal !== amount) {
      this.scene.tweens.add({
        targets: this.sunText,
        scale: 1.3,
        duration: 100,
        yoyo: true,
        onUpdate: () => {
          this.sunText.setText(Math.floor(amount).toString());
        }
      });
    }
  }
}
