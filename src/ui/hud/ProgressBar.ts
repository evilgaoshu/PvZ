import Phaser from 'phaser';

/**
 * 关卡进度条组件
 */
export class ProgressBar extends Phaser.GameObjects.Container {
  private bar: Phaser.GameObjects.Graphics;
  private width: number = 180;
  private height: number = 24;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // 轨道背景
    const track = scene.add.graphics();
    track.fillStyle(0x1e293b, 0.8);
    track.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, this.height / 2);
    track.lineStyle(2, 0x475569, 1);
    track.strokeRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, this.height / 2);
    this.add(track);

    // 进度条
    this.bar = scene.add.graphics();
    this.add(this.bar);

    // 旗帜图标 (程序化)
    const flag = scene.add.text(this.width / 2 - 10, 0, '🚩', { fontSize: '16px' });
    flag.setOrigin(0.5);
    this.add(flag);

    this.setProgress(0);
    scene.add.existing(this);
  }

  public setProgress(percent: number): void {
    percent = Phaser.Math.Clamp(percent, 0, 1);
    this.bar.clear();
    
    if (percent > 0) {
      // 渐变色模拟
      this.bar.fillStyle(0x4ade80, 1);
      const fillWidth = this.width * percent;
      this.bar.fillRoundedRect(
        -this.width / 2, 
        -this.height / 2 + 3, 
        fillWidth, 
        this.height - 6, 
        (this.height - 6) / 2
      );

      // 高光
      this.bar.fillStyle(0xffffff, 0.3);
      this.bar.fillRoundedRect(
        -this.width / 2 + 5, 
        -this.height / 2 + 5, 
        fillWidth - 10, 
        (this.height - 6) / 3, 
        (this.height - 6) / 6
      );
    }
  }
}
