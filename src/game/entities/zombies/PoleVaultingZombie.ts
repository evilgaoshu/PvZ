import { Zombie } from './Zombie';
import type { ZombieConfig } from '@/types/config';
import { SoundEffect } from '@config/AudioConfig';
import { EntityState, IGameScene } from '@/types/index';
import { IState } from '../../utils/StateMachine';

/**
 * 撑杆跳僵尸
 * 撑杆跳过第一个植物
 */
export class PoleVaultingZombie extends Zombie {
  public hasVaulted: boolean = false;
  public poleGraphics: Phaser.GameObjects.Graphics | null = null;
  public usedSpecialAbility: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config);
    // 撑杆跳僵尸初始速度较快
    this.currentSpeed = this.config.speed * 1.5;
  }

  protected setupStateMachine(): void {
    super.setupStateMachine();
    this.stateMachine.addState(EntityState.VAULT, new VaultState());
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
    this.checkSpecialAbility();

    // 更新撑杆位置跟随僵尸
    if (this.poleGraphics && this.active) {
      this.poleGraphics.x = this.x;
      this.poleGraphics.y = this.y;
    }
  }

  protected checkSpecialAbility(): void {
    // 只有还没跳过且没用过特殊能力时才检查
    if (
      !this.hasVaulted &&
      !this.usedSpecialAbility &&
      this.stateMachine.getCurrentState() === EntityState.WALK
    ) {
      const gameScene = this.scene as unknown as IGameScene;
      // 检查前方是否有植物
      gameScene.events.emit('zombie:check_vault', {
        zombie: this,
        x: this.x,
        row: this.row,
        callback: (hasPlant: boolean) => {
          if (hasPlant && !this.usedSpecialAbility) {
            this.stateMachine.changeState(EntityState.VAULT);
          }
        },
      });
    }
  }

  public discardPole(): void {
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
   * 销毁
   */
  public destroy(fromScene?: boolean): void {
    this.poleGraphics?.destroy();
    this.poleGraphics = null;
    super.destroy(fromScene);
  }
}

/**
 * 撑杆跳状态
 */
class VaultState implements IState<Zombie> {
  private trailTimer: Phaser.Time.TimerEvent | null = null;

  enter(zombie: Zombie) {
    const pvz = zombie as any;
    pvz.hasVaulted = true;
    pvz.usedSpecialAbility = true;

    // 播放撑杆跳音效
    pvz.audioManager?.playSfx(SoundEffect.POLE_VAULT);

    // 停止移动
    const body = pvz.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);

    // 创建残影定时器
    this.trailTimer = pvz.scene.time.addEvent({
      delay: 50,
      callback: () => this.createTrail(pvz),
      loop: true,
    });

    // 跳跃动画
    pvz.scene.tweens.add({
      targets: pvz,
      x: pvz.x - 80, // 向前跳过一个格子
      y: pvz.y - 80, // 跳起
      duration: 400,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // 落地
        pvz.scene.tweens.add({
          targets: pvz,
          y: pvz.y + 80,
          duration: 200,
          ease: 'Sine.easeIn',
          onComplete: () => {
            // 停止残影
            if (this.trailTimer) {
              this.trailTimer.remove();
              this.trailTimer = null;
            }

            // 恢复正常速度（变慢）
            pvz.currentSpeed = 20; // 普通僵尸速度
            pvz.stateMachine.changeState(EntityState.WALK);

            // 丢弃撑杆
            pvz.discardPole();
          },
        });
      },
    });

    // 旋转动画
    const rendererObj = pvz.renderer?.getObject() || pvz;
    pvz.scene.tweens.add({
      targets: rendererObj,
      angle: -360,
      duration: 600,
      ease: 'Power1',
    });
  }

  update() {}

  exit() {
    if (this.trailTimer) {
      this.trailTimer.remove();
      this.trailTimer = null;
    }
  }

  private createTrail(zombie: any): void {
    if (!zombie.active || !zombie.scene) return;

    const trail = zombie.scene.add.rectangle(
      zombie.x,
      zombie.y,
      40,
      80,
      0x8b5cf6,
      0.5
    );
    trail.setDepth(zombie.depth - 0.1);

    zombie.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      onComplete: () => trail.destroy(),
    });
  }
}
