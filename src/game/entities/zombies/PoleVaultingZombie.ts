import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';
import { SoundEffect } from '@config/AudioConfig';
import { EntityState } from '@/types/index';

/**
 * 撑杆跳僵尸
 * 撑杆跳过第一个植物
 */
export class PoleVaultingZombie extends Zombie {
  private hasVaulted: boolean = false;
  private poleGraphics: Phaser.GameObjects.Graphics | null = null;
  protected usedSpecialAbility: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config);
  }

  protected setupPhysics(): void {
    super.setupPhysics();
    // 撑杆跳僵尸初始速度较快
    this.currentSpeed = this.config.speed * 1.5;
    this.setVelocityX(-this.currentSpeed);
  }

  protected checkSpecialAbility(): void {
    // 只有还没跳过且没用过特殊能力时才检查
    if (!this.hasVaulted && !this.usedSpecialAbility) {
      // 检查前方是否有植物
      this.scene.events.emit('zombie:check_vault', {
        zombie: this,
        x: this.x,
        row: this.row,
        callback: (hasPlant: boolean) => {
          if (hasPlant && !this.usedSpecialAbility) {
            this.performVault();
          }
        },
      });
    }
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

    // 创建残影定时器
    const trailTimer = this.scene.time.addEvent({
      delay: 50,
      callback: this.createTrail,
      callbackScope: this,
      loop: true,
    });

    // 跳跃动画
    this.scene.tweens.add({
      targets: this,
      x: this.x - 80, // 向前跳过一个格子 (注意向左是减小 X)
      y: this.y - 80, // 跳起
      duration: 400,
      ease: 'Sine.easeOut',
      yoyo: false,
      onComplete: () => {
        // 落地
        this.scene.tweens.add({
          targets: this,
          y: this.y + 80,
          duration: 200,
          ease: 'Sine.easeIn',
          onComplete: () => {
            // 停止残影
            trailTimer.remove();

            // 恢复正常速度（变慢）
            this.currentSpeed = 20; // 普通僵尸速度
            this.stateMachine.changeState(EntityState.WALK);

            // 丢弃撑杆
            this.discardPole();
          },
        });
      },
    });

    // 旋转动画
    this.scene.tweens.add({
      targets:
        this.renderer instanceof Phaser.GameObjects.Sprite
          ? this
          : (this.renderer as any).getObject(),
      angle: -360, // 向前翻滚
      duration: 600,
      ease: 'Power1',
    });

    // 撑杆跟随动画
    if (this.poleGraphics) {
      this.scene.tweens.add({
        targets: this.poleGraphics,
        x: this.poleGraphics.x - 80,
        duration: 400,
        ease: 'Power1',
      });
    }
  }

  private createTrail(): void {
    if (!this.active || !this.scene) return;

    // 创建简单的残影
    const trail = this.scene.add.rectangle(
      this.x,
      this.y,
      40,
      80,
      0x8b5cf6,
      0.5
    );
    trail.setDepth(this.depth - 0.1);

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      onComplete: () => trail.destroy(),
    });
  }

  /**
   * 丢弃撑杆
   */
  private discardPole(): void {
    if (!this.poleGraphics) return;

    this.scene.tweens.add({
      targets: this.poleGraphics,
      alpha: 0,
      angle: 45,
      y: '+=20',
      duration: 500,
      onComplete: () => {
        this.poleGraphics?.destroy();
        this.poleGraphics = null;
      },
    });
  }

  /**
   * 更新
   */
  public update(time: number, delta: number): void {
    super.update(time, delta);

    // 更新撑杆位置跟随僵尸
    if (this.poleGraphics && this.active) {
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
