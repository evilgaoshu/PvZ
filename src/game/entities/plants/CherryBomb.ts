import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { GameEvents } from '@/types/index';
import { SoundEffect } from '@config/AudioConfig';

/**
 * 樱桃炸弹
 * 范围爆炸伤害
 */
export class CherryBomb extends Plant {
  private hasExploded: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected init(): void {
    super.init();

    // 樱桃炸弹放置后立即爆炸
    this.scene.time.delayedCall(500, () => {
      this.explode();
    });
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 樱桃炸弹不攻击
   */
  protected canAttack(): boolean {
    return false;
  }

  /**
   * 爆炸
   */
  private explode(): void {
    if (this.hasExploded) return;
    this.hasExploded = true;

    const damage = this.config.attackDamage || 1800;
    const range = (this.config.attackRange || 1) * 80; // 转换为像素

    // 播放爆炸效果
    this.playExplosionEffect();

    // 发送爆炸事件
    this.scene.game.events.emit(GameEvents.PROJECTILE_HIT, {
      x: this.x,
      y: this.y,
      damage: damage,
      range: range,
      type: 'explosion',
      row: this.getRow(),
      col: this.getCol(),
    });

    // 播放音效
    this.audioManager?.playSfx(SoundEffect.EXPLOSION);

    // 自毁
    this.scene.time.delayedCall(300, () => {
      this.die();
    });
  }

  /**
   * 播放爆炸效果
   */
  private playExplosionEffect(): void {
    // 创建爆炸圆形扩散效果
    const explosion = this.scene.add.ellipse(
      this.x,
      this.y,
      50,
      50,
      0xff4400,
      0.8
    );

    this.scene.tweens.add({
      targets: explosion,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        explosion.destroy();
      },
    });

    // 添加粒子效果
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.scene.add.rectangle(
        this.x,
        this.y,
        10,
        10,
        0xff6600
      );

      const targetX = this.x + Math.cos(angle) * 100;
      const targetY = this.y + Math.sin(angle) * 100;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        },
      });
    }

    // 屏幕震动
    this.scene.cameras.main.shake(200, 0.01);
  }

  /**
   * 樱桃炸弹不受到伤害
   */
  public takeDamage(_amount: number): void {
    // 樱桃炸弹免疫伤害，放置后一定会爆炸
  }
}
