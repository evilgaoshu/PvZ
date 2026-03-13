import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';
import { EntityState } from '@/types/index';
import { SoundEffect } from '@config/AudioConfig';

/**
 * 读报僵尸
 * 报纸被打掉后狂暴
 */
export class NewspaperZombie extends Zombie {
  private newspaperGraphics: Phaser.GameObjects.Container | null = null;
  private isEnraged: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config);

    // 创建报纸视觉
    this.createNewspaperVisual();
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 创建报纸视觉
   */
  private createNewspaperVisual(): void {
    this.newspaperGraphics = this.scene.add.container(0, 0);

    // 报纸背景
    const paper = this.scene.add.rectangle(0, 0, 30, 40, 0xf5f5dc, 1);
    paper.setStrokeStyle(1, 0xcccccc);
    this.newspaperGraphics.add(paper);

    // 报纸文字线条
    for (let i = 0; i < 6; i++) {
      const line = this.scene.add.rectangle(
        0, -15 + i * 5, 25, 2, 0x333333, 0.5
      );
      this.newspaperGraphics.add(line);
    }

    // 标题大字
    const headline = this.scene.add.rectangle(0, -12, 20, 6, 0x000000, 0.8);
    this.newspaperGraphics.add(headline);
  }

  /**
   * 更新
   */
  public update(time: number, delta: number): void {
    super.update(time, delta);

    // 更新报纸位置
    if (this.newspaperGraphics && this.active) {
      this.newspaperGraphics.x = this.x - 20;
      this.newspaperGraphics.y = this.y - 10;
    }
  }

  /**
   * 受到伤害
   */
  public takeDamage(amount: number, damageType: string = 'normal'): void {
    // 如果还有护甲（报纸），优先扣除
    if (this.currentArmor > 0) {
      const oldArmor = this.currentArmor;
      super.takeDamage(amount, damageType);

      // 检查报纸是否被打掉
      if (oldArmor > 0 && this.currentArmor <= 0) {
        this.breakNewspaper();
      }
      return;
    }

    super.takeDamage(amount, damageType);
  }

  /**
   * 报纸被打掉
   */
  private breakNewspaper(): void {
    // 报纸破碎动画
    if (this.newspaperGraphics) {
      // 撕碎效果
      this.scene.tweens.add({
        targets: this.newspaperGraphics,
        angle: { from: -10, to: 10 },
        duration: 100,
        repeat: 2,
        yoyo: true,
        onComplete: () => {
          // 碎片飞散
          this.createPaperDebris();

          this.scene.tweens.add({
            targets: this.newspaperGraphics,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 200,
            onComplete: () => {
              this.newspaperGraphics?.destroy();
              this.newspaperGraphics = null;
            }
          });
        }
      });
    }

    // 进入狂暴状态
    this.enterRageMode();
  }

  /**
   * 创建纸张碎片
   */
  private createPaperDebris(): void {
    for (let i = 0; i < 8; i++) {
      const debris = this.scene.add.rectangle(
        this.x - 20,
        this.y - 10,
        Phaser.Math.Between(5, 10),
        Phaser.Math.Between(5, 10),
        0xf5f5dc
      );

      const angle = (i / 8) * Math.PI * 2;
      const distance = Phaser.Math.Between(30, 60);

      this.scene.tweens.add({
        targets: debris,
        x: debris.x + Math.cos(angle) * distance,
        y: debris.y + Math.sin(angle) * distance,
        angle: Phaser.Math.Between(0, 360),
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          debris.destroy();
        }
      });
    }
  }

  /**
   * 进入狂暴模式
   */
  private enterRageMode(): void {
    this.isEnraged = true;

    // 变红
    this.renderer?.setTint(0xff4444);

    // 加速（速度翻倍）
    this.currentSpeed *= 2;
    this.setVelocityX(-this.currentSpeed);

    // 狂暴表情 - 愤怒符号
    const rageMark = this.scene.add.text(this.x, this.y - 60, '💢', {
      fontSize: '24px'
    });
    rageMark.setOrigin(0.5);

    this.scene.tweens.add({
      targets: rageMark,
      y: rageMark.y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        rageMark.destroy();
      }
    });

    // 播放狂暴音效
    this.audioManager?.playSfx(SoundEffect.NEWSPAPER_RAGE);

    // 显示文字提示
    const rageText = this.scene.add.text(this.x, this.y - 40, '狂暴！', {
      fontSize: '16px',
      color: '#ef4444',
      stroke: '#000000',
      strokeThickness: 3
    });
    rageText.setOrigin(0.5);

    this.scene.tweens.add({
      targets: rageText,
      y: rageText.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        rageText.destroy();
      }
    });
  }

  /**
   * 销毁
   */
  destroy(fromScene?: boolean): void {
    this.newspaperGraphics?.destroy();
    this.newspaperGraphics = null;
    super.destroy(fromScene);
  }
}
