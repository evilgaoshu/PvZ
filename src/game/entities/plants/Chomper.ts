import { Plant } from './Plant';
import type { PlantConfig } from '@/types/config';
import { EntityState, GameEvents } from '@/types/index';
import { SoundEffect } from '@config/AudioConfig';

/**
 * 食人花
 * 能一口吞掉僵尸，但咀嚼时间较长
 */
export class Chomper extends Plant {
  private isChewing: boolean = false;
  private chewEndTime: number = 0;
  private hasTarget: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config);
  }

  protected setupAnimations(): void {
    // 动画设置
  }

  /**
   * 更新特殊能力
   */
  protected updateSpecialAbility(time: number, _delta: number): void {
    if (this.isChewing) {
      // 检查咀嚼是否结束
      if (time >= this.chewEndTime) {
        this.finishChewing();
      }
      return;
    }

    // 检查是否有可攻击的僵尸
    if (!this.hasTarget && this.canAttack()) {
      this.checkForTarget();
    }
  }

  /**
   * 检查是否可以攻击
   */
  protected canAttack(): boolean {
    // 只有不在咀嚼状态才能攻击
    return !this.isChewing;
  }

  /**
   * 攻击 - 吞食僵尸
   */
  protected attack(time: number): void {
    if (this.isChewing || !this.attackTarget) return;

    // 检查目标是否在近战范围
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.attackTarget.x, this.attackTarget.y
    );

    if (distance > 100) return; // 太近才攻击

    // 吞食僵尸
    this.swallowZombie(time);
  }

  /**
   * 吞食僵尸
   */
  private swallowZombie(time: number): void {
    if (!this.attackTarget) return;

    this.hasTarget = true;
    this.entityState = EntityState.ATTACK;

    // 播放吞食动画
    this.playSwallowAnimation();

    // 立即杀死僵尸（秒杀）
    const zombie = this.attackTarget;
    this.scene.game.events.emit(GameEvents.ZOMBIE_DIED, {
      zombie: zombie,
      instantKill: true,
      source: this
    });

    // 开始咀嚼
    this.startChewing(time);
  }

  /**
   * 播放吞食动画
   */
  private playSwallowAnimation(): void {
    // 张大嘴动画
    this.scene.tweens.add({
      targets: this,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    });

    // 添加吞食特效
    const chompEffect = this.scene.add.ellipse(
      this.x + 20, this.y, 60, 80, 0x330000, 0.8
    );

    this.scene.tweens.add({
      targets: chompEffect,
      scaleX: 0,
      scaleY: 0,
      duration: 200,
      onComplete: () => {
        chompEffect.destroy();
      }
    });
  }

  /**
   * 开始咀嚼
   */
  private startChewing(time: number): void {
    this.isChewing = true;
    this.entityState = EntityState.IDLE;

    const chewDuration = (this.config.attackInterval || 42) * 1000;
    this.chewEndTime = time + chewDuration;

    // 播放吞食音效
    this.audioManager?.playSfx(SoundEffect.CHOMP);

    // 播放咀嚼动画
    this.playChewAnimation();

    // 咀嚼气泡
    this.showChewBubbles();
  }

  /**
   * 播放咀嚼动画
   */
  private playChewAnimation(): void {
    // 咀嚼时显示闭嘴状态
    this.setTint(0xcc8855);

    // 咀嚼摆动
    this.scene.tweens.add({
      targets: this,
      angle: { from: -3, to: 3 },
      duration: 300,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * 显示咀嚼气泡
   */
  private showChewBubbles(): void {
    const createBubble = () => {
      if (!this.isChewing) return;

      const bubble = this.scene.add.circle(this.x + 20, this.y - 40, 5, 0xffffff, 0.7);

      this.scene.tweens.add({
        targets: bubble,
        y: this.y - 70,
        alpha: 0,
        duration: 800,
        onComplete: () => {
          bubble.destroy();
        }
      });
    };

    // 每隔一段时间产生气泡
    const bubbleEvent = this.scene.time.addEvent({
      delay: 1000,
      callback: createBubble,
      repeat: 40 // 咀嚼时间大约42秒
    });

    // 存储引用以便清理
    this.setData('bubbleEvent', bubbleEvent);
  }

  /**
   * 结束咀嚼
   */
  private finishChewing(): void {
    this.isChewing = false;
    this.hasTarget = false;
    this.entityState = EntityState.IDLE;

    // 恢复正常外观
    this.clearTint();
    this.setAngle(0);

    // 停止咀嚼动画
    this.scene.tweens.killTweensOf(this);

    // 清理气泡事件
    const bubbleEvent = this.getData('bubbleEvent') as Phaser.Time.TimerEvent;
    if (bubbleEvent) {
      bubbleEvent.remove();
    }
  }

  /**
   * 受到伤害 - 如果正在咀嚼可以提前结束
   */
  public takeDamage(amount: number): void {
    super.takeDamage(amount);

    // 如果受到大量伤害，可以提前结束咀嚼
    if (this.isChewing && this.currentHealth < this.getMaxHealth() * 0.3) {
      this.finishChewing();
    }
  }
}
