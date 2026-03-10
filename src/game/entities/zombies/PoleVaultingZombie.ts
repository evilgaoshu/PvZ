import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';
import { SoundEffect } from '@config/AudioConfig';

/**
 * 撑杆跳僵尸
 * 撑杆跳过第一个植物
 */
export class PoleVaultingZombie extends Zombie {
  private poleGraphics: Phaser.GameObjects.Graphics | null = null;
  private hasVaulted: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config);

    // 初始速度更快
    this.currentSpeed = config.speed;

    // 添加撑杆视觉
    this.createPoleVisual();
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 创建撑杆视觉
   */
  private createPoleVisual(): void {
    this.poleGraphics = this.scene.add.graphics();

    // 撑杆 - 棕色
    this.poleGraphics.fillStyle(0x8b4513, 1);
    this.poleGraphics.fillRect(-40, -20, 80, 4);

    // 杆头金属
    this.poleGraphics.fillStyle(0xc0c0c0, 1);
    this.poleGraphics.fillCircle(40, -18, 3);
  }

  /**
   * 检查特殊能力
   */
  protected checkSpecialAbility(): void {
    if (this.hasVaulted || !this.usedSpecialAbility) {
      // 检查前方是否有植物
      this.checkForPlantToVault();
    }
  }

  /**
   * 检查是否可以跳过植物
   */
  private checkForPlantToVault(): void {
    // 通过事件查询前方是否有植物
    this.scene.game.events.emit('zombie:check_vault', {
      zombie: this,
      x: this.x,
      row: this.row,
      callback: (hasPlant: boolean) => {
        if (hasPlant && !this.usedSpecialAbility) {
          this.performVault();
        }
      }
    });
  }

  /**
   * 执行跳跃
   */
  private performVault(): void {
    this.usedSpecialAbility = true;
    this.hasVaulted = true;

    // 播放撑杆跳音效
    this.audioManager?.playSfx(SoundEffect.POLE_VAULT);

    // 停止移动
    this.setVelocityX(0);

    // 跳跃动画
    this.scene.tweens.add({
      targets: this,
      x: this.x + 80, // 跳过一个格子
      y: this.y - 80, // 跳起
      duration: 400,
      ease: 'Power1',
      yoyo: false,
      onComplete: () => {
        // 落地
        this.scene.tweens.add({
          targets: this,
          y: this.y + 80,
          duration: 200,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            // 恢复正常速度（变慢）
            this.currentSpeed = 20; // 普通僵尸速度
            this.startWalking();

            // 丢弃撑杆
            this.discardPole();
          }
        });
      }
    });

    // 旋转动画
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 600,
      ease: 'Power1'
    });

    // 撑杆跟随动画
    if (this.poleGraphics) {
      this.scene.tweens.add({
        targets: this.poleGraphics,
        x: this.poleGraphics.x + 80,
        duration: 400,
        ease: 'Power1'
      });
    }
  }

  /**
   * 丢弃撑杆
   */
  private discardPole(): void {
    if (!this.poleGraphics) return;

    this.scene.tweens.add({
      targets: this.poleGraphics,
      x: this.poleGraphics.x - 30,
      y: this.poleGraphics.y + 40,
      angle: 45,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.poleGraphics?.destroy();
        this.poleGraphics = null;
      }
    });
  }

  /**
   * 更新
   */
  public update(time: number, delta: number): void {
    super.update(time, delta);

    // 更新撑杆位置
    if (this.poleGraphics && this.active && !this.hasVaulted) {
      this.poleGraphics.x = this.x;
      this.poleGraphics.y = this.y;
    }
  }

  /**
   * 销毁
   */
  destroy(fromScene?: boolean): void {
    this.poleGraphics?.destroy();
    this.poleGraphics = null;
    super.destroy(fromScene);
  }
}
