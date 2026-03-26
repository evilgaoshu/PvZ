import Phaser from 'phaser';
import type { ZombieConfig } from '@/types/config';
import { GameEvents, EntityState, IGameScene } from '@/types/index';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect } from '@config/AudioConfig';
import { VisualEffects } from '@utils/VisualEffects';
import {
  IEntityRenderer,
  SpineRenderer,
  SpriteRenderer,
} from '../EntityRenderer';
import { Plant } from '../plants/Plant';
import { StateMachine, IState } from '../../utils/StateMachine';

/**
 * 僵尸基类 (重构版：引入 FSM 状态机)
 */
export abstract class Zombie extends Phaser.Physics.Arcade.Sprite {
  public config: ZombieConfig;
  public renderer: IEntityRenderer | null = null;
  public stateMachine: StateMachine<Zombie>;

  protected currentHealth: number;
  public currentSpeed: number;
  protected isAlive: boolean = true;
  public isSlowed: boolean = false;
  protected slowedEndTime: number = 0;
  protected hasLostHead: boolean = false;
  protected isSwimming: boolean = false;
  protected hasReachedHouse: boolean = false;
  protected duckyTube: Phaser.GameObjects.Image | null = null;

  public audioManager: AudioManager | null = null;
  protected row: number = 0;
  public attackTarget: Plant | null = null;
  protected lastAttackTime: number = 0;
  protected nextGroanTime: number = 0;
  protected currentArmor: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZombieConfig) {
    super(scene, x, y, config.spriteSheet);
    this.config = config;
    this.currentHealth = config.health;
    this.currentSpeed = config.speed;
    this.currentArmor = config.armor || 0;
    this.audioManager = this.scene.game.registry.get(
      'audioManager'
    ) as AudioManager;

    this.stateMachine = new StateMachine<Zombie>(this);
    this.initRenderer();
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(64, 96);
    this.init();
  }

  private initRenderer(): void {
    const config = this.config as any;
    const spineKey = config.spineKey;
    const gameScene = this.scene as IGameScene;
    if (spineKey && gameScene.spine) {
      this.renderer = new SpineRenderer(
        this.scene,
        this.x,
        this.y,
        spineKey,
        spineKey
      );
      this.setAlpha(0);
    } else {
      this.renderer = new SpriteRenderer(this);
    }
  }

  protected init(): void {
    this.setupPhysics();
    this.setupStateMachine();
    VisualEffects.addShadow(this.scene, this);
    this.stateMachine.changeState(EntityState.WALK);
  }

  protected setupPhysics(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 80).setOffset(10, 10);
    body.allowGravity = false;
  }

  protected setupStateMachine(): void {
    this.stateMachine.addState(EntityState.WALK, new WalkState());
    this.stateMachine.addState(EntityState.ATTACK, new AttackState());
    this.stateMachine.addState(EntityState.DEAD, new DeadState());
  }

  public update(time: number, delta: number): void {
    if (!this.isAlive) return;

    if (this.renderer instanceof SpineRenderer) {
      const obj = this.renderer.getObject();
      obj.setPosition(this.x, this.y).setDepth(this.depth);
    }

    this.handleWaterLogic();

    if (this.duckyTube && this.active) {
      this.duckyTube.setPosition(this.x, this.y + 20);
      this.duckyTube.setDepth(this.depth + 0.1);
    }

    this.stateMachine.update(time, delta);
    if (this.isSlowed && time >= this.slowedEndTime) this.removeSlow();

    // 检查是否到达房屋
    if (this.x < 300 && !this.hasReachedHouse) {
      this.hasReachedHouse = true;
      this.scene.game.events.emit('zombie:reached_house', this);
      return;
    }
    if (time >= this.nextGroanTime) {
      if (Math.random() < 0.3)
        this.audioManager?.playSfx(SoundEffect.ZOMBIE_GROAN);
      this.nextGroanTime = time + Phaser.Math.Between(5000, 15000);
    }
  }

  private handleWaterLogic(): void {
    const gameScene = this.scene as IGameScene;
    const gridSystem = gameScene.gridSystem;
    if (!gridSystem) return;
    const gridPos = gridSystem.screenToGrid(this.x, this.y);
    const inWater = gridPos
      ? gridSystem.getTerrainType(gridPos.row, gridPos.col) === 'water'
      : false;

    if (inWater && !this.isSwimming) {
      this.isSwimming = true;
      if (!this.duckyTube) {
        this.duckyTube = this.scene.add.image(
          this.x,
          this.y + 20,
          'zombies/ducky_tube'
        );
      }
      this.duckyTube.setVisible(true);
      VisualEffects.createSplat(this.scene, this.x, this.y + 20, 0x0ea5e9, 15);
    } else if (!inWater && this.isSwimming) {
      this.isSwimming = false;
      this.duckyTube?.setVisible(false);
    }
  }

  public takeDamage(amount: number, type: string = 'normal'): void {
    if (!this.isAlive) return;

    if (this.currentArmor > 0) {
      this.currentArmor -= amount;
      if (this.currentArmor <= 0) {
        this.currentHealth += this.currentArmor;
        this.currentArmor = 0;
        this.onArmorBreak();
      }
    } else {
      this.currentHealth -= amount;
    }

    if (this.currentHealth <= this.config.health * 0.3 && !this.hasLostHead) {
      this.hasLostHead = true;
      this.loseHead();
    }

    VisualEffects.flashSprite(this, 0xffffff, 80);
    if (this.currentHealth <= 0) {
      this.stateMachine.changeState(EntityState.DEAD);
    }
  }

  private loseHead(): void {
    const head = this.scene.add.image(this.x, this.y - 30, 'zombies/head');
    head.setDepth(this.depth + 1);
    this.scene.tweens.add({
      targets: head,
      x: this.x + Phaser.Math.Between(20, 60),
      y: this.y + 40,
      angle: 360,
      duration: 800,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(2000, () => head.destroy());
      },
    });
    this.audioManager?.playSfx(SoundEffect.SPLAT);
  }

  protected onArmorBreak(): void {
    VisualEffects.createSplat(this.scene, this.x, this.y, 0x94a3b8, 10);
  }

  public startAttacking(target: Plant): void {
    if (this.hasLostHead || !this.isAlive) return;
    this.attackTarget = target;
    this.stateMachine.changeState(EntityState.ATTACK);
  }

  public applySlow(duration: number): void {
    this.isSlowed = true;
    this.slowedEndTime = this.scene.time.now + duration;
    this.setTint(0x00ffff);
  }

  protected removeSlow(): void {
    this.isSlowed = false;
    this.clearTint();
  }

  public getRow(): number {
    return this.row;
  }
  public setRow(row: number): void {
    this.row = row;
    this.setData('row', row);
  }
  public isZombieAlive(): boolean {
    return this.isAlive;
  }

  public playAnimation(key: string, loop: boolean = true) {
    this.renderer?.play(key, loop);
  }

  public playAnim(key: string, loop: boolean = true) {
    this.renderer?.play(`${this.config.id}_${key}`, loop);
  }

  public getConfig(): ZombieConfig {
    return this.config;
  }
}

/**
 * 状态具体实现
 */
class WalkState implements IState<Zombie> {
  enter(zombie: Zombie) {
    zombie.playAnim('walk', true);
  }
  update(zombie: Zombie) {
    const speed = zombie.isSlowed
      ? zombie.currentSpeed * 0.5
      : zombie.currentSpeed;
    const body = zombie.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocityX(-speed);
  }
  exit() {}
}

class AttackState implements IState<Zombie> {
  private lastAttackTime: number = 0;
  enter(zombie: Zombie) {
    const body = zombie.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocityX(0);
    zombie.playAnim('eat', true);
  }
  update(zombie: Zombie, time: number) {
    const target = zombie.attackTarget;
    if (!target || !target.active || !target.isPlantAlive()) {
      zombie.stateMachine.changeState(EntityState.WALK);
      return;
    }

    if (time - this.lastAttackTime >= zombie.getConfig().attackInterval) {
      this.lastAttackTime = time;
      target.takeDamage(zombie.getConfig().damage);
      zombie.scene.tweens.add({
        targets: zombie.renderer?.getObject() || zombie,
        x: '+=5',
        duration: 50,
        yoyo: true,
      });
    }
  }
  exit() {}
}

class DeadState implements IState<Zombie> {
  enter(zombie: Zombie) {
    (zombie as any).isAlive = false;
    const body = zombie.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocityX(0);
    zombie.audioManager?.playSfx(SoundEffect.ZOMBIE_DIE);
    zombie.playAnim('die', false);

    const z = zombie as any;
    if (z.duckyTube) z.duckyTube.destroy();

    zombie.scene.tweens.add({
      targets:
        zombie.renderer instanceof SpriteRenderer
          ? zombie
          : zombie.renderer?.getObject(),
      angle: -90,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        zombie.renderer?.destroy();
        zombie.destroy();
      },
    });

    zombie.scene.game.events.emit(GameEvents.ZOMBIE_DIED, {
      row: zombie.getRow(),
    });
  }
  update() {}
  exit() {}
}
