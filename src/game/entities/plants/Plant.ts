import Phaser from 'phaser';
import type { PlantConfig } from '@/types/config';
import { GameEvents, EntityState } from '@/types/index';
import { AudioManager } from '@managers/AudioManager';
import { SoundEffect } from '@config/AudioConfig';
import { VisualEffects } from '@utils/VisualEffects';
import {
  IEntityRenderer,
  SpineRenderer,
  SpriteRenderer,
} from '../EntityRenderer';
import { StateMachine } from '../../utils/StateMachine';

export enum DamageState {
  HEALTHY,
  HURT,
  CRITICAL,
}

/**
 * 植物基类 (重构版：引入 FSM 状态机)
 */
export abstract class Plant extends Phaser.GameObjects.Sprite {
  protected config: PlantConfig;
  protected renderer: IEntityRenderer | null = null;
  public stateMachine: StateMachine; // 改为 public 以便 State 类访问

  protected row: number = 0;
  protected col: number = 0;
  protected currentHealth: number;
  protected isAlive: boolean = true;
  protected damageState: DamageState = DamageState.HEALTHY;

  protected audioManager: AudioManager | null = null;
  protected lastAttackTime: number = 0;
  protected attackTarget: Phaser.GameObjects.Sprite | null = null;
  protected isCooldown: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlantConfig) {
    super(scene, x, y, config.spriteSheet);
    this.config = config;
    this.currentHealth = config.health;
    this.audioManager = this.scene.game.registry.get(
      'audioManager'
    ) as AudioManager;

    this.stateMachine = new StateMachine();
    this.initRenderer();
    scene.add.existing(this);

    this.setDisplaySize(64, 74);
    this.init();
  }

  private initRenderer(): void {
    const spineKey = (this.config as any).spineKey;
    if (spineKey && (this.scene as any).spine) {
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
    this.stateMachine.changeState(EntityState.IDLE);
  }

  protected setupPhysics(): void {
    this.scene.physics.add.existing(this, true);
    (this.body as Phaser.Physics.Arcade.StaticBody)
      .setSize(60, 80)
      .setOffset(2, 10);
  }

  /**
   * 子类必须实现状态注册
   */
  protected abstract setupStateMachine(): void;

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.renderer instanceof SpineRenderer) {
      const obj = this.renderer.getObject();
      obj.setPosition(this.x, this.y).setDepth(this.depth);
    }
  }

  public update(time: number, delta: number): void {
    if (!this.isAlive) return;
    this.stateMachine.update(time, delta);
    this.updateSpecialAbility(time, delta);
  }

  protected updateSpecialAbility(_time: number, _delta: number): void {}

  public takeDamage(amount: number): void {
    if (!this.isAlive) return;
    if (Math.random() < 0.3) this.audioManager?.playSfx(SoundEffect.SPLAT);

    this.currentHealth -= amount;
    this.updateDamageState();
    this.showDamageEffect();

    if (this.currentHealth <= 0) {
      this.stateMachine.changeState(EntityState.DEAD);
    }
  }

  private updateDamageState(): void {
    const healthPercent = this.currentHealth / this.config.health;
    let newState = DamageState.HEALTHY;
    if (healthPercent < 0.35) newState = DamageState.CRITICAL;
    else if (healthPercent < 0.7) newState = DamageState.HURT;

    if (newState !== this.damageState) {
      this.damageState = newState;
      this.onDamageStateChange(newState);
    }
  }

  protected onDamageStateChange(state: DamageState): void {
    if (state === DamageState.HURT) this.renderer?.setTint(0xdddddd);
    else if (state === DamageState.CRITICAL) this.renderer?.setTint(0xaaaaaa);
  }

  protected showDamageEffect(): void {
    if (this.renderer instanceof SpriteRenderer)
      VisualEffects.flashSprite(this, 0xffffff, 80);
    VisualEffects.bounceScale(this, 1.05, 100);
  }

  public playAnimation(key: string, loop: boolean = true): void {
    this.renderer?.play(key, loop);
  }

  public die(): void {
    this.stateMachine.changeState(EntityState.DEAD);
  }

  public setAttackTarget(target: Phaser.GameObjects.Sprite | null): void {
    this.attackTarget = target;
    if (target && this.stateMachine.getCurrentState() === EntityState.IDLE) {
      this.stateMachine.changeState(EntityState.ATTACK);
    }
  }

  public setGridPosition(r: number, c: number): void {
    this.row = r;
    this.col = c;
  }
  public getRow(): number {
    return this.row;
  }
  public getCol(): number {
    return this.col;
  }
  public isPlantAlive(): boolean {
    return this.isAlive;
  }
  public getMaxHealth(): number {
    return this.config.health;
  }
  public getConfig(): PlantConfig {
    return this.config;
  }
}
